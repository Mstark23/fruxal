// =============================================================================
// lib/ai/memory.ts — AI Business Memory System
// =============================================================================
// Persistent memory per business. Every AI conversation reads before responding
// and writes after each exchange. Memories accumulate over time, creating an
// AI that genuinely knows each business deeply.
//
// Categories:
//   fact       — Concrete business facts ("owner salary is $85K", "fiscal year ends March")
//   preference — How the client likes to work ("prefers email", "hates being called before 10am")
//   decision   — Choices made ("agreed to pursue insurance first", "declined SR&ED")
//   insight    — AI-discovered patterns ("COGS jumped 8% in Q3", "always late on HST remittances")
//   concern    — Client worries/objections ("worried about the 12% fee", "burned by consultant in 2022")
//   relationship — Personal details ("wife handles bookkeeping", "planning to retire in 3 years")
//   action     — Things that need to happen ("follow up on insurance quote by March 15")
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";

export type MemoryCategory = "fact" | "preference" | "decision" | "insight" | "concern" | "relationship" | "action";

export interface Memory {
  id: string;
  category: MemoryCategory;
  content: string;
  source: string;
  importance: "critical" | "high" | "medium" | "low";
  tags: string[];
  created_at: string;
}

// ─── READ: Load all memories for a business ──────────────────────────────────
export async function loadMemories(opts: {
  businessId?: string | null;
  userId?: string | null;
  pipelineId?: string | null;
  limit?: number;
}): Promise<Memory[]> {
  const { businessId, userId, pipelineId, limit = 50 } = opts;

  // Build query — match on any of the IDs
  let query = supabaseAdmin
    .from("business_memories")
    .select("id, category, content, source, importance, tags, created_at")
    .order("importance", { ascending: true }) // critical first
    .order("created_at", { ascending: false })
    .limit(limit);

  if (businessId) query = query.eq("business_id", businessId);
  else if (userId) query = query.eq("user_id", userId);
  else if (pipelineId) query = query.eq("pipeline_id", pipelineId);
  else return []; // No identifier = no memories

  // Filter out expired memories
  query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

  const { data } = await query;
  return (data || []) as Memory[];
}

// ─── FORMAT: Build memory block for system prompt ────────────────────────────
export function formatMemoriesForPrompt(memories: Memory[]): string {
  if (memories.length === 0) return "";

  const grouped: Record<string, Memory[]> = {};
  for (const m of memories) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }

  const categoryLabels: Record<string, string> = {
    fact: "KNOWN FACTS",
    preference: "CLIENT PREFERENCES",
    decision: "DECISIONS MADE",
    insight: "AI INSIGHTS",
    concern: "CLIENT CONCERNS",
    relationship: "RELATIONSHIP CONTEXT",
    action: "PENDING ACTIONS",
  };

  let block = "\n\nBUSINESS MEMORY (from previous interactions):\n";
  for (const [cat, mems] of Object.entries(grouped)) {
    block += `\n${categoryLabels[cat] || cat.toUpperCase()}:\n`;
    for (const m of mems) {
      const imp = m.importance === "critical" ? "!!!" : m.importance === "high" ? "!!" : "";
      block += `- ${imp}${m.content}${imp ? " " + imp : ""}\n`;
    }
  }
  block += "\nIMPORTANT: Reference these memories naturally in your response. If a client previously expressed a concern, acknowledge you remember. If a decision was made, don't re-ask. If you know their preference, respect it.\n";

  return block;
}

// ─── WRITE: Extract and save new memories from a conversation ────────────────
export async function extractAndSaveMemories(opts: {
  businessId?: string | null;
  userId?: string | null;
  pipelineId?: string | null;
  source: string; // "customer_chat" | "rep_chat" | "accountant_chat" | "call_debrief" | "document_upload"
  userMessage: string;
  assistantResponse: string;
  existingMemories: Memory[];
}): Promise<void> {
  const { businessId, userId, pipelineId, source, userMessage, assistantResponse, existingMemories } = opts;

  // Use Claude to extract memories from the conversation
  try {
    const { callClaudeJSON } = await import("@/lib/ai/client");

    const existingFacts = existingMemories.map(m => m.content).join("\n");

    const result = await callClaudeJSON<{
      new_memories: Array<{
        category: MemoryCategory;
        content: string;
        importance: "critical" | "high" | "medium" | "low";
        tags: string[];
      }>;
    }>({
      system: `You are a memory extraction engine. Analyze the conversation and extract NEW facts, preferences, decisions, insights, concerns, or relationship details worth remembering for future conversations.

EXISTING MEMORIES (don't duplicate these):
${existingFacts || "None yet."}

RULES:
- Only extract information that is NEW — not already in existing memories
- Be specific: "Owner salary is $85K" not "Discussed salary"
- Include context: "Client declined SR&ED because they don't do R&D" not just "Declined SR&ED"
- Mark as "critical" only if it changes how we should interact with them
- Mark as "action" if something needs to happen ("follow up on insurance by March 15")
- Don't extract generic small talk — only business-relevant facts
- Maximum 5 new memories per exchange (quality over quantity)
- If nothing new was learned, return empty array

Categories: fact, preference, decision, insight, concern, relationship, action

Return JSON: { "new_memories": [{ "category", "content", "importance", "tags" }] }
Return empty array if nothing worth remembering: { "new_memories": [] }`,
      user: `USER: ${userMessage}\n\nASSISTANT: ${assistantResponse}`,
      maxTokens: 500,
    });

    const newMemories = result.new_memories || [];
    if (newMemories.length === 0) return;

    // Save to database
    const rows = newMemories.map(m => ({
      business_id: businessId || null,
      user_id: userId || null,
      pipeline_id: pipelineId || null,
      category: m.category,
      content: m.content,
      source,
      importance: m.importance,
      tags: m.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await supabaseAdmin.from("business_memories").insert(rows)
      .then(({ error }) => { if (error) console.warn("[Memory] Insert failed:", error.message); });

  } catch (e: any) {
    // Memory extraction is non-fatal — never block the main response
    console.warn("[Memory] Extraction failed:", e.message);
  }
}

// ─── DELETE: Remove a specific memory ────────────────────────────────────────
export async function deleteMemory(memoryId: string): Promise<void> {
  await supabaseAdmin.from("business_memories").delete().eq("id", memoryId);
}

// ─── CLEANUP: Remove expired or low-value memories ───────────────────────────
export async function cleanupMemories(businessId: string): Promise<number> {
  // Delete expired
  const { data: expired } = await supabaseAdmin
    .from("business_memories")
    .delete()
    .eq("business_id", businessId)
    .lt("expires_at", new Date().toISOString())
    .select("id");

  // If more than 100 memories, remove oldest low-importance ones
  const { data: all } = await supabaseAdmin
    .from("business_memories")
    .select("id")
    .eq("business_id", businessId);

  if ((all?.length || 0) > 100) {
    const { data: toDelete } = await supabaseAdmin
      .from("business_memories")
      .select("id")
      .eq("business_id", businessId)
      .eq("importance", "low")
      .order("created_at", { ascending: true })
      .limit((all?.length || 0) - 80); // Keep 80, delete oldest low-importance

    if (toDelete?.length) {
      await supabaseAdmin
        .from("business_memories")
        .delete()
        .in("id", toDelete.map(d => d.id));
    }
  }

  return (expired?.length || 0);
}

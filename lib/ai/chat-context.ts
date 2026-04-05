// =============================================================================
// lib/ai/chat-context.ts — Shared context builder for all customer chat routes
// =============================================================================
// Single source of truth for customer-facing AI chat context.
// Used by both streaming (/api/v2/ai-assistant/stream) and
// non-streaming (/api/v2/ai-assistant) routes.
// =============================================================================

import { supabaseAdmin } from "@/lib/supabase-admin";
import { loadMemories, formatMemoriesForPrompt } from "./memory";

export interface ChatContext {
  systemContext: string;
  starters: string[];
  repName: string | null;
  calendlyUrl: string | null;
  memories: any[];
}

export async function buildChatContext(userId: string): Promise<ChatContext> {
  const [profile, leaks, progress, pipeline, obligations, anomalies, memories, recentTopics] = await Promise.all([
    supabaseAdmin.from("business_profiles").select("business_name, industry, province, country, annual_revenue, employee_count, business_structure, has_accountant").eq("user_id", userId).maybeSingle().then(r => r.data),
    supabaseAdmin.from("detected_leaks").select("title, severity, category, annual_impact_min, annual_impact_max, status").eq("user_id", userId).order("annual_impact_max", { ascending: false }).limit(8).then(r => r.data || []),
    supabaseAdmin.from("user_progress").select("total_recovered, total_available, tasks_completed").eq("user_id", userId).maybeSingle().then(r => r.data),
    supabaseAdmin.from("tier3_pipeline").select("stage, follow_up_date, tier3_rep_assignments(tier3_reps(name, calendly_url))").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle().then(r => r.data),
    supabaseAdmin.from("user_obligations").select("obligation_slug, status, next_deadline, obligation_rules(title, penalty_max)").eq("user_id", userId).in("status", ["upcoming", "overdue"]).order("next_deadline").limit(5).then(r => r.data || []),
    supabaseAdmin.from("anomaly_alerts").select("title, severity, estimated_impact").eq("user_id", userId).eq("status", "new").limit(3).then(r => r.data || []),
    loadMemories({ userId, limit: 30 }),
    supabaseAdmin.from("business_memories").select("content, category").eq("user_id", userId).eq("source", "customer_chat").order("created_at", { ascending: false }).limit(20).then(r => r.data || []),
  ]);

  const country = profile?.country || "CA";
  const isUS = country === "US";
  const repName = (pipeline as any)?.tier3_rep_assignments?.[0]?.tier3_reps?.name || null;
  const calendlyUrl = (pipeline as any)?.tier3_rep_assignments?.[0]?.tier3_reps?.calendly_url || null;

  // Proactive alerts
  const proactiveAlerts: string[] = [];
  const upcomingDeadlines = (obligations as any[]).filter(o => {
    if (!o.next_deadline) return false;
    const days = Math.ceil((new Date(o.next_deadline).getTime() - Date.now()) / 86400000);
    return days <= 14;
  });
  if (upcomingDeadlines.length > 0) {
    proactiveAlerts.push(`DEADLINE ALERT: ${upcomingDeadlines.map(o => `${(o as any).obligation_rules?.title || o.obligation_slug} due ${o.next_deadline}${o.status === "overdue" ? " (OVERDUE!)" : ""} — penalty $${((o as any).obligation_rules?.penalty_max || 0).toLocaleString()}`).join("; ")}`);
  }
  if (anomalies.length > 0) {
    proactiveAlerts.push(`ANOMALY DETECTED: ${anomalies.map(a => `${a.title} (${a.severity}) — $${(a.estimated_impact || 0).toLocaleString()} impact`).join("; ")}`);
  }
  const recovered = progress?.total_recovered || 0;
  const available = progress?.total_available || 0;
  if (recovered > 0 && recovered >= available * 0.5) {
    proactiveAlerts.push(`MILESTONE: Client has recovered 50%+ of identified savings ($${recovered.toLocaleString()} of $${available.toLocaleString()})`);
  }

  // Cross-session intelligence: detect repeated topics
  const topicCounts: Record<string, number> = {};
  for (const m of recentTopics) {
    const words = m.content.toLowerCase();
    for (const topic of ["processing", "insurance", "tax", "fee", "accountant", "rep", "deadline", "program", "grant"]) {
      if (words.includes(topic)) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  }
  const repeatedTopics = Object.entries(topicCounts).filter(([, c]) => c >= 3).map(([t]) => t);

  // Build smart starters
  const starters: string[] = [];
  if (anomalies.length > 0) {
    starters.push(`What's going on with the ${anomalies[0].title.toLowerCase()}?`);
  }
  if (upcomingDeadlines.length > 0 && upcomingDeadlines[0].status === "overdue") {
    starters.push(`My ${(upcomingDeadlines[0] as any).obligation_rules?.title || "filing"} is overdue — what do I do?`);
  } else if (upcomingDeadlines.length > 0) {
    starters.push(`What do I need to do before my ${(upcomingDeadlines[0] as any).obligation_rules?.title || "deadline"}?`);
  }
  if (leaks.length > 0) {
    starters.push(`What does "${leaks[0].title}" mean for my business?`);
    if (leaks.length > 1) starters.push("Which leak should I fix first?");
  }
  if (recovered > 0) {
    starters.push("What's my recovery progress so far?");
  } else if (available > 0) {
    starters.push("How does the recovery process work?");
  }
  starters.push(isUS ? "What tax credits do I qualify for?" : "What government programs can I access?");

  const memoryBlock = formatMemoriesForPrompt(memories);

  return {
    systemContext: `
BUSINESS: ${profile?.business_name || "Unknown"} (${profile?.industry || "Unknown"}, ${profile?.province || "?"} ${country})
Revenue: $${(profile?.annual_revenue || 0).toLocaleString()} | Employees: ${profile?.employee_count ?? 0}
Structure: ${profile?.business_structure || "Unknown"} | Has Accountant: ${profile?.has_accountant ? "Yes" : "No"}
${repName ? `Rep: ${repName}` : "No rep assigned yet"}

LEAKS (${leaks.length}):
${leaks.slice(0, 6).map(l => `- [${l.severity}] ${l.title}: $${(l.annual_impact_max || l.annual_impact_min || 0).toLocaleString()}/yr [${l.status}]`).join("\n") || "None."}

RECOVERY: $${recovered.toLocaleString()} recovered / $${available.toLocaleString()} available
Tasks Completed: ${progress?.tasks_completed || 0}

UPCOMING DEADLINES:
${upcomingDeadlines.map(o => `- ${(o as any).obligation_rules?.title || o.obligation_slug}: ${o.next_deadline} ${o.status === "overdue" ? "OVERDUE" : ""}`).join("\n") || "None in next 14 days."}

${proactiveAlerts.length > 0 ? `\nPROACTIVE ALERTS (mention these naturally if relevant to the conversation):\n${proactiveAlerts.map(a => `- ${a}`).join("\n")}` : ""}

${repeatedTopics.length > 0 ? `\nPATTERN DETECTED: Client has asked about "${repeatedTopics.join('", "')}" multiple times across conversations. This seems important to them — prioritize these topics and acknowledge you remember their interest.` : ""}

Country: ${isUS ? "US" : "Canada"} — use ${isUS ? "IRS/CPA" : "CRA/accountant"} terminology
${memoryBlock}
`.trim(),
    starters: starters.slice(0, 5),
    repName,
    calendlyUrl,
    memories,
  };
}

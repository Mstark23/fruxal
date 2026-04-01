// =============================================================================
// POST /api/v2/transcript-analyze — Meeting Transcript / Call Notes Analyzer
// =============================================================================
// Rep pastes call notes or transcript → Claude extracts:
// key objections, agreed next steps, competitors mentioned, sentiment,
// and auto-fills the debrief form data.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { callClaudeJSON } from "@/lib/ai/client";

export const maxDuration = 20;

export async function POST(req: NextRequest) {
  const auth = await requireRep(req);
  if (!auth.authorized) return auth.error!;

  try {
    const { transcript, pipelineId } = await req.json();
    if (!transcript?.trim()) return NextResponse.json({ error: "Transcript or call notes required" }, { status: 400 });

    const result = await callClaudeJSON<{
      summary: string;
      call_outcome: "ready_to_sign" | "needs_time" | "not_interested" | "follow_up";
      sentiment: "positive" | "neutral" | "skeptical" | "negative";
      sentiment_score: number; // 1-10
      key_objections: string[];
      agreed_next_steps: string[];
      competitors_mentioned: string[];
      findings_discussed: string[];
      client_concerns: string;
      internal_notes: string;
      follow_up_date_suggestion: string | null;
      urgency: "high" | "medium" | "low";
    }>({
      system: `You are analyzing a sales/recovery call transcript or notes from a Fruxal rep's client meeting.

Extract structured data that auto-fills the debrief form and helps the rep plan next steps.

Rules:
- Be accurate — don't invent things not in the transcript
- For sentiment_score: 1 = hostile, 5 = neutral, 10 = enthusiastic
- For call_outcome: "ready_to_sign" if they explicitly agreed, "needs_time" if positive but not committed, "not_interested" if declining, "follow_up" if inconclusive
- For follow_up_date_suggestion: suggest a date based on what was discussed (e.g., "mentioned next Tuesday" → suggest that date, otherwise suggest 3 business days from now as YYYY-MM-DD)
- key_objections: verbatim or paraphrased concerns the client raised
- agreed_next_steps: what both parties committed to do
- findings_discussed: which financial findings/leaks were specifically mentioned
- internal_notes: anything the rep should remember that the client shouldn't see
- Keep summary to 2-3 sentences

Return the JSON structure specified.`,
      user: `Analyze this call transcript/notes:\n\n${transcript.slice(0, 5000)}`,
      maxTokens: 800,
    });

    return NextResponse.json({
      success: true,
      analysis: result,
      pipelineId,
    });
  } catch (err: any) {
    console.error("[TranscriptAnalyze]", err.message);
    return NextResponse.json({ error: "Transcript analysis failed" }, { status: 500 });
  }
}

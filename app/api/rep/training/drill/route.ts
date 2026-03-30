// =============================================================================
// app/api/rep/training/drill/route.ts
// Powers the AI objection drill tool for Fruxal reps.
// Claude plays the prospect. After each rep response, Claude also plays coach
// and scores the rep on the Straight Line Persuasion system (1–10).
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import Anthropic from "@anthropic-ai/sdk";


const DIFFICULTY_INSTRUCTIONS: Record<string, string> = {
  warm: "You are open and curious. You have some concerns but you're not hostile. You ask reasonable questions and can be moved by a logical, confident rep. You convert after 4–6 solid exchanges.",
  resistant: "You are skeptical and protective of your time and money. You raise standard objections: 'Why should I trust you?', 'The numbers seem off', '12% is too much', 'I need to think about it'. You can be converted but require real confidence and certainty transfer. You convert after 6–8 strong exchanges.",
  hostile: "You are guarded, dismissive, and challenging. You interrupt, question everything, use sarcasm, and push hard on every objection. Your threshold is very high — the rep must be exceptional to move you. Maintain pressure throughout. If the rep stumbles badly, you hang up.",
};

const SCENARIO_CONTEXT: Record<string, string> = {
  prescan_call: "The rep is calling because you did a prescan and saw your business is leaking a significant amount annually. You haven't booked a call yet. You're curious but skeptical about whether these numbers are real and whether Fruxal can actually recover the money.",
  intake_call: "You've completed a full intake. The rep is reviewing your diagnostic findings with you and trying to get you to sign a recovery agreement. Your main concern is the 12% fee — you're wondering if you could just do this yourself.",
  cold_outreach: "You've never heard of Fruxal. The rep cold-called you. You're protective of your time. You need a very compelling reason to engage at all.",
  no_show: "You booked a call with this rep and didn't show up. You feel slightly guilty but also a bit defensive about it. You're open to rescheduling if the rep handles this well.",
  post_diagnostic: "You've reviewed the diagnostic report sent to you. The numbers are interesting but you're skeptical — you want proof that recovery is actually possible before signing anything.",
};

function buildProspectSystem(persona: string, scenario: string, difficulty: string): string {
  const difficultyInstructions = DIFFICULTY_INSTRUCTIONS[difficulty] || DIFFICULTY_INSTRUCTIONS.resistant;
  const scenarioContext = SCENARIO_CONTEXT[scenario] || "";

  return `You are roleplaying as a Canadian small business owner in a sales call with a Fruxal recovery rep.

PERSONA: ${persona}

YOUR SITUATION: ${scenarioContext}

DIFFICULTY MODE: ${difficultyInstructions}

FRUXAL CONTEXT (what you know/believe):
- Fruxal finds financial leaks in businesses and recovers money on contingency
- They charge 12% of confirmed savings only — no upfront cost
- A rep + accountant handle all CRA correspondence, vendor negotiations, grant applications
- You do nothing until money is in your account

RULES:
- Stay in character as this specific business owner — use their voice, concerns, and personality
- Raise realistic objections relevant to your persona and scenario
- Never break character or acknowledge this is a roleplay
- Keep responses to 1–3 sentences max — you're a busy business owner
- React authentically to how confident and compelling the rep is
- If the rep is exceptional (certainty transferred, all three 10s addressed), you can start to warm up or even agree to next steps
- If the rep is weak, raise harder objections or get less interested

Respond ONLY as the prospect. Nothing else.`;
}

function buildCoachSystem(): string {
  return `You are a Straight Line Persuasion sales coach evaluating a Fruxal recovery rep's response in a live objection drill.

THE THREE 10s (what the rep must transfer certainty on):
1. The Rep — prospect must trust them personally (warmth, confidence, competence)
2. Fruxal — prospect must trust the company (credibility, track record, model)
3. The Numbers — prospect must believe the recovery amount is real and achievable

SCORING RUBRIC (1–10):
10: Perfect — certainty transferred on relevant 10, objection elegantly dissolved, forward momentum created
9: Excellent — strong certainty transfer, minor polish needed
8: Strong — good direction, logical + emotional appeal, small gap
7: Good — mostly right, some threshold left unaddressed
6: Developing — reasonable response but not compelling, certainty not transferred
5: Weak — too passive, vague, or logical without emotion
4: Poor — missed the objection entirely or made it worse
3: Bad — created resistance, sounded scripted or defensive
1–2: Damaging — alienated prospect, raised alarm bells, or showed no knowledge of SLP

EVALUATION CRITERIA:
- Did they match the prospect's emotional state before trying to move them?
- Did they address the specific objection without being defensive?
- Did they move toward certainty on one or more of the Three 10s?
- Did they use forward momentum (assumptive language, next step)?
- Was the response natural, confident, and specific (not generic)?

RESPONSE FORMAT (strict JSON):
{
  "score": <number 1-10>,
  "coaching": "<2-3 sentence coaching note — specific, actionable, direct. Name what they did right AND what to improve. Reference Straight Line principles by name when relevant.>",
  "closed": <boolean — true only if the prospect has clearly agreed to move forward>
}`;
}

export async function POST(req: NextRequest) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const auth = await requireRep(req);
    if (!auth.authorized) {
      return auth.error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, scenario, difficulty, persona, openingLine, history, repResponse, turn } = body;

    // === OPEN: send opening line ===
    if (action === "open") {
      return NextResponse.json({ prospectMessage: openingLine || "Hello?" });
    }

    // === RESPOND: rep sends message, get prospect + coach response ===
    if (action === "respond") {
      const prospectMessages = (history || [])
        .filter((m: any) => m.role !== "coach")
        .map((m: any) => ({
          role: m.role === "rep" ? "user" : "assistant",
          content: m.content,
        }));

      // Get coach evaluation first (fast, structured)
      const coachRes = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: buildCoachSystem(),
        messages: [
          {
            role: "user",
            content: `Scenario: ${scenario}\nDifficulty: ${difficulty}\nProspect persona: ${persona}\n\nConversation so far:\n${(history || []).slice(0, -1).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}\n\nRep's latest response: "${repResponse}"\n\nScore and coach this response.`,
          },
        ],
      });

      let score = 5;
      let coaching = "Keep building certainty. Stay focused on the Three 10s.";
      let closed = false;

      try {
        const raw = coachRes.content[0]?.type === "text" ? coachRes.content[0].text : "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          score = Math.min(10, Math.max(1, Number(parsed.score) || 5));
          coaching = parsed.coaching || coaching;
          closed = !!parsed.closed;
        }
      } catch { /* use defaults */ }

      // If closed or last turn, skip prospect response
      if (closed || turn >= 8) {
        return NextResponse.json({ score, coaching, closed: true, prospectResponse: "" });
      }

      // Get prospect response
      const prospectRes = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 120,
        system: buildProspectSystem(persona, scenario, difficulty),
        messages: [
          ...prospectMessages,
          { role: "user", content: repResponse },
        ],
      });

      const prospectResponse = prospectRes.content[0]?.type === "text"
        ? prospectRes.content[0].text
        : "...";

      return NextResponse.json({ score, coaching, closed, prospectResponse });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err: any) {
    console.error("[rep/training/drill]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

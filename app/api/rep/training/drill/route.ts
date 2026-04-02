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
  return `You are a Straight Line Persuasion coach evaluating a Fruxal recovery rep's response in a live drill.

You are coaching based on Jordan Belfort's Straight Line Persuasion System. You know the entire methodology deeply.

THE STRAIGHT LINE SYSTEM:
- Every sale is a straight line from open to close
- The prospect tries to take the rep OFF the line (tangents, stalls, objections)
- The rep must answer and redirect BACK to the line
- Between the boundaries: build rapport + gather intelligence

THE THREE 10s (certainty the rep must create):
1. YOU (The Rep) — "Do I trust this person? Are they sharp, enthusiastic, a force to be reckoned with? Do they care about me?"
2. FRUXAL (The Company) — "Is this company legit? Will they deliver? Is the contingency model real?"
3. THE NUMBERS (The Product) — "Are the leak amounts real? Can they actually recover this? Is the math right?"

THE 4-SECOND RULE:
In the first 4 seconds, the rep must establish: Enthusiastic, Sharp as a Tack, Force to be Reckoned With.

8 TONAL PATTERNS TO EVALUATE:
1. Scarcity (lower voice, urgency, secret)
2. Reasonable Man ("no big deal" tone)
3. Absolute Certainty (hard, definitive)
4. "I Care" (empathy, matching emotion)
5. Question as Declarative (up-tone on statements)
6. Presupposing (future-pacing past the close)
7. "I Really Want to Know" (genuine engagement)
8. Series of Up-Tones (stacking micro-agreements)

LOOPING — KEY TECHNIQUE:
When prospect objects: Acknowledge → Deflect with empathy → Loop BACK to whichever of the Three 10s is weak → Rebuild certainty → Ask for close again.
The rep should NEVER just answer and move forward. They must loop backward.

ACTION THRESHOLD:
The rep's job is to LOWER the prospect's action threshold, not overcome it.
Tools: remove risk, make it easy, create urgency, offer small first step.
Fruxal's advantage: contingency model = ultimate threshold lowerer.

POWER LANGUAGE TO REWARD:
- Minimizers: "just", "only", "simply"
- Justifiers: "so that", "because", "the reason"
- Reframers: "It's not X, it's Y"
- Presupposing: "When we start..." not "If you decide..."
- Fee reframe: "It's not 12% vs 0%, it's 88% kept vs 100% lost"

SCORING RUBRIC (1-10):
10: Straight Line mastery — all three elements: looped correctly, used right tonal pattern, transferred certainty, created forward momentum
9: Excellent — strong certainty transfer, correct loop structure, minor tonal polish needed
8: Strong — right direction, used a loop, addressed the correct 10, slight gap
7: Good — mostly right but didn't loop back, or answered logically without emotional match
6: Developing — reasonable but generic, didn't identify which 10 was weak, no forward momentum
5: Weak — too passive, vague, or sounded like reading a script
4: Poor — missed the objection, got defensive, or went off the line
3: Bad — created MORE resistance, attacked the prospect's position
1-2: Damaging — broke rapport, sounded robotic, or showed zero understanding of SLP

WHAT TO SPECIFICALLY EVALUATE:
1. Did they MATCH the prospect's emotional state before trying to move them? (I Care tone first)
2. Did they identify WHICH of the Three 10s was weak?
3. Did they LOOP backward to rebuild certainty on that specific 10?
4. Did they use appropriate TONAL PATTERN? (Name which one they should have used)
5. Did they use POWER WORDS (minimizers, justifiers, reframers)?
6. Did they create FORWARD MOMENTUM toward the close?
7. Did they lower the ACTION THRESHOLD? (remove risk, make it easy, small first step)
8. Were they SPECIFIC with the prospect's actual numbers, not generic?

RESPONSE FORMAT (strict JSON):
{
  "score": <number 1-10>,
  "coaching": "<2-3 sentences. Be direct. Name the specific SLP principle they used or missed. Say which of the Three 10s they should have targeted. Name the tonal pattern they should have used. Reference looping if relevant.>",
  "better_response": "<If score is 7 or below, write the EXACT words the rep SHOULD have said. Include tonal direction in brackets like [I Care tone] or [Absolute Certainty]. This must be a complete, word-for-word response they can memorize and use. If score is 8+, set to null.>",
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
      let betterResponse: string | null = null;
      let closed = false;

      try {
        const raw = coachRes.content[0]?.type === "text" ? coachRes.content[0].text : "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          score = Math.min(10, Math.max(1, Number(parsed.score) || 5));
          coaching = parsed.coaching || coaching;
          betterResponse = parsed.better_response || null;
          closed = !!parsed.closed;
        }
      } catch { /* use defaults */ }

      // If closed or last turn, skip prospect response
      if (closed || turn >= 8) {
        return NextResponse.json({ score, coaching, betterResponse, closed: true, prospectResponse: "" });
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

      return NextResponse.json({ score, coaching, betterResponse, closed, prospectResponse });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err: any) {
    console.error("[rep/training/drill]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

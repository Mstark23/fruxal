// =============================================================================
// app/api/rep/training/drill/route.ts
// Powers the AI objection drill tool for Fruxal reps.
// Claude plays the prospect. After each rep response, Claude also plays coach
// and scores the rep on the Straight Line Persuasion system (1–10).
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { requireRep } from "@/lib/rep-auth";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/ai/client";
import { getIndustryScenario } from "@/lib/rep/industry-scenarios";


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

function buildProspectSystem(persona: string, scenario: string, difficulty: string, industry?: string): string {
  const difficultyInstructions = DIFFICULTY_INSTRUCTIONS[difficulty] || DIFFICULTY_INSTRUCTIONS.resistant;
  const scenarioContext = SCENARIO_CONTEXT[scenario] || "";

  // Build industry-specific context if provided
  let industryContext = "";
  if (industry) {
    const indScenario = getIndustryScenario(industry);
    if (indScenario) {
      const painPointsList = indScenario.painPoints.slice(0, 3).join(", ");
      const objectionsList = indScenario.objections.slice(0, 3).map(o => o.objection).join("; ");
      const topCategory = indScenario.topLeakCategories[0]?.category || "costs";
      const skepticismEntries = Object.entries(
        // Build skepticism from objections — use the first objection response as a skeptical pushback
        indScenario.topLeakCategories.reduce((acc, lc) => {
          acc[lc.category] = `I already handle ${lc.category.replace(/_/g, " ")} — what could you possibly find that I haven't already looked at?`;
          return acc;
        }, {} as Record<string, string>)
      );
      const topSkepticism = skepticismEntries[0];

      industryContext = `
INDUSTRY CONTEXT:
- You are a ${indScenario.name} business owner in ${indScenario.seasonalNotes ? indScenario.name : "Canada"}
- Your main concerns are: ${painPointsList}
- You'll raise these specific objections: ${objectionsList}
- When they mention ${topCategory.replace(/_/g, " ")}, push back with: '${topSkepticism ? topSkepticism[1] : "I already watch that like a hawk."}'
- Your industry leaks about ${indScenario.benchmarks.avgLeakPct}% on average, but you don't believe that applies to you
- The decision maker in your business is typically: ${indScenario.decisionMakers}`;
    }
  }

  return `You are roleplaying as a Canadian small business owner in a sales call with a Fruxal recovery rep.

PERSONA: ${persona}
${industryContext}

YOUR SITUATION: ${scenarioContext}

DIFFICULTY MODE: ${difficultyInstructions}

FRUXAL CONTEXT (what you know/believe):
- Fruxal finds financial leaks in businesses and recovers money on contingency
- They charge 12% of confirmed savings only — no upfront cost
- A rep + accountant handle all CRA correspondence, vendor negotiations, grant applications
- You do nothing until money is in your account

RULES:
- Stay in character as this specific business owner — use their voice, concerns, and personality
- Raise realistic objections relevant to your persona and scenario${industry ? "\n- Prioritize industry-specific objections and concerns over generic ones" : ""}
- Never break character or acknowledge this is a roleplay
- Keep responses to 1–3 sentences max — you're a busy business owner
- React authentically to how confident and compelling the rep is
- If the rep is exceptional (certainty transferred, all three 10s addressed), you can start to warm up or even agree to next steps
- If the rep is weak, raise harder objections or get less interested

Respond ONLY as the prospect. Nothing else.`;
}

function buildCombinedSystem(persona: string, scenario: string, difficulty: string, industry?: string): string {
  const prospectSystem = buildProspectSystem(persona, scenario, difficulty, industry);

  // Build industry-specific coaching context
  let industryCoaching = "";
  if (industry) {
    const indScenario = getIndustryScenario(industry);
    if (indScenario) {
      const topOpener = indScenario.topLeakCategories[0]?.opener || "";
      industryCoaching = `
INDUSTRY-SPECIFIC COACHING:
- The rep is calling a ${indScenario.name} prospect. Industry-specific best practices: ${indScenario.competitiveAngle}
- For this industry, the strongest opener is: "${topOpener}"
- Key leak categories to reference: ${indScenario.topLeakCategories.map(lc => `${lc.category.replace(/_/g, " ")} (${lc.typicalAmountRange})`).join(", ")}
- Common industry objections the rep should anticipate: ${indScenario.objections.slice(0, 3).map(o => `"${o.objection}"`).join(", ")}
- Seasonal notes: ${indScenario.seasonalNotes}
- When scoring, reward the rep for using industry-specific language, numbers, and pain points rather than generic pitches.
`;
    }
  }

  return `You are playing two roles simultaneously:

ROLE 1 — PROSPECT: Respond in-character as the prospect. Stay in the scenario.

${prospectSystem}

ROLE 2 — COACH: After your prospect response, evaluate the rep's last message using Straight Line Persuasion.
${industryCoaching}

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

Return JSON:
{
  "prospect_response": "What the prospect says next (1-3 sentences, in character)",
  "score": 1-10,
  "coaching": "Brief SLP coaching note (2-3 sentences)",
  "better_response": "What the rep should have said (only if score <= 7, else null)",
  "closed": true/false
}

Respond with ONLY valid JSON. No markdown fences. No preamble.`;
}

export async function POST(req: NextRequest) {
  const client = getAnthropicClient();

  try {
    const auth = await requireRep(req);
    if (!auth.authorized) {
      return auth.error || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, scenario, difficulty, persona, openingLine, history, repResponse, turn, industry } = body;

    // === OPEN: send opening line ===
    if (action === "open") {
      return NextResponse.json({ prospectMessage: openingLine || "Hello?" });
    }

    // === RESPOND: rep sends message, get prospect + coach in ONE call ===
    if (action === "respond") {
      const conversationContext = (history || [])
        .filter((m: any) => m.role !== "coach")
        .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");

      const combinedRes = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        system: buildCombinedSystem(persona, scenario, difficulty, industry),
        messages: [
          {
            role: "user",
            content: `Scenario: ${scenario}\nDifficulty: ${difficulty}\nProspect persona: ${persona}\nTurn: ${turn}/8\n\nConversation so far:\n${conversationContext}\n\nRep's latest response: "${repResponse}"\n\nPlay the prospect AND score the rep. Return JSON only.`,
          },
        ],
      });

      let score = 5;
      let coaching = "Keep building certainty. Stay focused on the Three 10s.";
      let betterResponse: string | null = null;
      let closed = false;
      let prospectResponse = "...";

      try {
        const raw = combinedRes.content[0]?.type === "text" ? combinedRes.content[0].text : "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          prospectResponse = parsed.prospect_response || "...";
          score = Math.min(10, Math.max(1, Number(parsed.score) || 5));
          coaching = parsed.coaching || coaching;
          betterResponse = parsed.better_response || null;
          closed = !!parsed.closed;
        }
      } catch { /* use defaults */ }

      // If closed or last turn, mark as finished
      if (closed || turn >= 8) {
        return NextResponse.json({ score, coaching, betterResponse, closed: true, prospectResponse: "" });
      }

      return NextResponse.json({ score, coaching, betterResponse, closed, prospectResponse });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (err: any) {
    console.error("[rep/training/drill]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

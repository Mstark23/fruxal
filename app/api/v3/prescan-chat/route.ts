/**
 * API Route: /api/v3/prescan-chat
 * 
 * Adaptive prescan chat with industry-specific questions
 * Creates temporary business/user for testing
 * Supports bilingual (EN/FR) based on lang parameter
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PRESCAN_SYSTEM_PROMPT } from '@/lib/ai/prompts/prescan/system';
import { validatePrescanData, buildValidationFollowUp } from '@/services/prescan-validator';
import { runPrescanForBusiness, PrescanTags } from '@/services/prescan-engine-v3';
import { getLeakExplanation } from '@/lib/leak-explanations';
import { randomUUID } from 'crypto';

// ════════════════════════════════════════════════════════════════
// LEAK EXPLANATION BUILDER
// Generates human-readable proof for each detected leak
// ════════════════════════════════════════════════════════════════


const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ─── Rate limiter: 10 requests per minute per IP ─── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (entry.resetAt < now) rateLimitMap.delete(ip);
  }
}, 300_000);

/* ─── Language instruction prepended to system prompt ─── */
function buildSystemPrompt(lang: string): string {
  if (lang === "fr") {
    return `CRITICAL LANGUAGE INSTRUCTION: You MUST speak French from your very first message. Every word the user sees must be in French — professional, clear Quebec French. Always use "vous", never "tu". Data tags (<collected>, <set_*>, <run_analysis />) stay in English (machine-readable). Everything else: French only. Never call yourself a financial advisor — you are Fruxal.

Your first message MUST be in French. Example opening: "Bonjour ! Je suis Fruxal, votre assistant diagnostic. Je vais vous poser quelques questions rapides pour comprendre votre entreprise et identifier où vous perdez probablement de l'argent. Commençons — quel type d'entreprise avez-vous ?"

${PRESCAN_SYSTEM_PROMPT}`;
  }

  return PRESCAN_SYSTEM_PROMPT;
}

export const maxDuration = 60; // Vercel function timeout (seconds)

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 requests/minute per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { sessionId, message, history, lang } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Build conversation history for Claude
    const messages: Anthropic.MessageParam[] = [
      ...((history || []) as Anthropic.MessageParam[]),
      {
        role: 'user' as const,
        content: message,
      },
    ];
    
    // Call Claude API with language-aware system prompt
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: buildSystemPrompt(lang || "en"),
      messages,
    });
    
    const assistantMessage = response.content[0];
    if (assistantMessage.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }
    
    const responseText = assistantMessage.text;
    
    // Parse tags from ALL assistant messages (Q1-Q5), not just the last one
    // Tags from business_type, province, revenue were emitted in earlier responses
    const allAssistantTexts: string[] = [];
    for (const msg of (history || [])) {
      if ((msg as any).role === 'assistant' && typeof (msg as any).content === 'string') {
        allAssistantTexts.push((msg as any).content);
      }
    }
    allAssistantTexts.push(responseText); // Add current response
    
    const tags = parseTags(allAssistantTexts.join('\n'));
    
    // Check if analysis should run
    const shouldRunAnalysis = /<run_analysis\s*\/>/.test(responseText);
    
    let analysis = null;
    let prescanRunId = null;
    let tier = null;
    let pricing = null;
    let validationFailed = false;
    let validationMessage = '';
    let validationRawMessage = '';
    
    if (shouldRunAnalysis) {
      // ═══ VALIDATION GATE ═══
      // Check data quality before running the engine
      process.env.NODE_ENV !== "production" && console.log('🔍 Analysis requested — validating data first...');
      process.env.NODE_ENV !== "production" && console.log('📋 Tags collected:', JSON.stringify(tags, null, 2));
      
      const validation = validatePrescanData(tags);
      
      if (!validation.valid) {
        // Data issues found — ask user to correct
        process.env.NODE_ENV !== "production" && console.log('⚠️ Validation failed:', validation.issues.map(i => `${i.severity}: ${i.field}`).join(', '));
        
        const followUpPrompt = buildValidationFollowUp(validation.issues, lang || 'en');
        
        // Call Claude again with the validation context to generate a natural follow-up
        try {
          const followUpMessages: Anthropic.MessageParam[] = [
            ...((history || []) as Anthropic.MessageParam[]),
            { role: 'user' as const, content: message },
            { role: 'assistant' as const, content: responseText },
            { role: 'user' as const, content: followUpPrompt },
          ];
          
          const followUpResponse = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 512,
            system: buildSystemPrompt(lang || 'en'),
            messages: followUpMessages,
          });
          
          const followUpText = followUpResponse.content[0];
          if (followUpText.type === 'text') {
            validationMessage = cleanTagsFromText(followUpText.text);
            validationRawMessage = followUpText.text;
          }
        } catch (followUpError: any) {
          // If follow-up call fails, build a simple message from the issues
          const isFR = lang === 'fr';
          const issueTexts = validation.issues.map(i => isFR ? i.message_fr : i.message_en);
          validationMessage = isFR
            ? `Avant de lancer l'analyse, j'ai besoin d'une petite précision : ${issueTexts.join(' ')}`
            : `Before I run the analysis, I need a quick clarification: ${issueTexts.join(' ')}`;
          validationRawMessage = validationMessage;
        }
        
        validationFailed = true;
      }
      
      // ═══ SUSPICIOUS DATA — log but don't block ═══
      const suspicious = validation.issues.filter(i => i.severity === 'suspicious');
      if (suspicious.length > 0 && validation.valid) {
        process.env.NODE_ENV !== "production" && console.log('⚡ Suspicious data (non-blocking):', suspicious.map(i => `${i.field}: ${i.message_en}`).join('; '));
      }
    }
    
    // If validation failed, return the follow-up message instead of analysis
    if (validationFailed) {
      // Combine the original summary message with the validation follow-up
      const cleanOriginal = cleanTagsFromText(responseText);
      const combinedMessage = validationMessage || cleanOriginal;
      const combinedRaw = validationRawMessage || responseText;
      
      return NextResponse.json({
        sessionId: sessionId || null,
        message: combinedMessage,
        rawMessage: combinedRaw,
        tags,
        analysis: null,
        prescanRunId: null,
        tier: null,
        pricing: null,
        completed: false, // NOT completed — user needs to respond
        validationRetry: true, // Signal to frontend this is a retry
      });
    }
    
    if (shouldRunAnalysis) {
      try {
        process.env.NODE_ENV !== "production" && console.log('✅ Validation passed! Running prescan engine...');
        
        // Detect logged-in user (optional — prescan works without auth)
        let realUserId: string | null = null;
        try {
          const session = await getServerSession(authOptions);
          if (session?.user) {
            realUserId = (session.user as any).id || null;
            process.env.NODE_ENV !== "production" && console.log('🔑 Logged-in user detected:', realUserId);
          }
        } catch { /* Auth check is optional — don't block prescan */ }
        
        const tempUserId = randomUUID();
        const tempBusinessId = randomUUID();
        const engineUserId = realUserId || tempUserId;
        
        // ═══ STEP 1: RUN ENGINE (pure computation — never fails) ═══
        const result = await runPrescanForBusiness(
          supabase as any,
          tempBusinessId,
          engineUserId,
          tags
        );
        
        process.env.NODE_ENV !== "production" && console.log('✅ Prescan engine completed!');
        process.env.NODE_ENV !== "production" && console.log('📈 FH Score:', result.fhScore);
        process.env.NODE_ENV !== "production" && console.log('💰 Total Leak:', result.leaks.reduce((sum, l) => sum + l.estimated_annual_leak, 0));
        process.env.NODE_ENV !== "production" && console.log('🔍 Leaks found:', result.leaks.length);
        
        prescanRunId = result.prescanRunId;
        tier = result.tier;
        pricing = result.pricing;
        
        // Format analysis for frontend
        analysis = {
          fhScore: result.fhScore,
          dhScore: result.dhScore,
          totalLeak: result.leaks.reduce((sum, l) => sum + l.estimated_annual_leak, 0),
          leaks: result.leaks.map(leak => ({
            type: leak.leak_type_code,
            amount: leak.estimated_annual_leak,
            severity: leak.severity_score,
            confidence: leak.confidence_score,
            priority: leak.priority_score,
            metadata: leak.metadata,
            affiliates: (leak.affiliates || []).map(a => ({
              name: a.name,
              slug: a.slug,
              description: a.description,
              url: a.referral_url || a.website_url,
              category: a.category,
              pricing_type: a.pricing_type,
            })),
            ...getLeakExplanation(leak.leak_type_code, leak.metadata, leak.estimated_annual_leak, lang || 'en'),
          })),
          bhs: result.bhs ? {
            score: result.bhs.score,
            band: result.bhs.band,
            confidence: result.bhs.confidence,
            leakImpactPct: result.bhs.leakImpactPct,
            industryComparison: result.bhs.industryComparison,
            dimensions: {
              expenseEfficiency: { score: result.bhs.dimensions.expenseEfficiency.score, weight: result.bhs.dimensions.expenseEfficiency.weight, factors: result.bhs.dimensions.expenseEfficiency.factors },
              revenueProtection: { score: result.bhs.dimensions.revenueProtection.score, weight: result.bhs.dimensions.revenueProtection.weight, factors: result.bhs.dimensions.revenueProtection.factors },
              taxCompliance: { score: result.bhs.dimensions.taxCompliance.score, weight: result.bhs.dimensions.taxCompliance.weight, factors: result.bhs.dimensions.taxCompliance.factors },
              operationalHealth: { score: result.bhs.dimensions.operationalHealth.score, weight: result.bhs.dimensions.operationalHealth.weight, factors: result.bhs.dimensions.operationalHealth.factors },
              riskExposure: { score: result.bhs.dimensions.riskExposure.score, weight: result.bhs.dimensions.riskExposure.weight, factors: result.bhs.dimensions.riskExposure.factors },
            },
          } : undefined,
        };

        // ═══ STEP 2: SAVE TO prescan_results (for report + results page) ═══
        // The old report route reads from prescan_results. Without this, report shows 0.
        try {
          const teaserLeaks = result.leaks.map(leak => {
            const enExpl = getLeakExplanation(leak.leak_type_code, leak.metadata, leak.estimated_annual_leak, 'en');
            const frExpl = getLeakExplanation(leak.leak_type_code, leak.metadata, leak.estimated_annual_leak, 'fr');
            return {
              slug: leak.leak_type_code,
              title: enExpl.title,
              title_fr: frExpl.title_fr,
              severity: leak.severity_score >= 80 ? 'critical' : leak.severity_score >= 60 ? 'high' : leak.severity_score >= 30 ? 'medium' : 'low',
              impact_min: leak.estimated_annual_leak,
              impact_max: Math.round(leak.estimated_annual_leak * 1.3),
              category: leak.metadata?.category || 'general',
              solution_type: 'professional',
              confidence: leak.confidence_score,
              description: enExpl.explanation,
              description_fr: frExpl.explanation_fr,
              proof: enExpl.proof,
              proof_fr: frExpl.proof_fr,
              action: enExpl.action,
              action_fr: frExpl.action_fr,
              affiliates: (leak.affiliates || []).map(a => ({
                name: a.name, slug: a.slug, url: a.referral_url || a.website_url,
                description: a.description, category: a.category,
              })),
            };
          });

          const totalLeakAmount = result.leaks.reduce((sum, l) => sum + l.estimated_annual_leak, 0);

          // Gap 7 fix: await the insert so we know if it failed before returning
          const { error: insertErr } = await supabase.from('prescan_results').insert({
            // Gap 2 fix: prescan_run_id as top-level column so dashboard API Path C can join on it
            prescan_run_id: prescanRunId,
            input_snapshot: {
              province: tags.province || 'QC',
              industry: tags.business_type || 'generic',
              structure: tags.structure || 'sole_proprietor',
              monthly_revenue: Number(tags.revenue_band) || 0,
              annual_revenue: (Number(tags.revenue_band) || 0) * 12,
              tier: tier || 'solo',
              prescan_run_id: prescanRunId,
            },
            summary: {
              health_score: result.fhScore,
              total_leaks: result.leaks.length,
              critical_leaks: result.leaks.filter(l => l.severity_score >= 80).length,
              high_leaks: result.leaks.filter(l => l.severity_score >= 60 && l.severity_score < 80).length,
              leak_range_min: totalLeakAmount,
              leak_range_max: Math.round(totalLeakAmount * 1.3),
            },
            teaser_leaks: teaserLeaks,
            hidden_leak_count: 0,
            insights: [],
            obligation_categories: [],
            teaser_programs: [],
            hidden_program_count: 0,
            province: tags.province || 'QC',
            industry: tags.business_type || 'generic',
            structure: tags.structure || 'sole_proprietor',
            tier: tier || 'solo',
            user_id: realUserId || null,
            // High-signal diagnostic fields from chat
            does_rd: tags.does_rd === 'yes',
            exports_goods: tags.exports_goods === 'yes',
            has_physical_location: false,
            uses_payroll_software: tags.uses_accounting_software === 'yes',
            tax_last_reviewed: tags.tax_last_reviewed || null,
            vendor_contracts_stale: tags.vendor_contracts_stale === 'yes',
            has_business_insurance: tags.has_business_insurance === 'yes' || tags.insurance_status === 'recently_compared',
          });
          if (insertErr) {
            console.warn('⚠️ prescan_results insert failed:', insertErr.message);
            // Retry once with minimal payload — don't block the response
            try {
              await supabase.from('prescan_results').insert({
                prescan_run_id: prescanRunId,
                user_id: realUserId || null,
                province: tags.province || 'QC',
                industry: tags.business_type || 'generic',
                structure: tags.structure || 'sole_proprietor',
                tier: tier || 'solo',
                teaser_leaks: teaserLeaks,
                input_snapshot: { prescan_run_id: prescanRunId },
                summary: {},
                hidden_leak_count: 0,
                insights: [],
                obligation_categories: [],
                teaser_programs: [],
                hidden_program_count: 0,
              });
              process.env.NODE_ENV !== "production" && console.log('✅ prescan_results saved on retry');
            } catch (retryErr: any) {
              console.error('❌ prescan_results retry also failed:', retryErr.message);
            }
          } else {
            process.env.NODE_ENV !== "production" && console.log('✅ prescan_results saved');
          }
        } catch (saveErr: any) {
          console.warn('⚠️ prescan_results save (non-blocking):', saveErr.message);
        }
        
      } catch (engineError: any) {
        console.error('❌ Prescan engine error:', engineError?.message);
        console.error('Stack:', engineError?.stack);
        // Surface a friendly error message to the user — don't silently swallow
        const isFR = lang === 'fr';
        const cleanOriginal = cleanTagsFromText(responseText);
        return NextResponse.json({
          sessionId: sessionId || null,
          message: isFR
            ? `${cleanOriginal}\n\nJe n'ai pas pu terminer l'analyse en ce moment. Veuillez réessayer dans quelques instants.`
            : `${cleanOriginal}\n\nI wasn't able to complete the analysis right now. Please try again in a moment.`,
          rawMessage: responseText,
          tags,
          analysis: null,
          prescanRunId: null,
          tier: null,
          pricing: null,
          completed: false,
          engineError: true,
          inputs: {},
        });
      }
    }
    
    // Clean response text (remove tags for user display)
    const cleanText = cleanTagsFromText(responseText);

    // Gap 1 fix: only set completed=true when engine actually produced a result
    const engineCompleted = shouldRunAnalysis && analysis !== null && prescanRunId !== null;
    
    return NextResponse.json({
      sessionId: sessionId || null,
      message: cleanText,
      rawMessage: responseText,
      tags,
      analysis,
      prescanRunId,
      tier,
      pricing,
      completed: engineCompleted,
      inputs: {
        employeeCount: tags.set_employee_count ?? tags.staffing_count ?? 0,
        // Gap 5 fix: use ?? not || so 0 revenue is preserved
        annualRevenue: tags.set_annual_revenue ?? tags.set_revenue ?? (tags.set_monthly_revenue ? tags.set_monthly_revenue * 12 : null) ?? (tags.set_weekly_earnings ? tags.set_weekly_earnings * 52 : null) ?? 0,
      },
    });
    
  } catch (error: any) {
    console.error('❌ Prescan chat error:', error?.message);

    const friendlyMessage = "I'm having trouble right now. Please try again in a moment.";

    return NextResponse.json(
      {
        error:        'Failed to process prescan chat',
        message:      friendlyMessage,
        sessionId:    null,
        tags:         {},
        analysis:     null,
        prescanRunId: null,
        tier:         null,
        pricing:      null,
        completed:    false,
      },
      { status: 500 }
    );
  }
}

/**
 * Parse XML tags from Claude's response
 */
function parseTags(text: string): PrescanTags {
  const tags: PrescanTags = {};
  
  const collectedRegex = /<collected data_key="([^"]+)" value="([^"]+)"\s*\/>/g;
  let match;
  
  while ((match = collectedRegex.exec(text)) !== null) {
    const [, key, value] = match;
    (tags as any)[key] = value;
  }
  
  const numberTags = [
    'set_revenue',
    'set_monthly_revenue',
    'set_annual_revenue',
    'set_weekly_earnings',
    'set_hours_per_week',
    'set_employee_count',
    'chair_rent_amount',
  ];
  
  for (const tagName of numberTags) {
    const regex = new RegExp(`<${tagName} value="([\\d,.]+)"\\s*\\/>`, 'g');
    const tagMatch = regex.exec(text);
    if (tagMatch) {
      (tags as any)[tagName] = parseInt(tagMatch[1].replace(/[,]/g, ''), 10);
    }
  }
  
  // Convert known numeric collected keys from strings to numbers
  const numericCollectedKeys = ['fuel_monthly', 'fleet_size', 'food_cost_pct', 'staffing_count'];
  for (const key of numericCollectedKeys) {
    if ((tags as any)[key] && typeof (tags as any)[key] === 'string') {
      const num = parseFloat((tags as any)[key]);
      if (!isNaN(num)) (tags as any)[key] = num;
    }
  }
  
  return tags;
}

/**
 * Remove XML tags from text for user display
 */
function cleanTagsFromText(text: string): string {
  return text
    .replace(/<collected[^>]+\/>/g, '')
    .replace(/<set_\w+[^>]+\/>/g, '')
    .replace(/<run_analysis\s*\/>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

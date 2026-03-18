# LEAK & GROW - FINANCIAL OS IMPLEMENTATION GUIDE

## 🎯 What We Built

A complete **Financial Operating System** aligned with your vision documents:

- ✅ 5-question AI prescan chat (Quebec-focused)
- ✅ 4 core leak detectors (processing, rent, tax, cash)
- ✅ Financial Health Score (0-100)
- ✅ Quebec benchmark database
- ✅ Complete database schema
- ✅ Prescan results dashboard
- ✅ Monitoring-enabled flag system

## 📁 Files Created

### 1. **Database Migration**
```
/sql-migrations/058-financial-os-foundation.sql
```
Creates all tables:
- `prescan_sessions` - AI chat state
- `prescan_runs` - Completed prescans
- `leak_types` - Leak catalog (4 core leaks)
- `detected_leaks` - Leak results
- `financial_snapshots` - Monthly monitoring data
- `alerts` - Monitoring notifications
- `profiles`, `business_users`, `savings_events`

**Quebec Benchmarks Seeded:**
- Barber shops
- Restaurants
- Rideshare drivers (Uber/Lyft)
- Trucking
- Cafes
- Generic small business (fallback)

### 2. **Prescan Engine**
```
/src/services/prescan-engine-v3.ts
```
**Core Functions:**
- `buildPrescanInputFromTags()` - Parse AI tags into structured input
- `normalizeIndustry()` - Map business types to industry slugs
- `loadBenchmarks()` - Fetch Quebec benchmarks
- `detectLeaks()` - Run 4 leak detectors
- `calculateFinancialHealthScore()` - Compute FH score (0-100)
- `runPrescanForBusiness()` - Main orchestrator

**4 Leak Detectors:**
1. **processing_rate_high** - Card fees too high
2. **rent_or_chair_high** - Rent/chair cost too high
3. **tax_optimization_gap** - Missing deductions (no accounting software)
4. **cash_management_risk** - Cash handling risk

### 3. **AI System Prompt**
```
/src/services/prescan-ai-prompt.ts
```
Claude prompt that:
- Asks 5 universal questions conversationally
- Outputs hidden XML tags after each answer
- Triggers analysis with `<run_analysis />`

### 4. **API Route**
```
/src/app/api/v3/prescan-chat/route.ts
```
Handles:
- AI conversation with Claude
- Tag parsing from responses
- Triggering prescan engine
- Returning leak results

### 5. **Dashboard Component**
```
/src/components/v3/PrescanDashboard.tsx
```
Displays:
- Financial Health Score with color coding
- Total estimated leak range
- Individual leak cards
- Monitoring status banner
- Upgrade CTA

---

## 🚀 Installation Steps

### Step 1: Run Database Migration

```bash
# In Supabase SQL Editor, run:
sql-migrations/058-financial-os-foundation.sql
```

This creates all tables and seeds Quebec benchmarks.

### Step 2: Update Prisma Schema

```bash
npx prisma db pull
npx prisma generate
```

### Step 3: Set Environment Variables

```env
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Step 4: Install Dependencies (if needed)

```bash
npm install @anthropic-ai/sdk
```

---

## 🎬 How It Works

### User Flow

1. **User lands on `/prescan`**
   - AI assistant greets them
   - Starts asking questions

2. **5 Questions Asked:**
   ```
   Q1: What kind of business do you run?
   Q2: Which province do you work in?
   Q3: Roughly, how much revenue per year?
   Q4: How do customers pay? What tools do you use?
   Q5: Biggest costs? Employees? Accounting software?
   ```

3. **AI Outputs Hidden Tags:**
   ```xml
   <collected data_key="business_type" value="barber" />
   <collected data_key="province" value="QC" />
   <set_revenue value="80000" />
   <collected data_key="payment_mix" value="mixed" />
   <collected data_key="payment_tools" value="bank_terminal" />
   <collected data_key="main_costs" value="chair rent, tools" />
   <set_employee_count value="1" />
   <collected data_key="uses_accounting_software" value="no" />
   <run_analysis />
   ```

4. **Backend Processes Tags:**
   - Parses XML tags
   - Normalizes industry (`barber` → `barber_shop`)
   - Loads Quebec benchmarks
   - Runs 4 leak detectors
   - Calculates FH score

5. **Dashboard Shows Results:**
   - FH Score: 68/100
   - Estimated leak: $2,400 - $2,900/year
   - 3 leaks detected:
     - Processing fees: $1,200/year
     - Chair rent: $800/year
     - Tax optimization: $1,600/year

---

## 🧮 Leak Detection Logic

### 1. Processing Rate Leak

```typescript
// If they accept cards:
cardVolume = annualRevenue * cardSharePercentage

// Estimate their rate based on tools:
assumedRate = toolType === 'square' ? p50 : p75

// Calculate leak:
leak = cardVolume * (assumedRate - targetRate)
```

### 2. Rent/Chair Leak

```typescript
// If "rent" or "chair_rent" in costs:
assumedRatio = p75 rent ratio
targetRatio = p50 rent ratio

leak = annualRevenue * (assumedRatio - targetRatio)
```

### 3. Tax Optimization Gap

```typescript
// If no accounting software AND revenue >= $30k:
leak = annualRevenue * 0.02  // 2% in missed deductions
```

### 4. Cash Management Risk

```typescript
// If payment_mix !== 'mostly_card':
// Flag as risk, no dollar leak
leak = 0  // Risk marker only
```

---

## 📊 Financial Health Score

```typescript
FH Score = 100 - (totalLeakPercentage * 2)

// Example:
totalLeak = $2,400
annualRevenue = $80,000
leakPercentage = 3%
FH Score = 100 - (3 * 2) = 94
```

**Ranges:**
- 75-100: Good health (green)
- 50-74: Room for improvement (yellow)
- 0-49: Needs attention (red)

---

## 🔧 Integration with Existing Code

### Option A: Replace Current Prescan

Update `/src/app/prescan/page.tsx`:

```typescript
import { PRESCAN_SYSTEM_PROMPT } from '@/services/prescan-ai-prompt';

// Change API endpoint from:
const res = await fetch('/api/v2/prescan-chat', ...)

// To:
const res = await fetch('/api/v3/prescan-chat', ...)
```

### Option B: Create New Route

Create `/src/app/prescan-v3/page.tsx` alongside existing prescan:

```typescript
'use client';

import PrescanChat from '@/components/v3/PrescanChat';

export default function PrescanV3Page() {
  return <PrescanChat />;
}
```

---

## 🌐 French Language Support

Dashboard is **bilingual** (EN/FR):

```typescript
<PrescanDashboard
  locale="fr"  // or "en"
  ...
/>
```

AI prompt can also be adapted for French by adding:

```typescript
export const PRESCAN_SYSTEM_PROMPT_FR = `...version française...`;
```

---

## 📈 Next Steps (Phase 2)

### Monitoring Engine

```typescript
// /src/services/monitoring-engine-v3.ts

export async function runMonthlyMonitoring(businessId: string) {
  // 1. Check if monitoring_enabled
  // 2. Fetch latest data (integrations or prescan)
  // 3. Re-run leak detection
  // 4. Calculate new FH score
  // 5. Save to financial_snapshots
  // 6. Generate alerts if thresholds crossed
}
```

### Alert System

```typescript
// /src/services/alert-service.ts

export async function generateAlerts(businessId, currentLeaks, previousSnapshot) {
  // Compare current vs previous
  // Create alerts for:
  // - New leaks detected
  // - Existing leaks worsened
  // - Benchmark shifts
}
```

### Upgrade Flow

```typescript
// /src/app/upgrade/page.tsx

- Show savings summary
- Offer 7-day free trial
- Stripe checkout integration
- Set monitoring_enabled = true
```

---

## 🎯 Success Metrics

Track these KPIs:

```sql
-- Prescan completion rate
SELECT 
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as prescans_started,
  COUNT(*) FILTER (WHERE health_score IS NOT NULL) as prescans_completed
FROM prescan_runs;

-- Average FH score
SELECT AVG(health_score) as avg_fh_score
FROM prescan_runs
WHERE province = 'QC';

-- Top leak types
SELECT 
  lt.name,
  COUNT(*) as occurrences,
  AVG(dl.estimated_annual_leak) as avg_leak
FROM detected_leaks dl
JOIN leak_types lt ON dl.leak_type_id = lt.id
GROUP BY lt.name
ORDER BY occurrences DESC;
```

---

## 🐛 Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Verify all tables created
- [ ] Check Quebec benchmarks loaded (6 industries)
- [ ] Test prescan chat with barber scenario
- [ ] Verify tags parsed correctly
- [ ] Check leak detection logic
- [ ] Confirm FH score calculation
- [ ] Test dashboard display (EN/FR)
- [ ] Verify monitoring banner shows when `monitoring_enabled = false`

---

## 💡 Example: Barber in Quebec

**Input Tags:**
```xml
<collected data_key="business_type" value="barber" />
<collected data_key="province" value="QC" />
<set_revenue value="80000" />
<collected data_key="payment_mix" value="mixed" />
<collected data_key="payment_tools" value="bank_terminal" />
<collected data_key="main_costs" value="chair rent, tools" />
<set_employee_count value="1" />
<collected data_key="uses_accounting_software" value="no" />
```

**Detected Leaks:**
1. **Processing Rate High**
   - Assumed rate: 2.6% (p75)
   - Target rate: 2.2% (p50)
   - Card volume: $40,000 (50% of revenue)
   - Leak: $40,000 * 0.004 = **$160/year**

2. **Chair Rent High**
   - Assumed ratio: 50% (p75)
   - Target ratio: 40% (p50)
   - Leak: $80,000 * 0.10 = **$8,000/year**

3. **Tax Optimization Gap**
   - No accounting software
   - Leak: $80,000 * 0.02 = **$1,600/year**

**Results:**
- Total leak: **$9,760/year**
- FH Score: **75/100** (Good)
- Recommendation: Fix chair rent first (highest impact)

---

## 📞 Support

Questions? Check:
1. Vision documents (uploaded PDFs)
2. Database schema (`058-financial-os-foundation.sql`)
3. Prescan engine (`prescan-engine-v3.ts`)
4. This README

---

## 🎉 You're Ready!

This is your **Quebec-first Financial OS foundation**. 

Next: Onboard your first 50 businesses via your accountant partner and refine the benchmarks with real data!

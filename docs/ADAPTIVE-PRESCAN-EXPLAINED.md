# ADAPTIVE PRESCAN - HOW IT WORKS

## 🧠 The Intelligence Layer

The prescan AI is **adaptive** - it asks different questions based on the industry. This allows one system to work across 150+ business types while extracting the specific data points that matter for each.

---

## 🔄 How Adaptive Questions Work

### Traditional (Wrong) Approach:
```
Everyone gets asked the same 5 questions:
1. What business?
2. What province?
3. How much revenue?
4. How do customers pay?
5. What are your costs?
```

### Adaptive (Correct) Approach:
```
AI detects industry, then asks 5 RELEVANT questions:

BARBER:
1. Which province?
2. Own shop or rent chair?
3. Monthly revenue?
4. Cash/card mix? What payment tool?
5. Biggest costs? Use accounting software?

UBER DRIVER:
1. Which province?
2. Hours per week driving?
3. Weekly earnings?
4. Track mileage and expenses?
5. Biggest costs (gas, insurance, maintenance)?

RESTAURANT:
1. Which province?
2. What type (cafe, fast food, sit-down)?
3. Monthly revenue?
4. How many employees?
5. Payment processor and POS system?
```

---

## 💡 Why This Matters

### Different Industries = Different Leaks

**Barber Leaks:**
- ❌ Chair rent too high (40-50% of revenue is normal, 60%+ is leak)
- ❌ Payment processing fees (should be ~2.2%, not 2.9%)
- ❌ No accounting software = missed tax deductions

**Uber Driver Leaks:**
- ❌ Not tracking mileage = lost tax deductions
- ❌ Personal insurance instead of commercial = risk + higher costs
- ❌ Inefficient routes = wasting gas money
- ❌ Not tracking expenses = can't optimize

**Restaurant Leaks:**
- ❌ Labor cost ratio too high (should be ~30%, not 40%)
- ❌ Food cost ratio wrong (should be ~28-32%)
- ❌ Expensive payment processor
- ❌ No POS system = inventory shrinkage

---

## 🎯 Examples of Adaptive Conversations

### Example 1: Quebec Barber

```
USER: "I'm a barber"
AI: "Great! Which province do you work in?"

USER: "Quebec"
AI: "Perfect. Do you own your own shop, or do you rent a chair?"

USER: "I rent a chair for $800 a month"
AI: "Got it. Roughly how much do you make per month?"

USER: "Around $6,000"
AI: "Thanks! How do most clients pay - cash, card, or mix? 
     And what do you use for cards?"

USER: "Mix of both, I use a bank terminal"
AI: "And last question - what are your biggest costs besides 
     chair rent? Do you use accounting software or track things manually?"

USER: "Products and tools mainly. I just keep receipts in a box"
AI: "Perfect! Let me analyze your salon business..."
```

**What AI Extracted:**
```javascript
{
  business_type: "barber",
  industry_slug: "barber_shop",
  province: "QC",
  ownership: "chair_rent",
  chair_rent_amount: 800,
  monthly_revenue: 6000,  // = $72K annual
  payment_mix: "mixed",
  payment_tools: "bank_terminal",
  main_costs: "products, tools",
  uses_accounting: "no"
}
```

**Leaks Detected:**
1. **Chair Rent High**: $800/month on $6K revenue = 13.3%
   - Benchmark: 8-10% is healthy for QC barbers
   - Leak: ~$240/month = **$2,880/year**

2. **Processing Fees High**: Bank terminal = ~2.6%
   - Could get 2.2% with Square
   - Card volume: ~$3,000/month (50% of revenue)
   - Leak: $3,000 × 12 × 0.004 = **$144/year**

3. **Tax Optimization Gap**: No accounting software
   - Missing deductions estimate: 2% of revenue
   - Leak: $72,000 × 0.02 = **$1,440/year**

**Total Leak: ~$4,464/year**
**FH Score: 88/100** (Good, but could improve)

---

### Example 2: Ontario Uber Driver

```
USER: "I drive for Uber"
AI: "Got it! Which province do you mainly drive in?"

USER: "Ontario"
AI: "Great. How many hours per week do you typically drive?"

USER: "About 30-35 hours"
AI: "And what are your average weekly earnings from Uber?"

USER: "Usually around $900"
AI: "Thanks! Do you track your mileage and fuel costs?"

USER: "I track mileage but not really the fuel"
AI: "Last question - what's your biggest expense? 
     Gas, car maintenance, insurance?"

USER: "Definitely gas, then insurance. My car is paid off"
AI: "Perfect! Let me analyze your rideshare business..."
```

**What AI Extracted:**
```javascript
{
  business_type: "uber driver",
  industry_slug: "rideshare_driver",
  province: "ON",
  hours_per_week: 32,
  weekly_earnings: 900,  // = $46,800 annual
  tracks_mileage: "yes",
  tracks_expenses: "partially",
  main_costs: "fuel, insurance",
  car_ownership: "own"
}
```

**Leaks Detected:**
1. **Expense Tracking Gap**: Only tracks mileage, not all expenses
   - Missing: fuel receipts, maintenance, car washes, etc.
   - Potential missed deductions: **$2,000-3,000/year**

2. **Insurance Check**: Need to verify commercial coverage
   - Risk flag (not a dollar leak, but important)

3. **No Tax Software**: Likely missing deductions
   - Estimate: **$1,500/year**

**Total Leak: ~$3,500/year**
**FH Score: 82/100** (Good)

---

### Example 3: Quebec Restaurant

```
USER: "I run a small restaurant"
AI: "Awesome! Which province is it in?"

USER: "Quebec, in Montreal"
AI: "Great. What type of restaurant - cafe, fast food, 
     sit-down, or something else?"

USER: "It's a sit-down place, Italian food"
AI: "Sounds great! Roughly how much revenue do you do per month?"

USER: "Around $45,000"
AI: "Thanks! How many employees do you have?"

USER: "4 full-time and 2 part-time"
AI: "Perfect. Last question - what payment processor do you use 
     for cards, and do you have a POS system or accounting software?"

USER: "We use Square for payments and POS, but no real accounting software"
AI: "Excellent! I'm analyzing your restaurant now..."
```

**What AI Extracted:**
```javascript
{
  business_type: "restaurant",
  industry_slug: "restaurant",
  province: "QC",
  city: "Montreal",
  restaurant_type: "sit_down",
  cuisine: "italian",
  monthly_revenue: 45000,  // = $540K annual
  employee_count: 6,
  payment_processor: "square",
  pos_system: "square",
  uses_accounting: "no"
}
```

**Leaks Detected:**
1. **No Accounting Software**: Big gap for a $540K business
   - Missing expense tracking, inventory management
   - Tax optimization lost: **$10,000-15,000/year**

2. **Processing Fees**: Square = 2.65% + $0.10
   - For $45K/month mostly cards = ~$40K card volume
   - Could negotiate to 2.3% at this volume
   - Leak: $40K × 12 × 0.0035 = **$1,680/year**

3. **Labor Ratio Unknown**: Can't calculate without detailed data
   - Flag for full scan with QuickBooks integration

**Total Leak: ~$11,680/year** (minimum)
**FH Score: 72/100** (Needs improvement)

---

## 🏗️ How the System Adapts

### 1. Industry Detection
```typescript
// AI sees: "I'm a barber"
<collected data_key="business_type" value="barber" />
<collected data_key="industry_slug" value="barber_shop" />

// AI sees: "I drive for Uber"
<collected data_key="business_type" value="uber driver" />
<collected data_key="industry_slug" value="rideshare_driver" />
```

### 2. Question Selection
```typescript
// Backend sees industry_slug = "barber_shop"
// AI automatically knows to ask about:
// - Chair rent vs shop ownership
// - Payment processing for salon services
// - Product costs

// Backend sees industry_slug = "rideshare_driver"
// AI automatically knows to ask about:
// - Hours driven and earnings
// - Mileage tracking
// - Fuel and maintenance costs
```

### 3. Data Extraction
```typescript
// For barber:
{
  chair_rent_amount: 800,
  monthly_revenue: 6000,
  // System calculates: 13.3% rent ratio
}

// For Uber:
{
  weekly_earnings: 900,
  hours_per_week: 32,
  // System calculates: $46,800 annual
}
```

### 4. Leak Detection
```typescript
// Each industry has different leak logic:

barber_shop:
  - Check chair_rent_ratio vs benchmark
  - Check payment processing fees
  - Check for accounting software

rideshare_driver:
  - Check expense tracking completeness
  - Check insurance type
  - Check mileage logging
  - Check fuel efficiency

restaurant:
  - Check labor cost ratio
  - Check food cost ratio
  - Check payment processing
  - Check POS/accounting systems
```

---

## 🎯 Supported Industries (Examples)

The AI can adapt to any of these:

| Industry | Key Questions Focus |
|----------|-------------------|
| Barber/Salon | Chair rent, payment processing, products |
| Rideshare | Hours, earnings, expense tracking |
| Restaurant | Type, employees, food costs, labor |
| Trucking | Truck ownership, fuel, maintenance tracking |
| Construction | Crew size, job costing, materials |
| Plumbing | Calls/week, pricing, parts markup |
| Electrician | Residential vs commercial, licensing, insurance |
| Consulting | Billable hours, rate, time tracking |
| E-commerce | Platform, shipping, returns, ads |
| Retail | Inventory, rent, shrinkage, POS |
| Coffee Shop | Rent, supplies, labor, waste |
| Gym | Members, equipment, rent, software |
| Daycare | Kids, ratios, licensing, meals |
| Law Firm | Billable hours, realization rate, trust accounts |

**And 140+ more industries...**

---

## ✅ Benefits of Adaptive Approach

1. **Accurate Data**: Gets the RIGHT metrics for each industry
2. **Natural Flow**: Feels like talking to someone who understands your business
3. **Scalable**: One system works for 150+ industries
4. **Smart Detection**: Finds industry-specific leaks, not generic advice
5. **Better UX**: Business owners answer questions that make sense to them

---

## 🚀 Try It Yourself

Test different industries:

**Barber:** "I'm a barber" → See chair rent questions
**Uber:** "I drive for Uber" → See mileage tracking questions
**Restaurant:** "I own a restaurant" → See labor/food cost questions
**Plumber:** "I'm a plumber" → See job costing questions

Each gets a custom 5-question interview optimized for their leaks!

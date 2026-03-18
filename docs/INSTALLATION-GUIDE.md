# 🚀 COMPLETE INSTALLATION GUIDE - ADAPTIVE PRESCAN SYSTEM

## 📦 What You're Getting

A complete, working **Adaptive Financial Prescan System** that:
- ✅ Asks industry-specific questions (barber, Uber, restaurant, etc.)
- ✅ Detects 4 core financial leaks
- ✅ Calculates Financial Health Score (0-100)
- ✅ Works WITHOUT authentication (for testing)
- ✅ Beautiful chat interface
- ✅ Real-time AI conversation

---

## 📁 FILES TO COPY

### **1. Prescan Page**
**File:** `prescan-page-v3.tsx`  
**Copy to:** `C:\Users\stark\Desktop\Leakandgrow\src\app\prescan\page.tsx`  
**What it does:** The chat interface users see

### **2. API Route**
**File:** `prescan-chat-route.ts`  
**Copy to:** `C:\Users\stark\Desktop\Leakandgrow\src\app\api\v3\prescan-chat\route.ts`  
**What it does:** Handles AI conversation and triggers leak detection

### **3. Prescan Engine**
**File:** `prescan-engine-v3.ts`  
**Copy to:** `C:\Users\stark\Desktop\Leakandgrow\src\services\prescan-engine-v3.ts`  
**What it does:** Core leak detection logic (4 leaks + scoring)

### **4. AI System Prompt**
**File:** `prescan-ai-prompt.ts`  
**Copy to:** `C:\Users\stark\Desktop\Leakandgrow\src\services\prescan-ai-prompt.ts`  
**What it does:** Instructions for Claude on how to ask questions

### **5. SQL Migration**
**File:** `058-financial-os-foundation-FIXED.sql`  
**Run in:** Supabase SQL Editor  
**What it does:** Creates all database tables + seeds Quebec benchmarks

---

## 🔧 STEP-BY-STEP INSTALLATION

### **Step 1: Create Directories (if needed)**

Open PowerShell in your project folder:

```powershell
cd C:\Users\stark\Desktop\Leakandgrow

# Create directories if they don't exist
mkdir -p src\app\api\v3\prescan-chat
mkdir -p src\services
```

### **Step 2: Copy Files**

Copy each file to its destination:

```powershell
# Copy prescan page (replace existing)
copy prescan-page-v3.tsx src\app\prescan\page.tsx

# Copy API route
copy prescan-chat-route.ts src\app\api\v3\prescan-chat\route.ts

# Copy prescan engine
copy prescan-engine-v3.ts src\services\prescan-engine-v3.ts

# Copy AI prompt
copy prescan-ai-prompt.ts src\services\prescan-ai-prompt.ts
```

Or manually:
1. Open each file from the zip
2. Copy the contents
3. Paste into the correct location in your project

### **Step 3: Run SQL Migration**

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `058-financial-os-foundation-FIXED.sql`
5. Paste into the editor
6. Click **Run**

**Expected:** "Success. No rows returned"

**Verify:**
```sql
-- Should return 15 tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'users', 'businesses', 'industries', 'prescan_runs', 
  'detected_leaks', 'leak_types', 'industry_benchmarks'
)
ORDER BY table_name;
```

### **Step 4: Update Prisma Schema**

```powershell
npx prisma db pull
npx prisma generate
```

### **Step 5: Check Environment Variables**

Make sure your `.env` has:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://buedywbxensvwderupxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-key...

# Database (Session Pooler)
DATABASE_URL="postgresql://postgres.buedywbxensvwderupxd:YOUR_PASSWORD@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### **Step 6: Restart Dev Server**

```powershell
# Stop current server (Ctrl+C)

# Start fresh
npm run dev
```

### **Step 7: Test It!**

1. Open browser: `http://localhost:3000/prescan`
2. You should see the chat interface
3. Type: **"I'm a barber"**
4. Watch the AI adapt its questions!

---

## 🧪 TEST SCENARIOS

### **Test 1: Quebec Barber**

```
You: I'm a barber
AI: Great! Which province do you work in?
You: Quebec
AI: Perfect. Do you own your own shop, or do you rent a chair?
You: I rent a chair for $800 a month
AI: Got it. Roughly how much do you make per month?
You: $6000
AI: Thanks! How do most clients pay - cash, card, or mix?
You: Mix of both, I use a bank terminal
AI: Last question - what are your biggest costs? Use accounting software?
You: Products and tools. I just keep receipts
AI: Perfect! Let me analyze your business...
```

**Expected Results:**
- FH Score: ~88/100
- 3 leaks detected:
  - Chair rent: $2,880/year
  - Processing fees: $144/year
  - Tax optimization: $1,440/year

### **Test 2: Ontario Uber Driver**

```
You: I drive for Uber
AI: Got it! Which province do you mainly drive in?
You: Ontario
AI: Great. How many hours per week do you typically drive?
You: 30 hours
AI: And what are your average weekly earnings from Uber?
You: $900
AI: Thanks! Do you track your mileage and fuel costs?
You: I track mileage but not fuel
AI: Last question - what's your biggest expense?
You: Gas and insurance
AI: Perfect! Let me analyze...
```

**Expected Results:**
- FH Score: ~82/100
- 2-3 leaks detected

---

## 🐛 TROUBLESHOOTING

### **Error: "Module not found: @/services/prescan-ai-prompt"**

**Fix:** Make sure you copied `prescan-ai-prompt.ts` to:
```
src\services\prescan-ai-prompt.ts
```

### **Error: "Module not found: @/services/prescan-engine-v3"**

**Fix:** Make sure you copied `prescan-engine-v3.ts` to:
```
src\services\prescan-engine-v3.ts
```

### **Error: "Table 'businesses' does not exist"**

**Fix:** Run the SQL migration in Supabase SQL Editor

### **Error: "I'm having trouble reaching the AI engine"**

**Check:**
1. Is `ANTHROPIC_API_KEY` in your `.env`?
2. Did you restart the dev server after adding it?
3. Open browser console (F12) → Network tab → Look for errors

### **Error: "Authentication failed"**

**Fix:** Update your `DATABASE_URL` in `.env` with the correct password from Supabase

---

## ✅ INSTALLATION CHECKLIST

- [ ] All 4 code files copied to correct locations
- [ ] SQL migration run in Supabase (15 tables created)
- [ ] Prisma schema updated (`npx prisma db pull`)
- [ ] `.env` file has all required keys
- [ ] Dev server restarted
- [ ] Tested prescan at `localhost:3000/prescan`
- [ ] AI asks adaptive questions based on industry
- [ ] Analysis completes and shows FH score

---

## 📊 WHAT'S INCLUDED

### **Database Tables (15 total)**
- `users`, `businesses`, `industries`
- `industry_benchmarks` (Quebec data for 6 industries)
- `prescan_sessions`, `prescan_runs`
- `leak_types` (4 core leaks)
- `detected_leaks`, `leak_actions`
- `financial_snapshots`, `alerts`
- `profiles`, `business_users`
- `savings_events`, `subscriptions`

### **Industries Seeded (17)**
- barber_shop, beauty_salon, restaurant, cafe
- rideshare_driver, trucking, construction, plumbing
- electrical, consulting, accounting, law_firm
- retail, ecommerce, generic_small_business

### **Quebec Benchmarks (6 industries)**
- Barber: processing rates, rent ratios, chair rent
- Restaurant: processing, rent, labor, food costs
- Rideshare: fuel, insurance, maintenance
- Trucking: fuel, insurance, maintenance
- Cafe: processing, rent, COGS
- Generic: fallback benchmarks

### **4 Core Leaks**
1. **processing_rate_high** - Card processing fees too expensive
2. **rent_or_chair_high** - Rent taking too much of revenue
3. **tax_optimization_gap** - Missing deductions (no accounting software)
4. **cash_management_risk** - Cash handling issues

---

## 🎯 NEXT STEPS

Once everything works:

1. **Test multiple industries** - Try barber, Uber, restaurant, plumber
2. **Verify leak detection** - Check if amounts make sense
3. **Add authentication** - Connect to real user accounts
4. **Build dashboard** - Show detailed leak breakdown
5. **Add monitoring** - Monthly snapshots + alerts

---

## 🆘 NEED HELP?

If you get stuck:

1. **Check browser console** (F12 → Console tab)
2. **Check server terminal** (PowerShell where `npm run dev` runs)
3. **Check Network tab** (F12 → Network → Look for failed requests)
4. **Copy the exact error message** and we'll fix it!

---

## 🎉 YOU'RE DONE!

Once the checklist is complete, you have a working **Adaptive Financial Prescan System**!

The AI will intelligently adapt its questions based on what industry the user mentions. 🧠💰

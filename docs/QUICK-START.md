# LEAK & GROW - FINANCIAL OS QUICK START

## ⚡ 15-Minute Setup

### Step 1: Database (5 minutes)

```bash
# In Supabase SQL Editor, paste and run:
sql-migrations/058-financial-os-foundation.sql
```

**What this does:**
- Creates 10 new tables
- Seeds Quebec benchmarks for 6 industries
- Sets up RLS policies

**Verify:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('prescan_runs', 'detected_leaks', 'leak_types');
-- Should return 3 rows

SELECT industry_slug, COUNT(*) 
FROM industry_benchmarks 
WHERE province = 'QC' 
GROUP BY industry_slug;
-- Should show 6 industries
```

---

### Step 2: Code Integration (5 minutes)

```bash
# Copy new files to your project
cp -r src/services/prescan-engine-v3.ts YOUR_PROJECT/src/services/
cp -r src/services/prescan-ai-prompt.ts YOUR_PROJECT/src/services/
cp -r src/app/api/v3/prescan-chat YOUR_PROJECT/src/app/api/v3/
cp -r src/components/v3 YOUR_PROJECT/src/components/
```

**Update Prisma:**
```bash
npx prisma db pull
npx prisma generate
```

---

### Step 3: Environment Check (2 minutes)

```bash
# Ensure these are set in .env.local:
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

### Step 4: Test (3 minutes)

**Option A: Use Existing Prescan Page**

Update `/src/app/prescan/page.tsx`:

```typescript
// Change this line:
const res = await fetch('/api/v2/prescan-chat', {

// To this:
const res = await fetch('/api/v3/prescan-chat', {
```

**Option B: Create New Test Page**

Create `/src/app/test-prescan/page.tsx`:

```typescript
'use client';

import { useState } from 'react';

export default function TestPrescan() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    const res = await fetch('/api/v3/prescan-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        history: messages,
        businessId: 'test-business-id',
        userId: 'test-user-id',
      }),
    });
    
    const data = await res.json();
    
    setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    
    if (data.analysis) {
      setResult(data.analysis);
    }
    
    setInput('');
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Prescan Test</h1>
      
      {/* Chat Messages */}
      <div className="space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={`inline-block px-4 py-2 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-4 py-2 border rounded-lg"
          placeholder="Type your answer..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
      
      {/* Results */}
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="font-bold mb-2">Analysis Complete!</h2>
          <p>FH Score: {result.fhScore}/100</p>
          <p>Total Leak: ${result.totalLeak}/year</p>
          <p>Leaks Found: {result.leaks.length}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Quick Test Scenario

**Test as a Quebec Barber:**

1. Visit `/test-prescan`
2. Answer these:
   - **Q1:** "I'm a barber"
   - **Q2:** "Quebec" or "QC"
   - **Q3:** "80000" or "about 80k"
   - **Q4:** "mix of cash and cards, I use a bank terminal"
   - **Q5:** "chair rent and tools, just me, I track in a notebook"

3. **Expected Result:**
   - FH Score: ~75-80
   - 3 leaks detected:
     - Processing fees (~$160)
     - Chair rent (~$8,000)
     - Tax optimization (~$1,600)
   - Total leak: ~$9,760/year

---

## 📋 Implementation Checklist

- [ ] SQL migration run successfully
- [ ] All tables created in Supabase
- [ ] Quebec benchmarks loaded (6 industries)
- [ ] Code files copied to project
- [ ] Prisma schema updated
- [ ] Environment variables set
- [ ] Test prescan completed successfully
- [ ] Leaks detected as expected
- [ ] FH score calculated correctly

---

## 🎯 Production Checklist

Before launching to real users:

### 1. Update Business Creation
When creating a business, also create a subscription record:

```typescript
// After creating business
await supabase.from('subscriptions').insert({
  business_id: newBusiness.id,
  tier: 'free',
  status: 'active',
  monitoring_enabled: false,
});
```

### 2. Add User Authentication
Ensure `businessId` and `userId` come from authenticated session:

```typescript
import { getServerSession } from 'next-auth';

const session = await getServerSession();
const userId = session.user.id;
```

### 3. Create Prescan Landing Page

```typescript
// /src/app/prescan/page.tsx
export default function PrescanPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1>Get a free financial leak snapshot in 2 minutes</h1>
      <p>We'll scan your business for money leaks — compared to similar businesses in Quebec.</p>
      <button onClick={startPrescan}>Start Free Scan</button>
    </div>
  );
}
```

### 4. Wire to Dashboard

After prescan completes, redirect to dashboard:

```typescript
if (data.analysis) {
  router.push(`/dashboard?prescanRunId=${data.prescanRunId}`);
}
```

### 5. Add Monitoring Upgrade Flow

```typescript
// /src/app/upgrade/page.tsx
// Show pricing tiers
// Stripe checkout
// Set monitoring_enabled = true on payment
```

---

## 🚨 Troubleshooting

**Issue: Tables not created**
```sql
-- Check if migration ran
SELECT * FROM prescan_runs LIMIT 1;
```

**Issue: No benchmarks**
```sql
-- Re-run benchmark inserts
SELECT * FROM industry_benchmarks WHERE province = 'QC';
```

**Issue: Tags not parsing**
```typescript
// Check API response
console.log('AI Response:', data.message);
console.log('Parsed Tags:', data.tags);
```

**Issue: No leaks detected**
```typescript
// Check benchmark loading
const benchmarks = await loadBenchmarks(supabase, 'barber_shop', 'QC');
console.log('Benchmarks:', benchmarks);
```

---

## ✅ You're Live!

Once checklist complete:
1. Share prescan link with your accountant
2. Test with 5-10 real businesses
3. Refine leak thresholds based on feedback
4. Add more Quebec industries to benchmarks
5. Build monitoring engine (Phase 2)

**Questions?** Check `FINANCIAL-OS-README.md` for full details.

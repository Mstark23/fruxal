# ⚡ SPEC VERSION - QUICK INSTALL

## 🎯 What You're Installing

The **EXACT** prescan system from the PDF specification:
- Bilingual EN/FR
- Exact 5 questions
- Precise leak formulas (p50/p75/p90)
- `/api/prescan` endpoint

---

## 📦 Installation (5 Steps - 5 Minutes)

### **Step 1: Run Database Migrations**

**First:** Fix businesses table
```
Open Supabase SQL Editor
Paste: FIX-BUSINESSES-TABLE.sql
Run
```

**Then:** Create all tables
```
Open Supabase SQL Editor
Paste: 058-DATABASE-MIGRATION.sql
Run
```

### **Step 2: Add Prescan Engine**

```
prescan-engine-SPEC.ts
    ↓
src/services/prescan-engine-spec.ts
```

### **Step 3: Add API Route**

```
Create folder: src/app/api/prescan/

prescan-route-SPEC.ts
    ↓
src/app/api/prescan/route.ts
```

### **Step 4: Update AI Prompt**

Use `prescan-ai-prompt-SPEC.ts` for your chat system prompt

### **Step 5: Update Prisma**

```powershell
npx prisma db pull
npx prisma generate
npm run dev
```

---

## 🧪 Test It

**Test the API directly:**

```bash
curl -X POST http://localhost:3000/api/prescan \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your-business-id",
    "tags": "<collected data_key=\"business_type\" value=\"barber\" /><collected data_key=\"province\" value=\"QC\" /><set_annual_revenue value=\"70000\" /><collected data_key=\"payment_mix\" value=\"mixed\" /><collected data_key=\"payment_tools\" value=\"bank_terminal\" /><collected data_key=\"main_costs\" value=\"chair rent, tools\" /><set_employee_count value=\"0\" /><collected data_key=\"uses_accounting_software\" value=\"no\" />"
  }'
```

**Expected response:**

```json
{
  "prescanRunId": "prescan-...",
  "totalEstimatedLeak": 6640,
  "leaks": [
    {
      "leak_type_code": "processing_rate_high",
      "estimated_annual_leak": 3200,
      "severity_score": 70,
      "confidence_score": 55,
      "priority_score": 39
    },
    ...
  ]
}
```

---

## ✅ Checklist

- [ ] Run FIX-BUSINESSES-TABLE.sql
- [ ] Run 058-DATABASE-MIGRATION.sql
- [ ] Copy prescan-engine-spec.ts to src/services/
- [ ] Create src/app/api/prescan/ folder
- [ ] Copy route.ts to src/app/api/prescan/
- [ ] Update AI system prompt
- [ ] Run npx prisma db pull
- [ ] Run npx prisma generate
- [ ] Restart server
- [ ] Test API endpoint

---

## 🌍 Bilingual Testing

**English:**
```
User: "I'm a barber"
AI: [EN mode] "In which province..."
```

**French:**
```
User: "Je suis barbier"
AI: [FR mode] "Dans quelle province..."
```

---

That's it! You now have the spec-compliant prescan system! 🚀

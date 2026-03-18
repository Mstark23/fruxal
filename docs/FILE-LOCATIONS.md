# 📂 FILE LOCATIONS MAP

## Where Each File Goes

```
YOUR PROJECT ROOT (C:\Users\stark\Desktop\Leakandgrow\)
│
├── src/
│   ├── app/
│   │   ├── prescan/
│   │   │   └── page.tsx  ← COPY: prescan-page-v3.tsx
│   │   │
│   │   └── api/
│   │       └── v3/
│   │           └── prescan-chat/
│   │               └── route.ts  ← COPY: prescan-chat-route.ts
│   │
│   └── services/
│       ├── prescan-engine-v3.ts  ← COPY: prescan-engine-v3.ts
│       └── prescan-ai-prompt.ts  ← COPY: prescan-ai-prompt.ts
│
└── .env  ← CHECK: Has all required environment variables
```

## SQL Migration

**File:** `058-financial-os-foundation-FIXED.sql`  
**Run in:** Supabase Dashboard → SQL Editor → New Query → Paste → Run

---

## Quick Copy Commands

### Option 1: PowerShell (Windows)

```powershell
cd C:\Users\stark\Desktop\Leakandgrow

# Copy prescan page
copy prescan-page-v3.tsx src\app\prescan\page.tsx

# Create API v3 directory if needed
mkdir -p src\app\api\v3\prescan-chat

# Copy API route
copy prescan-chat-route.ts src\app\api\v3\prescan-chat\route.ts

# Create services directory if needed
mkdir -p src\services

# Copy engine and prompt
copy prescan-engine-v3.ts src\services\prescan-engine-v3.ts
copy prescan-ai-prompt.ts src\services\prescan-ai-prompt.ts
```

### Option 2: Manual Copy

1. **Extract all files** from the zip to a temporary folder
2. **Open each file** and copy its contents
3. **Paste into the correct location** in your project (see map above)
4. **Save each file**

---

## After Copying Files

1. **Run SQL migration** in Supabase
2. **Update Prisma:**
   ```powershell
   npx prisma db pull
   npx prisma generate
   ```
3. **Restart dev server:**
   ```powershell
   npm run dev
   ```
4. **Test:** Go to `http://localhost:3000/prescan`

---

## Files Included

- ✅ `prescan-page-v3.tsx` - Chat interface (9.6 KB)
- ✅ `prescan-chat-route.ts` - API handler (4.8 KB)
- ✅ `prescan-engine-v3.ts` - Leak detection logic (22.6 KB)
- ✅ `prescan-ai-prompt.ts` - AI instructions (14.4 KB)
- ✅ `058-financial-os-foundation-FIXED.sql` - Database setup (21.6 KB)
- ✅ `INSTALLATION-GUIDE.md` - Complete setup guide (8.2 KB)
- ✅ `FILE-LOCATIONS.md` - This file

**Total:** 7 files, ~80 KB

---

## Need Help?

Check `INSTALLATION-GUIDE.md` for:
- Step-by-step installation
- Test scenarios
- Troubleshooting
- Environment variables

# SQL Migrations

Run these in **order** in the Supabase SQL Editor. Each file creates tables needed by a specific feature.

## Execution Order

| # | File | What It Creates |
|---|------|----------------|
| 001 | connect-all-dots.sql | Core tables, affiliates, base schema |
| 002 | add-recovery-columns.sql | Recovery tracking on leaks |
| 003 | intelligence-engine-tables.sql | Intelligence insights + market learning |
| 004–018 | add-{layer}-tables.sql | Intelligence layers (Genesis→Apex) |
| 019–023 | add-{tracking}-tables.sql | Advanced/deep/txn/blindspots/ultra-deep |
| 024–030 | add-{industry}-tables.sql | Industry-specific tables |
| 031 | tax-engine-setup.sql | Canadian tax leak detection |
| 032 | saas-engine-COMPLETE.sql | SaaS industry engine |
| 033 | seed-real-estate-demo.sql | Real estate demo data |
| 034 | v2-migration.sql | V2 schema updates |
| 035 | v2-affiliate-expansion.sql | Expanded affiliate partners |

## Important

- All migrations use `CREATE TABLE IF NOT EXISTS` — safe to re-run
- Run `001` first, then the rest in order
- After running SQL, regenerate Prisma: `npx prisma db pull && npx prisma generate`

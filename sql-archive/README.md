# SQL Archive — DO NOT RUN

These files are archived because they contain **outdated data** that would
**overwrite production** if executed.

- `affiliate-clean-install.sql` — Old 42-partner schema. Production has 212 partners.
- `v2-migration.sql` — Old v2 migration. Already applied.
- `v2-affiliate-expansion.sql` — Old expansion to 42 partners. Superseded by v7.

The live database was populated via v7-file1 through v7-file14 SQL files
which were run directly in the Supabase SQL editor during our build sessions.

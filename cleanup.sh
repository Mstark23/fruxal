#!/bin/bash
# =============================================================================
# cleanup.sh — Fruxal dead code removal
#
# Deletes everything marked 🔴 DELETE in the folder audit.
# Run from the project root: bash scripts/cleanup.sh
#
# BEFORE RUNNING:
#   git add -A && git commit -m "pre-cleanup snapshot"
#
# DRY RUN (see what would be deleted without deleting):
#   DRY=1 bash scripts/cleanup.sh
# =============================================================================

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Project root: $ROOT"
echo ""

RM="rm -rf"
if [ "${DRY:-0}" = "1" ]; then
  RM="echo [DRY] rm -rf"
  echo "⚠️  DRY RUN — nothing will be deleted"
  echo ""
fi

deleted=0
skipped=0

delete() {
  local path="$ROOT/$1"
  if [ -e "$path" ]; then
    $RM "$path"
    echo "  ✓ $1"
    ((deleted++)) || true
  else
    ((skipped++)) || true
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
echo "━━━ 1. src/ mirror directory ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
delete "src"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 2. Codename API routes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
delete "app/api/apex"
delete "app/api/axiom"
delete "app/api/bhs"
delete "app/api/catalyst"
delete "app/api/deep-tracking"
delete "app/api/financial-blindspots"
delete "app/api/genesis"
delete "app/api/graviton"
delete "app/api/layers"
delete "app/api/meridian"
delete "app/api/nexus"
delete "app/api/omega"
delete "app/api/paradox"
delete "app/api/phantom"
delete "app/api/quantum"
delete "app/api/sentinel"
delete "app/api/singularity"
delete "app/api/substrate"
delete "app/api/transaction-intelligence"
delete "app/api/ultra-deep"
delete "app/api/void"
delete "app/api/advanced-tracking"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 3. Codename pages ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
delete "app/apex"
delete "app/axiom"
delete "app/catalyst"
delete "app/deep-tracking"
delete "app/financial-blindspots"
delete "app/genesis"
delete "app/graviton"
delete "app/meridian"
delete "app/nexus"
delete "app/omega"
delete "app/paradox"
delete "app/phantom"
delete "app/quantum"
delete "app/sentinel"
delete "app/singularity"
delete "app/substrate"
delete "app/transaction-intelligence"
delete "app/ultra-deep"
delete "app/void"
delete "app/advanced-tracking"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 4. Codename service engines ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
delete "services/apex"
delete "services/axiom"
delete "services/bhs-engine.ts"
delete "services/catalyst"
delete "services/deep-tracking"
delete "services/financial-blindspots"
delete "services/genesis"
delete "services/graviton"
delete "services/meridian"
delete "services/nexus"
delete "services/omega"
delete "services/paradox"
delete "services/phantom"
delete "services/quantum"
delete "services/sentinel"
delete "services/singularity"
delete "services/substrate"
delete "services/transaction-intelligence"
delete "services/ultra-deep"
delete "services/void"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 5. v1 API routes superseded by v2 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
delete "app/api/chat"
delete "app/api/scan"
delete "app/api/leaks/scan"
delete "app/api/benchmarks"
delete "app/api/analytics"
delete "app/api/compare"
delete "app/api/dashboard"
delete "app/api/stats"
delete "app/api/export"
delete "app/api/demo"
delete "app/api/demo-data"
delete "app/api/reports"
delete "app/api/v1"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 6. v1 scan + estimate service engines ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
delete "services/scan-orchestrator.ts"
delete "services/db-scan-fallback.ts"
delete "services/estimate-engine.ts"
delete "services/snapshot-engine.ts"
delete "services/enterprise-analysis.ts"
delete "services/intelligence-layer-orchestrator.ts"
delete "services/tax-leak-engine.ts"
delete "services/missing-industries.ts"
delete "services/naics-router.ts"
delete "services/industry-profiles.ts"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 7. Industry-specific API routes (replaced by DB) ━━━━━━━━━━━━━━━━━━━"
delete "app/api/industry"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 8. Industry-specific service engines (replaced by DB) ━━━━━━━━━━━━━━"
delete "services/industries"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 9. SPEC / planning docs masquerading as code ━━━━━━━━━━━━━━━━━━━━━━━"
delete "services/prescan-ai-prompt-SPEC.ts"
delete "services/prescan-engine-SPEC.ts"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 10. Debug, setup, dev-only routes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
delete "app/api/debug"
delete "app/api/setup"
delete "app/api/rate-check"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 11. Unshipped integrations ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
delete "app/api/quickbooks"
delete "app/api/integrations"
delete "services/integrations"
delete "services/quickbooks.ts"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 12. Gamification (never shipped) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
delete "services/gamification"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 13. Prompt service files replaced by lib/ai/ ━━━━━━━━━━━━━━━━━━━━━━━"
delete "services/diagnostic/prompt-builder.ts"
delete "services/v2/prompt-builder.ts"
delete "services/prescan-ai-prompt.ts"
delete "services/v2/prescan-prompt.ts"
# Clean up empty directories left behind
rmdir "$ROOT/services/diagnostic" 2>/dev/null && echo "  ✓ services/diagnostic/ (now empty)" || true
rmdir "$ROOT/services/v2"         2>/dev/null && echo "  ✓ services/v2/ (now empty)"         || true

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 14. v2/prescan-chat (old model, OpenAI fallback, not called by UI) ━"
delete "app/api/v2/prescan-chat"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━ 15. Python files in a TypeScript project ━━━━━━━━━━━━━━━━━━━━━━━━━━━"
delete "services/exports/generate-excel.py"
delete "services/exports/generate-pdf.py"

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Done."
echo "  Deleted: $deleted paths"
echo "  Skipped: $skipped (already absent)"
echo ""
echo "Next: tsc --noEmit"
echo "If import errors appear, check MIGRATION.md for the correct lib/ai/ paths."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

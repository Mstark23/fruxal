# Cleanup — Files Deleted

- app/admin/page.tsx (replaced with redirect to /admin/overview)
- app/api/admin/route.ts (unused — /admin/overview uses /api/admin/overview)
- app/api/admin/stats/route.ts (only used by old dark admin dashboard)
- app/api/action-plan/ (unused API route)
- app/scan/ (dead page)
- app/analytics/ (dead page)
- app/benchmarks/ (dead page)
- app/clients/ (dead page)
- app/contracts/ (dead page)
- app/exports/ (dead page)
- app/personal/ (dead page)
- app/recovery/ (dead page)
- app/stats/ (dead page)
- app/intelligence-hub/ (dead page)
- app/industry/ (dead page)
- app/trending/ (dead page)
- app/fix-first/ (dead page)
- app/intelligence/ (dead page)
- app/rates/ (dead page)
- app/tasks/ (dead page — v2 has /v2/leaks)
- app/tools/ (dead page)
- app/dashboard/PrescanSnapshotLoader.tsx (unused component file)
- components/AppShell.tsx (unused)
- components/ErrorBoundaryWrapper.tsx (unused)
- components/LoadingStates.tsx (unused)
- components/MonitoringInit.tsx (unused)
- components/PrescanSnapshot.tsx (unused)
- components/Sidebar.tsx (unused)
- components/Skeleton.tsx (unused)
- components/ThemeProvider.tsx (unused)

## What to delete from your VS Code project

Run in PowerShell from project root:

```powershell
Remove-Item -Force "app/admin/page.tsx"
Remove-Item -Force "app/api/admin/route.ts"
Remove-Item -Force "app/api/admin/stats/route.ts"
Remove-Item -Recurse -Force "app/api/action-plan/"
Remove-Item -Recurse -Force "app/scan/"
Remove-Item -Recurse -Force "app/analytics/"
Remove-Item -Recurse -Force "app/benchmarks/"
Remove-Item -Recurse -Force "app/clients/"
Remove-Item -Recurse -Force "app/contracts/"
Remove-Item -Recurse -Force "app/exports/"
Remove-Item -Recurse -Force "app/personal/"
Remove-Item -Recurse -Force "app/recovery/"
Remove-Item -Recurse -Force "app/stats/"
Remove-Item -Recurse -Force "app/intelligence-hub/"
Remove-Item -Recurse -Force "app/industry/"
Remove-Item -Recurse -Force "app/trending/"
Remove-Item -Recurse -Force "app/fix-first/"
Remove-Item -Recurse -Force "app/intelligence/"
Remove-Item -Recurse -Force "app/rates/"
Remove-Item -Recurse -Force "app/tasks/"
Remove-Item -Recurse -Force "app/tools/"
Remove-Item -Force "app/dashboard/PrescanSnapshotLoader.tsx"
Remove-Item -Force "components/AppShell.tsx"
Remove-Item -Force "components/ErrorBoundaryWrapper.tsx"
Remove-Item -Force "components/LoadingStates.tsx"
Remove-Item -Force "components/MonitoringInit.tsx"
Remove-Item -Force "components/PrescanSnapshot.tsx"
Remove-Item -Force "components/Sidebar.tsx"
Remove-Item -Force "components/Skeleton.tsx"
Remove-Item -Force "components/ThemeProvider.tsx"
```

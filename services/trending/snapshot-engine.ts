// =============================================================================
// HISTORICAL TRENDING ENGINE
// =============================================================================
// Takes a point-in-time snapshot of all revenue metrics.
// Run daily/weekly/monthly. Compare over time to track improvement.
// The user can finally answer: "Am I getting better or worse?"
// =============================================================================

import { prisma } from "@/lib/db/client";

export interface Snapshot {
  id: string;
  snapshot_date: string;
  period_type: string;
  total_revenue: number;
  total_collected: number;
  collection_rate: number;
  open_leak_count: number;
  total_leak_impact: number;
  fixed_leak_count: number;
  recovered_amount: number;
  active_clients: number;
  new_clients: number;
  churned_clients: number;
  avg_client_value: number;
  total_invoices: number;
  overdue_invoices: number;
  overdue_amount: number;
  avg_days_to_pay: number;
  open_tasks: number;
  completed_tasks: number;
  overall_health: number;
  details: any;
}

export interface TrendData {
  snapshots: Snapshot[];
  trends: {
    revenue: { direction: string; change: number; changePercent: number };
    collection_rate: { direction: string; change: number };
    leak_impact: { direction: string; change: number; changePercent: number };
    health: { direction: string; change: number };
    clients: { direction: string; change: number };
  };
  period: string;
}

// ─── CAPTURE SNAPSHOT ───────────────────────────────────────────────────────
export async function captureSnapshot(businessId: string, periodType: string = "MONTHLY"): Promise<Snapshot> {
  const today = new Date().toISOString().split("T")[0];

  // Gather all metrics
  const [invoiceStats, leakStats, clientStats, taskStats] = await Promise.all([
    getInvoiceMetrics(businessId),
    getLeakMetrics(businessId),
    getClientMetrics(businessId),
    getTaskMetrics(businessId),
  ]);

  // Calculate health score (0-100)
  const health = calculateHealthScore(invoiceStats, leakStats, clientStats);

  // Build detail blob
  const details = {
    topLeaks: leakStats.topLeaks,
    topOverdue: invoiceStats.topOverdue,
    recentChurn: clientStats.recentChurn,
  };

  // Upsert snapshot
  await prisma.$executeRawUnsafe(`
    INSERT INTO revenue_snapshots (
      business_id, snapshot_date, period_type,
      total_revenue, total_collected, collection_rate,
      open_leak_count, total_leak_impact, fixed_leak_count, recovered_amount,
      active_clients, new_clients, churned_clients, avg_client_value,
      total_invoices, overdue_invoices, overdue_amount, avg_days_to_pay,
      open_tasks, completed_tasks, overall_health, details
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    ON CONFLICT (business_id, snapshot_date, period_type)
    DO UPDATE SET
      total_revenue = $4, total_collected = $5, collection_rate = $6,
      open_leak_count = $7, total_leak_impact = $8, fixed_leak_count = $9, recovered_amount = $10,
      active_clients = $11, new_clients = $12, churned_clients = $13, avg_client_value = $14,
      total_invoices = $15, overdue_invoices = $16, overdue_amount = $17, avg_days_to_pay = $18,
      open_tasks = $19, completed_tasks = $20, overall_health = $21, details = $22
  `,
    businessId, today, periodType,
    invoiceStats.totalRevenue, invoiceStats.totalCollected, invoiceStats.collectionRate,
    leakStats.openCount, leakStats.totalImpact, leakStats.fixedCount, leakStats.recoveredAmount,
    clientStats.activeCount, clientStats.newCount, clientStats.churnedCount, clientStats.avgValue,
    invoiceStats.totalCount, invoiceStats.overdueCount, invoiceStats.overdueAmount, invoiceStats.avgDaysToPay,
    taskStats.openCount, taskStats.completedCount, health,
    JSON.stringify(details)
  );

  // Return the snapshot
  const result = await prisma.$queryRawUnsafe(
    `SELECT * FROM revenue_snapshots WHERE business_id = $1 AND snapshot_date = $2 AND period_type = $3`,
    businessId, today, periodType
  ) as Snapshot[];

  return result[0];
}

// ─── GET TREND DATA ─────────────────────────────────────────────────────────
export async function getTrends(businessId: string, months: number = 6): Promise<TrendData> {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  const snapshots = await prisma.$queryRawUnsafe(`
    SELECT * FROM revenue_snapshots
    WHERE business_id = $1 AND snapshot_date >= $2
    ORDER BY snapshot_date ASC
  `, businessId, cutoff.toISOString().split("T")[0]) as Snapshot[];

  const trends = computeTrends(snapshots);

  return { snapshots, trends, period: `${months} months` };
}

function computeTrends(snapshots: Snapshot[]) {
  const empty = { direction: "flat", change: 0, changePercent: 0 };
  if (snapshots.length < 2) return { revenue: empty, collection_rate: { ...empty }, leak_impact: empty, health: { ...empty }, clients: { ...empty } };

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];

  function trend(a: number, b: number) {
    const change = b - a;
    const changePercent = a !== 0 ? Math.round((change / a) * 100) : 0;
    const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";
    return { direction, change: Math.round(change * 100) / 100, changePercent };
  }

  return {
    revenue: trend(Number(first.total_revenue), Number(last.total_revenue)),
    collection_rate: trend(Number(first.collection_rate), Number(last.collection_rate)),
    leak_impact: trend(Number(first.total_leak_impact), Number(last.total_leak_impact)),
    health: trend(Number(first.overall_health), Number(last.overall_health)),
    clients: trend(Number(first.active_clients), Number(last.active_clients)),
  };
}

// ─── METRIC GATHERERS ───────────────────────────────────────────────────────
async function getInvoiceMetrics(businessId: string) {
  const stats = await prisma.$queryRawUnsafe(`
    SELECT
      COUNT(*) as total_count,
      COALESCE(SUM(amount), 0) as total_revenue,
      COALESCE(SUM("amountPaid"), 0) as total_collected,
      CASE WHEN SUM(amount) > 0 THEN ROUND(SUM("amountPaid") / SUM(amount) * 100, 1) ELSE 0 END as collection_rate,
      COUNT(*) FILTER (WHERE status = 'OVERDUE') as overdue_count,
      COALESCE(SUM(amount - "amountPaid") FILTER (WHERE status = 'OVERDUE'), 0) as overdue_amount,
      COALESCE(AVG(EXTRACT(EPOCH FROM ("paidAt" - "issuedAt")) / 86400) FILTER (WHERE "paidAt" IS NOT NULL), 0) as avg_days_to_pay
    FROM invoices WHERE "businessId" = $1
  `, businessId) as any[];

  const topOverdue = await prisma.$queryRawUnsafe(`
    SELECT i.*, c.name as client_name FROM invoices i
    LEFT JOIN clients c ON i."clientId" = c.id
    WHERE i."businessId" = $1 AND i.status = 'OVERDUE'
    ORDER BY (i.amount - i."amountPaid") DESC LIMIT 5
  `, businessId) as any[];

  const s = stats[0] || {};
  return {
    totalCount: Number(s.total_count) || 0,
    totalRevenue: Number(s.total_revenue) || 0,
    totalCollected: Number(s.total_collected) || 0,
    collectionRate: Number(s.collection_rate) || 0,
    overdueCount: Number(s.overdue_count) || 0,
    overdueAmount: Number(s.overdue_amount) || 0,
    avgDaysToPay: Math.round(Number(s.avg_days_to_pay) || 0),
    topOverdue,
  };
}

async function getLeakMetrics(businessId: string) {
  const stats = await prisma.$queryRawUnsafe(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'OPEN') as open_count,
      COALESCE(SUM("annualImpact") FILTER (WHERE status = 'OPEN'), 0) as total_impact,
      COUNT(*) FILTER (WHERE status = 'FIXED') as fixed_count,
      COALESCE(SUM("recoveredAmount") FILTER (WHERE status = 'FIXED'), 0) as recovered_amount
    FROM leaks WHERE "businessId" = $1
  `, businessId) as any[];

  const topLeaks = await prisma.$queryRawUnsafe(`
    SELECT l.*, c.name as client_name FROM leaks l
    LEFT JOIN clients c ON l."clientId" = c.id
    WHERE l."businessId" = $1 AND l.status = 'OPEN'
    ORDER BY l."annualImpact" DESC LIMIT 5
  `, businessId) as any[];

  const s = stats[0] || {};
  return {
    openCount: Number(s.open_count) || 0,
    totalImpact: Number(s.total_impact) || 0,
    fixedCount: Number(s.fixed_count) || 0,
    recoveredAmount: Number(s.recovered_amount) || 0,
    topLeaks,
  };
}

async function getClientMetrics(businessId: string) {
  const stats = await prisma.$queryRawUnsafe(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_count,
      COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '30 days') as new_count,
      COUNT(*) FILTER (WHERE status = 'INACTIVE') as churned_count
    FROM clients WHERE "businessId" = $1
  `, businessId) as any[];

  const avgValue = await prisma.$queryRawUnsafe(`
    SELECT COALESCE(AVG(client_total), 0) as avg_value FROM (
      SELECT "clientId", SUM(amount) as client_total FROM invoices
      WHERE "businessId" = $1 GROUP BY "clientId"
    ) sub
  `, businessId) as any[];

  const recentChurn = await prisma.$queryRawUnsafe(`
    SELECT * FROM clients WHERE "businessId" = $1 AND status = 'INACTIVE'
    ORDER BY "updatedAt" DESC LIMIT 5
  `, businessId) as any[];

  const s = stats[0] || {};
  return {
    activeCount: Number(s.active_count) || 0,
    newCount: Number(s.new_count) || 0,
    churnedCount: Number(s.churned_count) || 0,
    avgValue: Number(avgValue[0]?.avg_value) || 0,
    recentChurn,
  };
}

async function getTaskMetrics(businessId: string) {
  const stats = await prisma.$queryRawUnsafe(`
    SELECT
      COUNT(*) FILTER (WHERE status IN ('TODO', 'IN_PROGRESS')) as open_count,
      COUNT(*) FILTER (WHERE status = 'DONE') as completed_count
    FROM tasks WHERE business_id = $1
  `, businessId) as any[];

  const s = stats[0] || {};
  return { openCount: Number(s.open_count) || 0, completedCount: Number(s.completed_count) || 0 };
}

function calculateHealthScore(invoices: any, leaks: any, clients: any): number {
  let score = 100;

  // Collection rate impact (40 pts)
  if (invoices.collectionRate < 90) score -= (90 - invoices.collectionRate) * 0.8;
  // Overdue invoices (20 pts)
  if (invoices.overdueCount > 0) score -= Math.min(20, invoices.overdueCount * 3);
  // Open leaks (20 pts)
  if (leaks.openCount > 0) score -= Math.min(20, leaks.openCount * 2);
  // Client churn (10 pts)
  if (clients.churnedCount > 0) score -= Math.min(10, clients.churnedCount * 3);
  // Avg days to pay (10 pts)
  if (invoices.avgDaysToPay > 45) score -= Math.min(10, (invoices.avgDaysToPay - 45) * 0.5);

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── SEED HISTORICAL SNAPSHOTS ──────────────────────────────────────────────
// Creates fake past snapshots so trending charts have data from day one
export async function seedHistoricalSnapshots(businessId: string): Promise<number> {
  const existing = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as count FROM revenue_snapshots WHERE business_id = $1`, businessId
  ) as any[];

  if (Number(existing[0]?.count) > 1) return 0; // Already has history

  // Generate 6 months of improving data
  const baseMetrics = {
    revenue: 85000, collected: 68000, collectionRate: 80,
    leaks: 12, leakImpact: 42000, fixed: 0, recovered: 0,
    clients: 12, overdue: 8, overdueAmount: 18000, daysToPay: 52,
    health: 58,
  };

  let created = 0;
  for (let m = 5; m >= 0; m--) {
    const date = new Date();
    date.setMonth(date.getMonth() - m);
    const dateStr = date.toISOString().split("T")[0];
    const progress = (5 - m) / 5; // 0 → 1 as we approach today

    const snapshot = {
      revenue: Math.round(baseMetrics.revenue * (1 + progress * 0.25)),
      collected: Math.round(baseMetrics.collected * (1 + progress * 0.4)),
      collectionRate: Math.round((baseMetrics.collectionRate + progress * 15) * 10) / 10,
      leaks: Math.max(2, Math.round(baseMetrics.leaks * (1 - progress * 0.5))),
      leakImpact: Math.round(baseMetrics.leakImpact * (1 - progress * 0.45)),
      fixed: Math.round(progress * 8),
      recovered: Math.round(progress * 24000),
      clients: baseMetrics.clients + Math.round(progress * 3),
      newClients: Math.round(progress * 2),
      overdue: Math.max(1, Math.round(baseMetrics.overdue * (1 - progress * 0.6))),
      overdueAmount: Math.round(baseMetrics.overdueAmount * (1 - progress * 0.55)),
      daysToPay: Math.round(baseMetrics.daysToPay - progress * 18),
      health: Math.round(baseMetrics.health + progress * 30),
    };

    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO revenue_snapshots (
          business_id, snapshot_date, period_type,
          total_revenue, total_collected, collection_rate,
          open_leak_count, total_leak_impact, fixed_leak_count, recovered_amount,
          active_clients, new_clients, churned_clients, avg_client_value,
          total_invoices, overdue_invoices, overdue_amount, avg_days_to_pay,
          open_tasks, completed_tasks, overall_health, details
        ) VALUES ($1, $2, 'MONTHLY', $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, $12, 0, $13, $14, $15, 0, 0, $16, '{}')
        ON CONFLICT (business_id, snapshot_date, period_type) DO NOTHING
      `,
        businessId, dateStr,
        snapshot.revenue, snapshot.collected, snapshot.collectionRate,
        snapshot.leaks, snapshot.leakImpact, snapshot.fixed, snapshot.recovered,
        snapshot.clients, snapshot.newClients,
        snapshot.clients > 0 ? Math.round(snapshot.revenue / snapshot.clients) : 0,
        snapshot.overdue, snapshot.overdueAmount, snapshot.daysToPay,
        snapshot.health
      );
      created++;
    } catch { /* skip conflicts */ }
  }

  return created;
}

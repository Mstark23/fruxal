// =============================================================================
// ACTION WORKFLOW ENGINE
// =============================================================================
// Leak detected → Auto-create task → Assign deadline → Track resolution
// Every leak becomes an action item. No leak gets ignored.
// =============================================================================

import { prisma } from "@/lib/db/client";

export interface Task {
  id: string;
  business_id: string;
  leak_id?: string;
  client_id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category: string;
  assigned_to?: string;
  due_date?: Date;
  completed_at?: Date;
  impact_amount: number;
  recovered_amount: number;
  notes?: string;
  auto_generated: boolean;
  created_at: Date;
  // Joined fields
  client_name?: string;
  leak_type?: string;
}

// ─── AUTO-GENERATE TASKS FROM LEAKS ─────────────────────────────────────────
export async function generateTasksFromLeaks(businessId: string): Promise<{ created: number; skipped: number }> {
  // Get all open leaks that don't have a task yet
  const leaksWithoutTasks = await prisma.$queryRawUnsafe(`
    SELECT l.*, c.name as client_name 
    FROM leaks l 
    LEFT JOIN clients c ON l."clientId" = c.id
    LEFT JOIN tasks t ON t.leak_id = l.id AND t.status != 'DISMISSED'
    WHERE l."businessId" = $1 AND l.status = 'OPEN' AND t.id IS NULL
    ORDER BY l."annualImpact" DESC
  `, businessId) as any[];

  let created = 0;
  let skipped = 0;

  for (const leak of leaksWithoutTasks) {
    try {
      const dueDate = calculateDueDate(leak.priority, leak.annualImpact);
      const task = buildTaskFromLeak(leak, businessId, dueDate);

      await prisma.$executeRawUnsafe(`
        INSERT INTO tasks (business_id, leak_id, client_id, title, description, status, priority, category, due_date, impact_amount, auto_generated)
        VALUES ($1, $2, $3, $4, $5, 'TODO', $6, $7, $8, $9, true)
      `, businessId, leak.id, leak.clientId, task.title, task.description, task.priority, task.category, dueDate, leak.annualImpact);

      created++;
    } catch (err) {
      skipped++;
    }
  }

  return { created, skipped };
}

function calculateDueDate(priority: string, impact: number): Date {
  const now = new Date();
  if (priority === "CRITICAL" || impact > 20000) return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);   // 3 days
  if (priority === "HIGH" || impact > 10000) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);       // 1 week
  if (priority === "MEDIUM" || impact > 5000) return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);     // 2 weeks
  return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);                                                  // 30 days
}

function buildTaskFromLeak(leak: any, businessId: string, dueDate: Date): { title: string; description: string; priority: string; category: string } {
  const clientName = leak.client_name || "Unknown Client";
  const impact = `$${Number(leak.annualImpact).toLocaleString()}/yr`;

  const TASK_TEMPLATES: Record<string, { title: string; description: string; category: string }> = {
    COLLECTION_FAILURE: {
      title: `Collect overdue payment from ${clientName}`,
      description: `${clientName} has overdue invoices. Annual impact: ${impact}.\n\nAction: Send payment reminder → Follow up by phone → Escalate if no response within 5 days.\n\nFix: ${leak.fix || "Contact client about outstanding balance."}`,
      category: "COLLECTION",
    },
    UNDERPRICING: {
      title: `Review pricing for ${clientName}`,
      description: `${clientName} is being billed below market rate. Annual impact: ${impact}.\n\nAction: Prepare rate comparison → Schedule pricing conversation → Implement new rates on next renewal.\n\nFix: ${leak.fix || "Adjust pricing to market rate."}`,
      category: "PRICING",
    },
    SILENT_CHURN: {
      title: `Re-engage ${clientName} — churn risk`,
      description: `${clientName} is showing signs of disengagement. Annual impact: ${impact}.\n\nAction: Schedule check-in call → Understand concerns → Offer retention plan.\n\nFix: ${leak.fix || "Proactive outreach to prevent churn."}`,
      category: "RETENTION",
    },
    SCOPE_CREEP: {
      title: `Address scope creep with ${clientName}`,
      description: `Work for ${clientName} exceeds contracted scope. Annual impact: ${impact}.\n\nAction: Document extra work → Schedule scope review → Propose change order or rate adjustment.\n\nFix: ${leak.fix || "Realign scope with billing."}`,
      category: "PRICING",
    },
    CONCENTRATION: {
      title: `Diversify revenue — ${clientName} concentration risk`,
      description: `${clientName} represents excessive revenue share. Annual impact if lost: ${impact}.\n\nAction: Identify 3 prospective clients → Launch outreach → Reduce dependency over 6 months.\n\nFix: ${leak.fix || "Diversify client base to reduce risk."}`,
      category: "RETENTION",
    },
    PARTIAL_PAYMENT: {
      title: `Follow up on partial payment from ${clientName}`,
      description: `${clientName} has partially paid invoices. Annual impact: ${impact}.\n\nAction: Send statement showing balance → Call to arrange payment plan → Set auto-reminder.\n\nFix: ${leak.fix || "Collect remaining balance."}`,
      category: "COLLECTION",
    },
    LATE_PAYMENT: {
      title: `Improve payment timing for ${clientName}`,
      description: `${clientName} consistently pays late. Annual impact: ${impact}.\n\nAction: Review payment terms → Offer early payment discount → Consider auto-billing.\n\nFix: ${leak.fix || "Tighten payment terms or offer incentives."}`,
      category: "COLLECTION",
    },
  };

  const template = TASK_TEMPLATES[leak.type] || {
    title: `Fix revenue leak: ${clientName}`,
    description: `${leak.description || "Revenue leak detected"}. Annual impact: ${impact}.\n\nFix: ${leak.fix || "Review and address."}`,
    category: "LEAK_FIX",
  };

  return { ...template, priority: leak.priority || "MEDIUM" };
}

// ─── TASK CRUD ──────────────────────────────────────────────────────────────
export async function getTasks(businessId: string, status?: string): Promise<Task[]> {
  let query = `
    SELECT t.*, c.name as client_name, l.type as leak_type
    FROM tasks t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN leaks l ON t.leak_id = l.id
    WHERE t.business_id = $1
  `;
  const params: any[] = [businessId];

  if (status && status !== "ALL") {
    query += ` AND t.status = $2`;
    params.push(status);
  }

  query += ` ORDER BY
    CASE t.priority WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
    t.due_date ASC NULLS LAST`;

  return prisma.$queryRawUnsafe(query, ...params) as Promise<Task[]>;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
  const sets: string[] = ["updated_at = NOW()"];
  const params: any[] = [];
  let idx = 1;

  if (updates.status !== undefined) { sets.push(`status = $${idx++}`); params.push(updates.status); }
  if (updates.priority !== undefined) { sets.push(`priority = $${idx++}`); params.push(updates.priority); }
  if (updates.assigned_to !== undefined) { sets.push(`assigned_to = $${idx++}`); params.push(updates.assigned_to); }
  if (updates.due_date !== undefined) { sets.push(`due_date = $${idx++}`); params.push(updates.due_date); }
  if (updates.notes !== undefined) { sets.push(`notes = $${idx++}`); params.push(updates.notes); }
  if (updates.recovered_amount !== undefined) { sets.push(`recovered_amount = $${idx++}`); params.push(updates.recovered_amount); }
  if (updates.status === "DONE") { sets.push(`completed_at = NOW()`); }

  params.push(taskId);

  await prisma.$executeRawUnsafe(
    `UPDATE tasks SET ${sets.join(", ")} WHERE id = $${idx}`, ...params
  );

  // If completing a task linked to a leak, update the leak too
  if (updates.status === "DONE") {
    const task = await prisma.$queryRawUnsafe(`SELECT leak_id, recovered_amount FROM tasks WHERE id = $1`, taskId) as any[];
    if (task[0]?.leak_id) {
      await prisma.$executeRawUnsafe(
        `UPDATE leaks SET status = 'FIXED', "recoveredAmount" = $1, "updatedAt" = NOW() WHERE id = $2`,
        updates.recovered_amount || 0, task[0].leak_id
      );
    }
  }
}

export async function createManualTask(businessId: string, data: { title: string; description?: string; priority: string; category: string; client_id?: string; due_date?: string; impact_amount?: number }): Promise<string> {
  const result = await prisma.$queryRawUnsafe(`
    INSERT INTO tasks (business_id, client_id, title, description, status, priority, category, due_date, impact_amount, auto_generated)
    VALUES ($1, $2, $3, $4, 'TODO', $5, $6, $7, $8, false) RETURNING id
  `, businessId, data.client_id || null, data.title, data.description || null, data.priority, data.category, data.due_date ? new Date(data.due_date) : null, data.impact_amount || 0) as any[];

  return result[0].id;
}

// ─── TASK STATS ─────────────────────────────────────────────────────────────
export async function getTaskStats(businessId: string) {
  const stats = await prisma.$queryRawUnsafe(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'TODO') as todo,
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress,
      COUNT(*) FILTER (WHERE status = 'DONE') as done,
      COUNT(*) FILTER (WHERE status = 'DISMISSED') as dismissed,
      COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('DONE', 'DISMISSED')) as overdue,
      COALESCE(SUM(impact_amount) FILTER (WHERE status NOT IN ('DONE', 'DISMISSED')), 0) as open_impact,
      COALESCE(SUM(recovered_amount) FILTER (WHERE status = 'DONE'), 0) as total_recovered,
      COUNT(*) as total
    FROM tasks WHERE business_id = $1
  `, businessId) as any[];

  return stats[0] || {};
}

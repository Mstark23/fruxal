import { NextRequest, NextResponse } from "next/server";
import { generateTasksFromLeaks, getTasks, updateTask, getTaskStats } from "@/services/workflows/task-engine";

export async function GET(req: NextRequest) {
  const businessId = req.nextUrl.searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });

  try {
    const status = req.nextUrl.searchParams.get("status") || undefined;
    const [tasks, stats] = await Promise.all([
      getTasks(businessId, status),
      getTaskStats(businessId),
    ]);
    return NextResponse.json({ tasks, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId } = await req.json();
    if (!businessId) return NextResponse.json({ error: "businessId required" }, { status: 400 });
    const result = await generateTasksFromLeaks(businessId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { taskId, ...updates } = await req.json();
    if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });
    await updateTask(taskId, updates);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

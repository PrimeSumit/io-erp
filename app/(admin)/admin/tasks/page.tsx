import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { redirect } from "next/navigation";
import { TaskMonitorTable } from "@/components/admin/task-monitor-table";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default async function TaskMonitorPage() {
  const supabase = await createClient();
  const profile = await getProfile();

  if (profile?.role !== "admin") redirect("/");

  // 1. Get all department IDs that belong to the Admin's Organization
  const { data: departments } = await supabase
    .from("departments")
    .select("id")
    .eq("organization_id", profile.organization_id);

  const departmentIds = departments?.map((d) => d.id) || [];

  let allTasks: any[] = [];

  // 2. Only fetch tasks if the organization actually has departments
  if (departmentIds.length > 0) {
    // 3. Initialize the Admin Client to bypass the RLS blocks
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // 👇 FIXED: Update query to fetch the 'task_assignees' array instead of the old 'assigned_to'
    const { data: tasks, error } = await supabaseAdmin
      .from("tasks")
      .select(
        `
        id,
        title,
        status,
        priority,
        due_date,
        department:departments ( name ),
        assignees:task_assignees (
          user:users ( id, name, email )
        )
      `,
      )
      .in("department_id", departmentIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
    }

    allTasks = tasks || [];
  }

  // 5. Calculate Stats
  const stats = {
    total: allTasks.length,
    inProgress: allTasks.filter(
      (t) => t.status === "in_progress" || t.status === "assigned",
    ).length,
    inReview: allTasks.filter((t) => t.status === "submitted").length,
    revision: allTasks.filter((t) => t.status === "rejected").length,
    completed: allTasks.filter(
      (t) => t.status === "approved" || t.status === "completed",
    ).length,
  };

  return (
    <div className="space-y-6">
      <TaskMonitorTable tasks={allTasks as any} />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    red: "bg-red-50 text-red-600 border-red-100",
    green: "bg-green-50 text-green-600 border-green-200",
  };

  return (
    <div
      className={`p-4 rounded-xl border ${colors[color]} flex items-center gap-4`}
    >
      <div className="p-2 bg-white/60 rounded-lg">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">
          {label}
        </p>
      </div>
    </div>
  );
}

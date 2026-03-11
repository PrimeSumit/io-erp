export const dynamic = "force-dynamic";

import { getProfile } from "@/lib/supabase/get-profile";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js"; // 👈 Imported Admin Client
import {
  Users,
  Building2,
  Ticket,
  Activity,
  AlertCircle,
  Clock,
  Database,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const profile = await getProfile();
  if (profile?.role !== "admin") redirect("/");

  const supabase = await createClient();

  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .neq("role", "admin");

  const { count: totalDepts } = await supabase
    .from("departments")
    .select("*", { count: "exact", head: true });

  const { count: pendingTickets } = await supabase
    .from("support_tickets")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  // 👇 FIX: Get the organization's departments to securely fetch all tasks
  const { data: departments } = await supabase
    .from("departments")
    .select("id")
    .eq("organization_id", profile.organization_id);

  const departmentIds = departments?.map((d) => d.id) || [];

  // 👇 FIX: Initialize the Admin Client to bypass RLS for dashboard stats
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let activeTasksCount = 0;
  let allTasks: any[] = [];

  if (departmentIds.length > 0) {
    const { count } = await supabaseAdmin
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .in("status", ["assigned", "in_progress", "submitted"])
      .in("department_id", departmentIds); // Only get tasks for this org

    activeTasksCount = count || 0;

    const { data } = await supabaseAdmin
      .from("tasks")
      .select("status, priority, due_date")
      .in("department_id", departmentIds);

    allTasks = data || [];
  }

  const statusCounts = {
    draft: 0,
    in_progress: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
  };

  const healthStats = {
    overdue: 0,
    highPriority: 0,
  };

  const now = new Date();

  // Process the tasks for the charts
  allTasks.forEach((task) => {
    if (task.status === "draft") {
      statusCounts.draft++;
    } else if (task.status === "in_progress" || task.status === "assigned") {
      statusCounts.in_progress++;
    } else if (task.status === "submitted") {
      statusCounts.submitted++;
    } else if (task.status === "approved" || task.status === "completed") {
      statusCounts.approved++;
    } else if (task.status === "rejected") {
      statusCounts.rejected++;
    }

    const isActive = ["assigned", "in_progress", "submitted"].includes(
      task.status,
    );

    if (isActive) {
      if (task.priority === "high" || task.priority === "critical") {
        healthStats.highPriority++;
      }

      if (task.due_date && new Date(task.due_date) < now) {
        healthStats.overdue++;
      }
    }
  });

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("action, created_at, performed_by, users(name)")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers || 0}
          subtitle="Employees & Managers"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Departments"
          value={totalDepts || 0}
          subtitle="Active Departments"
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Pending Tickets"
          value={pendingTickets || 0}
          subtitle="Support Requests"
          icon={Ticket}
          color="orange"
        />
        <StatCard
          title="Active Tasks"
          value={activeTasksCount}
          subtitle="In Progress / Review"
          icon={Activity}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Task Overview
          </h3>
          <div className="flex-1 flex items-end justify-between gap-4 px-2 min-h-[200px]">
            <BarColumn
              label="Draft"
              count={statusCounts.draft}
              color="bg-gray-400"
            />
            <BarColumn
              label="In Progress"
              count={statusCounts.in_progress}
              color="bg-blue-500"
            />
            <BarColumn
              label="In Review"
              count={statusCounts.submitted}
              color="bg-yellow-500"
            />
            <BarColumn
              label="Approved"
              count={statusCounts.approved}
              color="bg-green-500"
            />
            <BarColumn
              label="Rejected"
              count={statusCounts.rejected}
              color="bg-red-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Activity className="h-5 w-5 text-primary" /> System Health
            </h3>
            <div className="space-y-3">
              <HealthRow
                label="Overdue Tasks"
                count={healthStats.overdue}
                color="red"
                icon={Clock}
              />
              <HealthRow
                label="High Priority"
                count={healthStats.highPriority}
                color="orange"
                icon={AlertCircle}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-50/50"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Data Retention
                </h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">12</span>
                <span className="text-sm font-medium text-gray-600">
                  Months History
                </span>
              </div>
            </div>
            <div className="relative z-10 mt-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Policy Active
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Audit Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-white text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Performed By</th>
                <th className="px-6 py-3">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {!logs || logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center">
                    No recent activity found.
                  </td>
                </tr>
              ) : (
                logs.map((log: any, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      {log.users?.name || "Unknown User"}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colorClasses: any = {
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
    green: "text-green-600 bg-green-50",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClasses[color]}`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function BarColumn({ label, count, color }: any) {
  const height = count === 0 ? "4px" : `${Math.min((count / 10) * 100, 100)}%`;
  return (
    <div className="flex flex-col items-center justify-end w-full group h-full">
      <div className="relative w-full max-w-[50px] h-full flex items-end rounded-t-lg bg-gray-50/50">
        <div
          className={`w-full rounded-t-md transition-all duration-700 ease-out relative ${color}`}
          style={{ height }}
        >
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
            {count} Tasks
          </div>
        </div>
      </div>
      <span className="mt-3 text-[10px] text-center font-bold text-gray-500 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function HealthRow({ label, count, color, icon: Icon }: any) {
  const bgColors: any = { red: "bg-red-50", orange: "bg-orange-50" };
  const textColors: any = { red: "text-red-700", orange: "text-orange-700" };
  const iconColors: any = { red: "text-red-600", orange: "text-orange-600" };
  return (
    <div
      className={`flex items-center justify-between rounded-lg p-3 ${bgColors[color]}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-full bg-white p-1.5 shadow-sm ${iconColors[color]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className={`text-sm font-medium ${textColors[color]}`}>
          {label}
        </span>
      </div>
      <span className={`text-xl font-bold ${textColors[color]}`}>{count}</span>
    </div>
  );
}

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { ModernDonut } from "@/components/manager/modern-donut";
import { ActivityChart } from "@/components/manager/activity-chart";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  TrendingUp,
  PieChart,
  ChevronRight,
  ListTodo,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default async function EmployeeDashboard() {
  const supabase = await createClient();
  const profile = await getProfile();
  const today = new Date();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, priority, created_at, updated_at, due_date")
    .eq("assigned_to", profile.id)
    .order("updated_at", { ascending: false });

  const stats = {
    assigned: 0,
    in_progress: 0,
    pending_review: 0,
    overdue: 0,
  };

  const priorityCounts = { low: 0, medium: 0, high: 0, critical: 0 };

  tasks?.forEach((t: any) => {
    if (t.status === "assigned") stats.assigned++;
    if (t.status === "in_progress") stats.in_progress++;
    if (["submitted", "in_review"].includes(t.status)) stats.pending_review++;

    const isFinished = ["approved", "completed", "rejected"].includes(t.status);
    const dueDate = new Date(t.due_date);

    if (!isFinished && dueDate < today) {
      stats.overdue++;
    }

    if (["in_progress", "submitted", "assigned"].includes(t.status)) {
      if (t.priority === "low") priorityCounts.low++;
      if (t.priority === "medium") priorityCounts.medium++;
      if (t.priority === "high") priorityCounts.high++;
      if (t.priority === "critical") priorityCounts.critical++;
    }
  });

  const totalActive =
    priorityCounts.low +
    priorityCounts.medium +
    priorityCounts.high +
    priorityCounts.critical;

  const chartData = [];
  const chartToday = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(chartToday);
    d.setDate(chartToday.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { weekday: "short" });

    const count =
      tasks?.filter((t: any) => t.created_at.startsWith(dateStr)).length || 0;
    chartData.push({ date: label, count });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned Tasks"
          value={stats.assigned}
          icon={Briefcase}
          color="gray"
        />

        <StatCard
          title="In Progress"
          value={stats.in_progress}
          icon={Clock}
          color="blue"
        />

        <StatCard
          title="Pending Review"
          value={stats.pending_review}
          icon={ListTodo}
          color="yellow"
        />

        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertCircle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-400" /> My Activity
            </h3>
            <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">
              Last 7 Days
            </span>
          </div>
          <div className="flex-1 w-full">
            <ActivityChart data={chartData} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-gray-400" /> Priority Load
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ModernDonut
              data={[
                {
                  label: "Critical",
                  value: priorityCounts.critical,
                  color: "#ef4444",
                },
                { label: "High", value: priorityCounts.high, color: "#f97316" },
                {
                  label: "Medium",
                  value: priorityCounts.medium,
                  color: "#3b82f6",
                },
                { label: "Low", value: priorityCounts.low, color: "#e5e7eb" },
              ]}
              total={totalActive}
            />

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2">
              <LegendItem
                color="bg-red-500"
                label="Critical"
                count={priorityCounts.critical}
              />
              <LegendItem
                color="bg-orange-500"
                label="High"
                count={priorityCounts.high}
              />
              <LegendItem
                color="bg-blue-500"
                label="Medium"
                count={priorityCounts.medium}
              />
              <LegendItem
                color="bg-gray-300"
                label="Low"
                count={priorityCounts.low}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-gray-400" /> Recent Assignments
          </h3>
          <Link
            href="/employee/work"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View All Tasks <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {tasks?.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs ${task.priority === "critical" ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-50 text-gray-600 border border-gray-100"}`}
                >
                  {task.priority.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {task.title}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={task.status} />
                <Link
                  href={`/employee/work/${task.id}`}
                  className="p-2 bg-gray-50 text-gray-400 rounded-lg group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
          {(!tasks || tasks.length === 0) && (
            <div className="p-12 text-center text-gray-400 text-sm font-medium italic">
              No tasks currently assigned to you.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// UI HELPER COMPONENTS
function StatCard({ title, value, icon: Icon, color }: any) {
  const styles: any = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className={`p-3 rounded-full ${styles[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}

function LegendItem({ color, label, count }: any) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span>
      {label} <span className="text-gray-400">({count})</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    assigned: "bg-gray-100 text-gray-500 border-gray-200",
    in_progress: "bg-blue-50 text-blue-600 border-blue-100",
    submitted: "bg-purple-50 text-purple-600 border-purple-100",
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${styles[status] || styles.assigned}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

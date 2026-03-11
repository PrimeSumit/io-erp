import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { ModernDonut } from "@/components/manager/modern-donut";
import { ActivityChart } from "@/components/manager/activity-chart";
import {
  BarChart3,
  PieChart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default async function ManagerDashboard() {
  const supabase = await createClient();
  const profile = await getProfile();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("status, priority, created_at")
    .eq("department_id", profile.department_id);

  const statusCounts = { in_progress: 0, submitted: 0, completed: 0 };
  const priorityCounts = { low: 0, medium: 0, high: 0, critical: 0 };

  tasks?.forEach((t: any) => {
    if (["in_progress", "assigned"].includes(t.status))
      statusCounts.in_progress++;
    if (["submitted", "in_review"].includes(t.status)) statusCounts.submitted++;
    if (["approved", "completed"].includes(t.status)) statusCounts.completed++;

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
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
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
          title="In Progress"
          value={statusCounts.in_progress}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Waiting Review"
          value={statusCounts.submitted}
          icon={AlertCircle}
          color="yellow"
        />
        <StatCard
          title="Completed"
          value={statusCounts.completed}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Total Active"
          value={totalActive}
          icon={Briefcase}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-400" /> Weekly Activity
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
            <PieChart className="h-5 w-5 text-gray-400" /> Priority Breakdown
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
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className={`p-3 rounded-full ${colors[color]}`}>
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

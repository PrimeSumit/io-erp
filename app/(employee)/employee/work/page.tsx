export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { TaskFilters } from "@/components/employee/task-filters";
import { Clock, CheckCircle2, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default async function EmployeeWorkPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const profile = await getProfile();

  const q = searchParams.q || "";
  const status = searchParams.status || "all";
  const priority = searchParams.priority || "all";
  const date = searchParams.date || "";

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", profile.id)
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }
  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (priority && priority !== "all") {
    query = query.eq("priority", priority);
  }
  if (date) {
    query = query.eq("due_date", date);
  }

  const { data: tasks } = await query;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
        <TaskFilters />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[50%]">
                  Task Details
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[25%] text-center">
                  Priority
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[25%] text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!tasks || tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-16 text-center text-gray-400 font-medium italic"
                  >
                    No tasks found matching your filters.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="p-0">
                      <Link
                        href={`/employee/work/${task.id}`}
                        className="block py-4 px-6"
                      >
                        <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link
                        href={`/employee/work/${task.id}`}
                        className="flex justify-center py-4 px-6"
                      >
                        <PriorityBadge priority={task.priority} />
                      </Link>
                    </td>
                    <td className="p-0">
                      <Link
                        href={`/employee/work/${task.id}`}
                        className="flex justify-center py-4 px-6"
                      >
                        <StatusBadge status={task.status} />
                      </Link>
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

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    assigned: "bg-gray-100 text-gray-600 border-gray-200",
    in_progress: "bg-blue-50 text-blue-600 border-blue-100",
    submitted: "bg-yellow-50 text-yellow-600 border-yellow-100 animate-pulse",
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${
        styles[status] || styles.assigned
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: any = {
    low: "text-gray-400",
    medium: "text-blue-500",
    high: "text-orange-500",
    critical: "text-red-600",
  };
  return (
    <div
      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${colors[priority]}`}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor]" />
      {priority}
    </div>
  );
}

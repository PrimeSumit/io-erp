export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { CreateTaskModal } from "@/components/manager/create-task-modal";
import { TaskFilters } from "@/components/manager/task-filters";
import { EditTaskModal } from "@/components/manager/edit-task-modal";
import { DeleteTaskButton } from "@/components/manager/delete-task-button";
import { Clock, ChevronLeft, ChevronRight, User } from "lucide-react";
import Link from "next/link";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function TaskMonitor(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const profile = await getProfile();

  const { data: employees } = await supabase
    .from("users")
    .select("id, name")
    .eq("department_id", profile.department_id)
    .eq("role", "employee");

  const pageSize = 10;
  const page = Number(searchParams.page) || 1;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const q = typeof searchParams.q === "string" ? searchParams.q : "";
  const status =
    typeof searchParams.status === "string" ? searchParams.status : "";
  const priority =
    typeof searchParams.priority === "string" ? searchParams.priority : "";
  const assignee =
    typeof searchParams.assignee === "string" ? searchParams.assignee : "";

  // Dynamic Select String
  let selectString = `
    *, 
    assignees:task_assignees (
      user:users ( id, name, email )
    )
  `;

  if (assignee && assignee !== "all" && assignee !== "unassigned") {
    selectString = `
      *, 
      assignees:task_assignees!inner (
        user:users ( id, name, email )
      )
    `;
  }

  // 1. Query
  let query = supabase
    .from("tasks")
    .select(selectString, { count: "exact" })
    .eq("department_id", profile.department_id)
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("title", `%${q}%`);
  if (status && status !== "all") query = query.eq("status", status);
  if (priority && priority !== "all") query = query.eq("priority", priority);

  if (assignee && assignee !== "all") {
    if (assignee === "unassigned") {
      query = query.eq("status", "draft");
    } else {
      query = query.eq("assignees.user_id", assignee);
    }
  }

  // Apply Pagination
  const { data, count } = await query.range(from, to);
  const tasks = data as any[] | null;

  const totalPages = Math.ceil((count || 0) / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        <div className="w-full xl:flex-1">
          <TaskFilters employees={employees || []} />
        </div>
        <div className="shrink-0">
          <CreateTaskModal departmentId={profile.department_id} />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="w-full overflow-x-auto overflow-y-visible pb-24">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[50%]">
                  Task
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[15%]">
                  Assignees
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[15%]">
                  Status
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[10%]">
                  Priority
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider w-[10%] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!tasks || tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No tasks found matching your filters.
                  </td>
                </tr>
              ) : (
                tasks.map((task: any) => {
                  const displayStatus =
                    !task.assignees || task.assignees.length === 0
                      ? "draft"
                      : task.status;

                  const MAX_VISIBLE = 3;
                  const visibleAssignees =
                    task.assignees?.slice(0, MAX_VISIBLE) || [];
                  const remainingCount =
                    (task.assignees?.length || 0) - MAX_VISIBLE;

                  return (
                    <tr
                      key={task.id}
                      className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="p-0">
                        <Link
                          href={`/manager/tasks/${task.id}`}
                          className="block py-4 px-6"
                        >
                          {/* 👇 FIXED: Removed truncate and added whitespace-normal with line-clamp-2 */}
                          <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors whitespace-normal line-clamp-2 pr-4">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                              Due:{" "}
                              {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="p-0">
                        <Link
                          href={`/manager/tasks/${task.id}`}
                          className="flex items-center gap-2 py-4 px-6"
                        >
                          <div className="flex items-center -space-x-2 relative">
                            {visibleAssignees.map(
                              (assignee: any, idx: number) => (
                                <div
                                  key={assignee.user.id}
                                  className="relative group/avatar h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold border-2 border-white text-purple-700 shadow-sm hover:z-20 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                                  style={{ zIndex: 10 - idx }}
                                >
                                  {assignee.user.name.charAt(0).toUpperCase()}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/avatar:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-[100]">
                                    {assignee.user.name}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                  </div>
                                </div>
                              ),
                            )}

                            {remainingCount > 0 && (
                              <div
                                className="relative group/more h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold border-2 border-white text-gray-600 shadow-sm hover:z-20 cursor-pointer"
                                style={{ zIndex: 0 }}
                              >
                                +{remainingCount}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/more:block bg-gray-900 text-white text-[10px] px-3 py-2 rounded-lg shadow-xl z-[100] min-w-[100px]">
                                  <p className="font-bold text-gray-400 uppercase text-[9px] mb-1">
                                    Others:
                                  </p>
                                  <div className="flex flex-col gap-0.5">
                                    {task.assignees
                                      .slice(MAX_VISIBLE)
                                      .map((a: any) => (
                                        <span
                                          key={a.user.id}
                                          className="block whitespace-nowrap"
                                        >
                                          {a.user.name}
                                        </span>
                                      ))}
                                  </div>
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                </div>
                              </div>
                            )}

                            {(!task.assignees ||
                              task.assignees.length === 0) && (
                              <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200 border-dashed">
                                <User className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
                        </Link>
                      </td>

                      <td className="p-0">
                        <Link
                          href={`/manager/tasks/${task.id}`}
                          className="block py-4 px-6"
                        >
                          <StatusBadge status={displayStatus} />
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link
                          href={`/manager/tasks/${task.id}`}
                          className="block py-4 px-6"
                        >
                          <PriorityBadge priority={task.priority} />
                        </Link>
                      </td>

                      <td className="py-4 px-6 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <EditTaskModal
                            task={task}
                            employees={employees || []}
                            triggerType="icon"
                          />
                          <DeleteTaskButton
                            taskId={task.id}
                            taskTitle={task.title}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between mt-auto">
          <span className="text-xs font-medium text-gray-500">
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Link
              href={`?page=${page - 1}`}
              className={`p-2 rounded-lg border transition-all ${
                hasPrevPage
                  ? "bg-white hover:bg-gray-50 text-gray-600 shadow-sm"
                  : "bg-gray-50 text-gray-300 pointer-events-none"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href={`?page=${page + 1}`}
              className={`p-2 rounded-lg border transition-all ${
                hasNextPage
                  ? "bg-white hover:bg-gray-50 text-gray-600 shadow-sm"
                  : "bg-gray-50 text-gray-300 pointer-events-none"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    draft: "bg-gray-100 text-gray-500",
    assigned: "bg-purple-50 text-purple-600",
    in_progress: "bg-blue-50 text-blue-600",
    submitted: "bg-yellow-50 text-yellow-600",
    approved: "bg-green-50 text-green-600",
    rejected: "bg-red-50 text-red-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${styles[status] || styles.draft}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: any = {
    low: "text-gray-500",
    medium: "text-blue-500",
    high: "text-orange-500",
    critical: "text-red-600",
  };
  return (
    <div
      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${colors[priority]}`}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </div>
  );
}

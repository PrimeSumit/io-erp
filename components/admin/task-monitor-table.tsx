"use client";

import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  XCircle,
  User,
  Filter,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_date: string | null;
  assignees?: any[];
  department?: { name: string };
}

export function TaskMonitorTable({ tasks }: { tasks: Task[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [date, setDate] = useState("");
  const [assignee, setAssignee] = useState("all");

  const assigneeOptions = useMemo(() => {
    const allUsers = tasks.flatMap(
      (t) => t.assignees?.map((a) => a.user) || [],
    );
    const uniqueUsers = Array.from(
      new Map(allUsers.filter(Boolean).map((u) => [u.id, u])).values(),
    );

    return [
      { label: "Any Assignee", value: "all" },
      { label: "Unassigned", value: "unassigned" },
      ...uniqueUsers.map((u) => ({ label: u.name, value: u.id })),
    ];
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    // 1. Search (Title)
    if (search && !task.title.toLowerCase().includes(search.toLowerCase()))
      return false;

    // 2. Status
    if (status !== "all") {
      if (status === "in_progress") {
        if (task.status !== "in_progress" && task.status !== "assigned")
          return false;
      } else if (status === "approved") {
        if (task.status !== "approved" && task.status !== "completed")
          return false;
      } else {
        if (task.status !== status) return false;
      }
    }

    // 3. Priority
    if (priority !== "all" && task.priority !== priority) return false;

    // 4. Date
    if (date) {
      const taskDate = task.due_date
        ? new Date(task.due_date).toISOString().split("T")[0]
        : null;
      if (taskDate !== date) return false;
    }

    // 5. Assignee
    if (assignee !== "all") {
      if (assignee === "unassigned") {
        if (task.assignees && task.assignees.length > 0) return false;
      } else {
        const hasAssignee = task.assignees?.some(
          (a) => a.user?.id === assignee,
        );
        if (!hasAssignee) return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 w-full bg-gray-50/50 p-3 rounded-xl border border-gray-200">
        <div className="relative w-124 shrink-0 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <FilterSelect
          value={assignee}
          onChange={setAssignee}
          icon={User}
          options={assigneeOptions}
        />

        <FilterSelect
          value={status}
          onChange={setStatus}
          icon={Filter}
          options={[
            { label: "Any Status", value: "all" },
            { label: "Draft (Unassigned)", value: "draft" },
            { label: "In Progress", value: "in_progress" },
            { label: "In Review", value: "submitted" },
            { label: "Completed", value: "approved" },
            { label: "Needs Revision", value: "rejected" },
          ]}
        />

        <FilterSelect
          value={priority}
          onChange={setPriority}
          icon={AlertCircle}
          options={[
            { label: "Any Priority", value: "all" },
            { label: "Critical", value: "critical" },
            { label: "High", value: "high" },
            { label: "Medium", value: "medium" },
            { label: "Low", value: "low" },
          ]}
        />

        <div className="relative group">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:border-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer h-[34px]"
          />
        </div>

        {(search ||
          status !== "all" ||
          priority !== "all" ||
          date ||
          assignee !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setStatus("all");
              setPriority("all");
              setDate("");
              setAssignee("all");
            }}
            className="ml-auto text-xs font-bold text-gray-400 hover:text-red-600 transition-colors px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-visible">
        <div className="overflow-x-auto overflow-y-visible pb-16">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Task Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Assignees
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No tasks found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  // 👇 FIXED: Safely filter out assignees where the user data is null/hidden
                  const validAssignees =
                    task.assignees?.filter((a: any) => a && a.user) || [];
                  const MAX_VISIBLE = 3;
                  const visibleAssignees = validAssignees.slice(0, MAX_VISIBLE);
                  const remainingCount = validAssignees.length - MAX_VISIBLE;

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4 w-[40%]">
                        <p className="text-sm font-bold text-gray-900 whitespace-normal line-clamp-2 pr-4">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {task.department?.name || "Global"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center -space-x-1.5 relative">
                          {validAssignees.length > 0 ? (
                            <>
                              {visibleAssignees.map((a: any, idx: number) => (
                                <div
                                  key={a.user.id}
                                  className="relative group/avatar h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold border-2 border-white text-purple-700 shadow-sm hover:z-20 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                                  style={{ zIndex: 10 - idx }}
                                >
                                  {/* 👇 Safely grabs the first letter, with a fallback just in case */}
                                  {(a.user.name || "?").charAt(0).toUpperCase()}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/avatar:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-[100]">
                                    {a.user.name || "Unknown User"}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                  </div>
                                </div>
                              ))}
                              {remainingCount > 0 && (
                                <div
                                  className="relative group/more h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold border-2 border-white text-gray-600 shadow-sm hover:z-20 cursor-pointer"
                                  style={{ zIndex: 0 }}
                                >
                                  +{remainingCount}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/more:block bg-gray-900 text-white text-[10px] px-3 py-2 rounded-lg shadow-xl z-[100] min-w-[100px] text-left">
                                    <p className="font-bold text-gray-400 uppercase text-[9px] mb-1">
                                      Others:
                                    </p>
                                    <div className="flex flex-col gap-0.5">
                                      {validAssignees
                                        .slice(MAX_VISIBLE)
                                        .map((a: any) => (
                                          <span
                                            key={a.user.id}
                                            className="block whitespace-nowrap"
                                          >
                                            {a.user.name || "Unknown User"}
                                          </span>
                                        ))}
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200 border-dashed">
                              <User className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, icon: Icon, options }: any) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-3 pr-8 py-2 h-[34px] rounded-lg border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:border-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none min-w-[130px] transition-all cursor-pointer"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-primary pointer-events-none transition-colors" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    draft: "bg-gray-100 text-gray-500 border-gray-200",
    assigned: "bg-blue-50 text-blue-700 border-blue-100",
    in_progress: "bg-blue-50 text-blue-700 border-blue-100",
    submitted: "bg-yellow-50 text-yellow-700 border-yellow-100",
    approved: "bg-green-50 text-green-700 border-green-100",
    completed: "bg-green-50 text-green-700 border-green-100",
    rejected: "bg-red-50 text-red-700 border-red-100",
  };

  const labels: any = {
    draft: "Draft",
    assigned: "To Do",
    in_progress: "In Progress",
    submitted: "In Review",
    approved: "Completed",
    completed: "Completed",
    rejected: "Needs Revision",
  };

  const icons: any = {
    draft: Circle,
    assigned: Circle,
    in_progress: Clock,
    submitted: AlertCircle,
    approved: CheckCircle2,
    completed: CheckCircle2,
    rejected: XCircle,
  };

  const Icon = icons[status] || Circle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${styles[status] || styles.draft}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {labels[status] || status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "critical") {
    return (
      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
        Critical
      </span>
    );
  }
  if (priority === "high") {
    return (
      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
        High
      </span>
    );
  }
  if (priority === "medium") {
    return (
      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
        Medium
      </span>
    );
  }
  return (
    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
      Low
    </span>
  );
}

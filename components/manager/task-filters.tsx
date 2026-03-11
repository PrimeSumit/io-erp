"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, AlertCircle, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

export function TaskFilters({
  employees = [],
}: {
  employees?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [text, setText] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [priority, setPriority] = useState(
    searchParams.get("priority") || "all",
  );
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [assignee, setAssignee] = useState(
    searchParams.get("assignee") || "all",
  );

  const [debouncedQuery] = useDebounce(text, 500);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentQ = params.get("q") || "";
    const currentStatus = params.get("status") || "all";
    const currentPriority = params.get("priority") || "all";
    const currentDate = params.get("date") || "";
    const currentAssignee = params.get("assignee") || "all";

    if (
      debouncedQuery !== currentQ ||
      status !== currentStatus ||
      priority !== currentPriority ||
      date !== currentDate ||
      assignee !== currentAssignee
    ) {
      if (debouncedQuery) params.set("q", debouncedQuery);
      else params.delete("q");

      if (status && status !== "all") params.set("status", status);
      else params.delete("status");

      if (priority && priority !== "all") params.set("priority", priority);
      else params.delete("priority");

      if (date) params.set("date", date);
      else params.delete("date");

      if (assignee && assignee !== "all") params.set("assignee", assignee);
      else params.delete("assignee");

      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [debouncedQuery, status, priority, date, assignee, router]);

  const assigneeOptions = [
    { label: "Any Assignee", value: "all" },
    { label: "Unassigned (Draft)", value: "unassigned" },
    ...employees.map((emp) => ({ label: emp.name, value: emp.id })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* 1. SEARCH INPUT */}
      <div className="relative flex-1 min-w-[200px] group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
        />
      </div>

      {/* 2. ASSIGNEE FILTER */}
      <FilterSelect
        value={assignee}
        onChange={setAssignee}
        icon={User}
        options={assigneeOptions}
      />

      {/* 3. STATUS FILTER */}
      <FilterSelect
        value={status}
        onChange={setStatus}
        icon={Filter}
        options={[
          { label: "Any Status", value: "all" },
          { label: "Draft (Unassigned)", value: "draft" },
          { label: "Assigned", value: "assigned" },
          { label: "In Progress", value: "in_progress" },
          { label: "Submitted", value: "submitted" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
        ]}
      />

      {/* 4. PRIORITY FILTER */}
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

      {/* 5. DATE FILTER */}
      <div className="relative group">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:border-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer h-[42px]"
        />
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
        className="pl-3 pr-8 py-2.5 h-[42px] rounded-xl border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:border-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none min-w-[130px] transition-all cursor-pointer"
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

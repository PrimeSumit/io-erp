"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  ShieldAlert,
  User,
  Clock,
  Calendar,
  X,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";

export function AuditClientTable({ logs }: { logs: any[] }) {
  
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  
  const actionOptions = useMemo(() => {
    const actions = Array.from(new Set(logs.map((log) => log.action))).filter(
      Boolean,
    );
    return [
      { label: "All Actions", value: "all" },
      ...actions.map((a) => ({
        label: (a as string).replace(/_/g, " ").toUpperCase(),
        value: a,
      })),
    ];
  }, [logs]);

  
  const userOptions = useMemo(() => {
    const usersMap = new Map();
    logs.forEach((log) => {
      if (log.performed_by && log.users?.name) {
        usersMap.set(log.performed_by, log.users.name);
      }
    });

    const options = Array.from(usersMap.entries()).map(([id, name]) => ({
      label: name,
      value: id,
    }));

    return [{ label: "All Users", value: "all" }, ...options];
  }, [logs]);

  
  const filteredLogs = logs.filter((log) => {
    
    if (search) {
      const query = search.toLowerCase();
      const userName = (log.users?.name || "").toLowerCase();
      const actionName = (log.action || "").toLowerCase();
      const details =
        typeof log.new_state === "string"
          ? log.new_state.toLowerCase()
          : JSON.stringify(log.new_state || {}).toLowerCase();

      if (
        !userName.includes(query) &&
        !actionName.includes(query) &&
        !details.includes(query)
      ) {
        return false;
      }
    }

    
    if (actionFilter !== "all" && log.action !== actionFilter) return false;

    
    if (userFilter !== "all" && log.performed_by !== userFilter) return false;

    
    if (startDate || endDate) {
      const logDate = format(new Date(log.created_at), "yyyy-MM-dd");
      if (startDate && logDate < startDate) return false;
      if (endDate && logDate > endDate) return false;
    }

    return true;
  });

  const hasActiveFilters =
    search ||
    actionFilter !== "all" ||
    userFilter !== "all" ||
    startDate ||
    endDate;

  return (
    <div className="space-y-4">
      
      <div className="flex flex-wrap items-center gap-3 w-full bg-gray-50/50 p-3 rounded-xl border border-gray-200">
       
        <div className="relative w-85 shrink-0 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        
        <FilterSelect
          value={userFilter}
          onChange={setUserFilter}
          icon={User}
          options={userOptions}
        />

       
        <FilterSelect
          value={actionFilter}
          onChange={setActionFilter}
          icon={Filter}
          options={actionOptions}
        />

        
        <div className="flex items-center gap-2 shrink-0 bg-white border border-gray-200 rounded-lg px-3 py-1.5 h-[34px] shadow-sm overflow-x-auto max-w-full">
          <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              From
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-bold text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer outline-none p-0"
            />
          </div>

          <ArrowRight className="h-3 w-3 text-gray-300 shrink-0 mx-1" />

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              To
            </span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-bold text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer outline-none p-0"
            />
          </div>
        </div>

        
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearch("");
              setActionFilter("all");
              setUserFilter("all");
              setStartDate("");
              setEndDate("");
            }}
            className="ml-auto text-xs font-bold text-gray-400 hover:text-red-600 transition-colors px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

     
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto pb-16">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase text-xs w-[25%]">
                  Performed By
                </th>
                <th className="px-10 py-4 font-bold text-gray-500 uppercase text-xs w-[15%]">
                  Action
                </th>
                <th className="px-30 py-4 font-bold text-gray-500 uppercase text-xs w-[45%]">
                  Details
                </th>
                <th className="px-16 py-4 font-bold text-gray-500 uppercase text-xs text-right w-[15%]">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-gray-400 font-medium"
                  >
                    No activity found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {log.users?.name || "Unknown User"}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide truncate">
                            {log.users?.role || "System"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
                        <ShieldAlert className="h-3 w-3" />
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <AuditDetails state={log.new_state} />
                    </td>

                    <td className="px-6 py-4 text-right text-gray-400 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 text-xs font-medium text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        {mounted
                          ? format(new Date(log.created_at), "MMM d, h:mm a")
                          : "..."}
                      </div>
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



function FilterSelect({ value, onChange, icon: Icon, options }: any) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-3 pr-8 py-2 h-[34px] rounded-lg border border-gray-200 text-xs font-bold text-gray-600 bg-white hover:border-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none min-w-[140px] transition-all cursor-pointer"
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

function AuditDetails({ state }: { state: any }) {
  if (!state)
    return <span className="text-gray-400 italic text-xs">No details</span>;

  let parsedState: any = {};
  if (typeof state === "object") {
    parsedState = state;
  } else {
    try {
      parsedState = JSON.parse(state);
    } catch (error) {
      return (
        <span
          className="text-xs text-gray-500 truncate max-w-xs block"
          title={state}
        >
          {state}
        </span>
      );
    }
  }

  const title = parsedState.title || parsedState.name;
  const status = parsedState.status;
  const priority = parsedState.priority;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {title && (
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm max-w-[200px]">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Record:
          </span>
          <span
            className="text-xs font-bold text-gray-700 truncate"
            title={title}
          >
            {title}
          </span>
        </div>
      )}

      {status && (
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Status:
          </span>
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-wide">
            {status.replace("_", " ")}
          </span>
        </div>
      )}

      {priority && (
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Priority:
          </span>
          <span className="text-[10px] font-black text-gray-700 uppercase tracking-wide">
            {priority}
          </span>
        </div>
      )}

      {!title && !status && !priority && (
        <span
          className="text-xs text-gray-500 font-mono truncate max-w-xs block"
          title={JSON.stringify(parsedState)}
        >
          {JSON.stringify(parsedState).substring(0, 50)}...
        </span>
      )}
    </div>
  );
}

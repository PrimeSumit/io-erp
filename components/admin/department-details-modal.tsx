"use client";

import { X, Users, Save, Loader2, Building2, User, Mail } from "lucide-react";
import { useState } from "react";
import { updateDepartment } from "@/app/(admin)/actions";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dept: any;
  allManagers: any[];
  mode: "view" | "edit";
}

export function DepartmentDetailsModal({
  isOpen,
  onClose,
  dept,
  allManagers,
  mode,
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  async function handleSave(formData: FormData) {
    setLoading(true);
    await updateDepartment(formData);
    router.refresh();
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === "edit" ? "Edit Department" : dept.name}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {mode === "edit"
                  ? "Department Management"
                  : "Department Overview"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === "view" && (
          <div className="p-6 overflow-y-auto">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Manager
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {dept.manager?.name || "Unassigned"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Total Staff
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {dept.employee_count} Employees
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" /> Employee Directory
              </h3>

              {dept.employees && dept.employees.length > 0 ? (
                <div className="space-y-3">
                  {dept.employees.map((emp: any) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {emp.name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />{" "}
                            {emp.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                  <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">
                    No employees assigned to this department yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "edit" && (
          <form action={handleSave} className="p-6 space-y-8 overflow-y-auto">
            <input type="hidden" name="id" value={dept.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Department Name
                  </label>
                  <input
                    name="name"
                    defaultValue={dept.name}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Assign Head / Manager
                  </label>
                  <select
                    name="manager_id"
                    defaultValue={dept.manager_id || "none"}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary outline-none bg-white transition-all"
                  >
                    <option value="none">No Manager Assigned</option>
                    {allManagers.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {dept.employee_count || 0} Employees
                    </p>
                    <p className="text-xs text-gray-500">Currently assigned</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  * Managers assigned here will receive specific dashboard views
                  to manage tasks for this department.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

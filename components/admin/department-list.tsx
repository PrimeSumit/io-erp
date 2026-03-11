"use client";

import {
  Building2,
  Users,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useState } from "react";
import { DepartmentDetailsModal } from "./department-details-modal";
import { deleteDepartment } from "@/app/(admin)/actions";
import { useRouter } from "next/navigation";

// --- TYPES ---
interface Department {
  id: string;
  name: string;
  manager: { name: string }[] | { name: string } | null;
  employee_count?: number;
  manager_id?: string;
  employees?: any[]; // 👈 Added employees to the interface
}

interface Manager {
  id: string;
  name: string;
  role: string;
}

interface ActionResponse {
  success?: boolean;
  error?: string;
}

export function DepartmentList({
  departments,
  allManagers,
}: {
  departments: Department[];
  allManagers: Manager[];
}) {
  const router = useRouter();

  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  // 👇 Added state to track whether we are viewing or editing
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const result = (await deleteDepartment(deleteTarget.id)) as ActionResponse;
    setIsDeleting(false);

    if (result?.error) {
      setDeleteTarget(null);
      setErrorMsg(result.error);
    } else {
      setDeleteTarget(null);
      router.refresh();
    }
  };

  return (
    <>
      {/* EDIT */}
      {selectedDept && (
        <DepartmentDetailsModal
          isOpen={!!selectedDept}
          onClose={() => setSelectedDept(null)}
          dept={selectedDept}
          allManagers={allManagers}
          mode={modalMode}
        />
      )}

      {/* DELETE */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Department?
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
              Are you sure you want to remove{" "}
              <span className="font-bold text-gray-900">
                "{deleteTarget.name}"
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ERROR */}
      {errorMsg && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setErrorMsg(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Cannot Delete
              </h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {errorMsg}
              </p>
              <button
                onClick={() => setErrorMsg(null)}
                className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
              >
                Okay, understood
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[35%]">
                  Department
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[25%]">
                  Manager
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[20%] text-center">
                  Staff Count
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[20%] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center bg-gray-50">
                    <Building2 className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                    <h3 className="text-sm font-bold text-gray-900">
                      No Departments
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Create your first department to start organizing your
                      team.
                    </p>
                  </td>
                </tr>
              ) : (
                departments.map((dept) => {
                  const managerName = Array.isArray(dept.manager)
                    ? dept.manager[0]?.name
                    : dept.manager?.name;

                  return (
                    <tr
                      key={dept.id}
                      onClick={() => {
                        setSelectedDept(dept);
                        setModalMode("view");
                      }}
                      className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                            {dept.name}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {managerName ? (
                          <span className="text-sm font-semibold text-gray-700 truncate">
                            {managerName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500">
                          <Users className="h-4 w-4 text-gray-400" />
                          {dept.employee_count || 0}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDept(dept);
                              setModalMode("edit");
                            }}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Department"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({
                                id: dept.id,
                                name: dept.name,
                              });
                            }}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Department"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

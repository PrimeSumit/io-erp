"use client";

import { useState } from "react";
import {
  Loader2,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { updateUserDetails } from "@/app/(admin)/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserList({
  users,
  departments,
  page,
  totalPages,
  hasPrevPage,
  hasNextPage,
}: any) {
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    setErrorMsg(null);
    const result = await updateUserDetails(formData);
    setLoading(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      setEditingUser(null);
      router.refresh();
    }
  }

  return (
    <>
      {/* --- EDIT MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form action={handleUpdate} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editingUser.id} />

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingUser.name}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Role
                  </label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary capitalize"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={
                      editingUser.deleted_at ? "inactive" : "active"
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Department
                </label>
                <select
                  name="department_id"
                  defaultValue={editingUser.departments?.id || "null"}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="null">No Department (Global)</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Note: Admins cannot be assigned to a specific department.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {errorMsg}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Save
                  Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TABLE LAYOUT --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[40%]">
                  Employee
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[20%]">
                  Role
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[25%]">
                  Department
                </th>
                <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[15%] text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users?.map((user: any) => {
                const isActive = !user.deleted_at;
                return (
                  <tr
                    key={user.id}
                    onClick={() => setEditingUser(user)} 
                    className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6 truncate">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs border border-purple-100 shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-600 border-purple-100"
                            : user.role === "manager"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-gray-50 text-gray-600 border-gray-100"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-gray-500 truncate">
                      {user.departments?.name || "—"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                          isActive
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-red-50 text-red-600 border-red-100"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between mt-auto">
          <span className="text-xs font-medium text-gray-500">
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Link
              href={`?page=${page - 1}`}
              className={`p-2 rounded-lg border transition-all ${hasPrevPage ? "bg-white hover:bg-gray-50 text-gray-600 shadow-sm" : "bg-gray-50 text-gray-300 pointer-events-none"}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href={`?page=${page + 1}`}
              className={`p-2 rounded-lg border transition-all ${hasNextPage ? "bg-white hover:bg-gray-50 text-gray-600 shadow-sm" : "bg-gray-50 text-gray-300 pointer-events-none"}`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

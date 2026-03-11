"use client";

import { addUserDirectly } from "@/app/(admin)/actions";
import { useState, useRef } from "react";
import {
  Loader2,
  Mail,
  User,
  Briefcase,
  Building2,
  Send,
  Lock,
} from "lucide-react";

export function InviteUserForm({
  departments,
}: {
  departments: { id: string; name: string }[];
}) {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("employee");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);

    
    if (selectedRole === "admin") {
      formData.set("departmentId", "");
    }

    const result = await addUserDirectly(formData);

    if (result?.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({
        text: "User added successfully! They can log in now.",
        type: "success",
      });
      formRef.current?.reset();
      setSelectedRole("employee"); 
    }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-lg font-bold text-gray-900">Add New User</h3>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700 uppercase">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. John Doe"
              className="block w-full rounded-lg border border-gray-200 pl-10 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700 uppercase">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              name="email"
              type="email"
              required
              placeholder="name@company.com"
              className="block w-full rounded-lg border border-gray-200 pl-10 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700 uppercase">
            Set Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="block w-full rounded-lg border border-gray-200 pl-10 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700 uppercase">
            Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Briefcase className="h-4 w-4 text-gray-400" />
            </div>
            <select
              name="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)} 
              className="block w-full rounded-lg border border-gray-200 pl-10 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        
        {selectedRole !== "admin" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="mb-1 block text-xs font-bold text-gray-700 uppercase">
              Department
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <select
                name="departmentId"
                required={selectedRole !== "admin"} 
                className="block w-full rounded-lg border border-gray-200 pl-10 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
              >
                <option value="">Select Department...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`rounded-lg p-3 text-xs font-medium ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-hover disabled:opacity-70 mt-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" /> Add User
            </>
          )}
        </button>
      </form>
    </div>
  );
}

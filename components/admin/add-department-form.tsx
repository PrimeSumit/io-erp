"use client";

import { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createDepartment } from "@/app/(admin)/actions";
import { useRouter } from "next/navigation";

export function AddDepartmentForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await createDepartment(formData);

    router.refresh();

    formRef.current?.reset();

    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4">New Department</h2>
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Department Name
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Quality Assurance"
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-primary outline-none"
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Create Department
        </button>
      </form>
    </div>
  );
}

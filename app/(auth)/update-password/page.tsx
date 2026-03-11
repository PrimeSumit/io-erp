"use client";

import { useState } from "react";
import { updatePassword } from "../actions";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const result = await updatePassword(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Redirect to dashboard after success
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-sm rounded-lg bg-white p-10 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-100">
        <div className="mb-8 relative h-14 w-full max-w-[180px] mx-auto">
          <Image
            src="/app-logo.png"
            alt="IO-ERP Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h2 className="mb-6 text-center text-xl font-bold text-gray-900">
          Set New Password
        </h2>

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              New Password
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="input-primary mt-1"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="input-primary mt-1"
              placeholder="Confirm new password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded text-center border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-hover disabled:opacity-70 transition-colors uppercase tracking-wide"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { forgotPassword } from "../actions";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const result = await forgotPassword(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setMessage("Check your email for the password reset link.");
    }
    setLoading(false);
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

        <h2 className="mb-2 text-center text-xl font-bold text-gray-900">
          Reset Password
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Enter your email and we'll send you instructions to reset your
          password.
        </p>

        {!message ? (
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="input-primary mt-1"
                placeholder="name@company.com"
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
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="rounded-md bg-green-50 p-4 text-center text-sm text-green-700 border border-green-200">
            {message}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-[#008784] hover:text-[#005e5c]"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

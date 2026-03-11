"use client";

import { login, submitContactForm } from "../actions";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Send, Loader2 } from "lucide-react";

function ContactModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSend(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await submitContactForm(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Contact Support</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in">
            <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600">
              <Send className="h-8 w-8" />
            </div>
            <p className="text-lg font-bold text-gray-900">Message Sent!</p>
            <p className="text-sm text-gray-500">
              Admin will contact you shortly.
            </p>
          </div>
        ) : (
          <form action={handleSend} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Your Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                className="input-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Subject
              </label>

              <select name="subject" className="input-primary">
                <option value="Login Issue">I cannot log in</option>
                <option value="Account Request">I need an account</option>
                <option value="Bug Report">I found a bug</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Message
              </label>

              <textarea
                name="message"
                required
                rows={4}
                placeholder="Describe your issue..."
                className="input-primary min-h-[100px] py-3 resize-none"
              ></textarea>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded text-center border border-red-100 animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-hover disabled:opacity-70 transition-all uppercase tracking-wide"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Sending..." : "SEND MESSAGE"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(urlError);
    }
  }, [searchParams]);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <>
      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />

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

        <div className="mb-8 rounded bg-[#E5F6F8] p-4 text-center text-sm text-[#017E84] border border-[#d3eeef]">
          Access your Internal Operations ERP
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="input-primary"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="input-primary"
              placeholder="Enter your password"
            />
            {/* 👇 Moved to the bottom of the input, aligned to the right, and changed back to "Reset Password" */}
            <div className="flex justify-end pt-1">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#008784] hover:text-[#005e5c]"
              >
                Reset Password
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded text-center border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full justify-center rounded px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-all disabled:opacity-70 bg-primary hover:bg-primary-hover uppercase tracking-wide"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-400">
                Don't have an account?
              </span>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowContact(true)}
              className="cursor-pointer text-sm font-medium text-[#008784] hover:underline bg-transparent border-none"
            >
              Contact Admin
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>

      <div className="mt-10 text-center text-xs text-gray-400">
        Powered by IO-ERP © 2026
      </div>
    </div>
  );
}

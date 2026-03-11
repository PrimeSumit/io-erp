"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const handleAuth = async () => {
      // 1. Supabase automatically handles the hash/code in the background
      // when the client is initialized, but we'll verify the session here.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Auth Error:", sessionError.message);
        setError("Your invitation link may have expired.");
        return;
      }

      if (session) {
        // 2. Clear the hash from the URL bar for security/cleanliness
        window.history.replaceState(null, "", window.location.pathname);

        // 3. Get the redirect path (default to dashboard)
        const next = searchParams.get("next") || "/dashboard";

        // 4. Smooth transition
        setTimeout(() => {
          router.replace(next);
          router.refresh();
        }, 1000);
      } else {
        // If no session found after a few seconds, redirect to login
        setError("No active session found. Please try logging in manually.");
      }
    };

    handleAuth();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
          <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <ShieldCheck className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">
            Verifying Identity
          </h2>
          <p className="text-sm text-gray-500 animate-pulse">
            Securing your session...
          </p>
        </div>
      </div>
    </div>
  );
}

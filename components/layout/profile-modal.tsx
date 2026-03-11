"use client";

import { X, Mail, Building2, Shield, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    role: string;
    department?: string;
  };
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  if (!isOpen) return null;

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  async function handleSignOut() {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors backdrop-blur-sm"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/10 to-transparent" />

        <div className="relative px-6 pt-12 pb-8 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg ring-1 ring-gray-100">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-4xl font-bold text-white">
                {initial}
              </div>
            </div>

            <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white bg-green-500"></div>
          </div>

          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <div className="mt-1 flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-0.5 border border-gray-200">
            <Shield className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {user.role}
            </span>
          </div>

          <div className="my-6 w-full border-t border-gray-100" />

          <div className="w-full space-y-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">
                  Email Address
                </p>
                <p className="text-sm font-semibold text-gray-900 break-all">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase">
                  Department
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.department || "No Department Assigned"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none group"
          >
            {isSigningOut ? (
              <span className="animate-pulse">Signing out...</span>
            ) : (
              <>
                <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Sign Out
              </>
            )}
          </button>
        </div>

        <div className="h-2 w-full bg-primary" />
      </div>
    </div>
  );
}

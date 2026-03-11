"use client";

import { Bell, LifeBuoy, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import {
  NotificationDropdown,
  NotificationItem,
} from "./notification-dropdown";
import { ProfileModal } from "./profile-modal";

interface TopbarProps {
  userName: string;
  role: string;
  userId: string;
  email: string;
  department: string;
}

export function Topbar({
  userName,
  role,
  userId,
  department,
  email,
}: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

 
  const getPageTitle = () => {
    // Manager Routes
    if (pathname.includes("/manager/tasks")) return "Task Management";
    if (pathname.includes("/manager/team")) return "Team Overview";
    if (pathname.includes("/manager/dashboard")) return "Dashboard";

    // Admin Routes
    if (pathname.includes("/admin/users")) return "User Management";
    if (pathname.includes("/admin/departments")) return "Departments";
    if (pathname.includes("/admin/tasks")) return "Global Tasks";
    if (pathname.includes("/admin/support")) return "Support Tickets";
    if (pathname.includes("/admin/audit")) return "Audit Logs";

    // Employee Routes
    if (pathname.includes("/employee/dashboard")) return "Workspace";
    if (pathname.includes("/employee/work")) return "Work Queue";

    return "Dashboard"; // Default fallback
  };

  // 1. REAL-TIME LISTENER
  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = transformData(payload.new);
          setNotifications((prev) => [newNotif, ...prev]);
          router.refresh();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // 2. AUTO-REFRESH
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
      fetchNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Logic
  async function fetchNotifications() {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 3);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false) 
      .gt("created_at", dateLimit.toISOString())
      .order("created_at", { ascending: false });
    if (data) setNotifications(data.map(transformData));
  }

  function transformData(dbRow: any): NotificationItem {
    const isSupport = dbRow.title.toLowerCase().includes("support");
    return {
      id: dbRow.id,
      title: dbRow.title,
      message: dbRow.message,
      time: new Date(dbRow.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      link: dbRow.link,
      read: dbRow.is_read,
      icon: isSupport ? LifeBuoy : Info,
      colorClass: isSupport
        ? "bg-purple-100 text-purple-600"
        : "bg-blue-100 text-blue-600",
    };
  }

  // Handle single read
  async function handleMarkRead(id: string, link?: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    router.refresh();
    setShowNotifications(false);
    if (link) router.push(link);
  }

  
  async function handleMarkAllRead() {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false); 

    
    setNotifications([]);
    router.refresh();
    setShowNotifications(false);
  }

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30 font-sans shadow-sm">
        
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {getPageTitle()}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
            {department} • {role.replace("_", " ")}
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors outline-none"
            >
              <Bell className="h-6 w-6 text-gray-400" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
            {showNotifications && (
              <>
                <NotificationDropdown
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  onMarkRead={handleMarkRead}
                  onMarkAllRead={handleMarkAllRead} 
                />
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowNotifications(false)}
                />
              </>
            )}
          </div>

          <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

          {/* Profile Trigger */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded-xl transition-all text-left"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-900 leading-none">
                {userName}
              </p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
                View Profile
              </p>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold border border-primary/20">
              {userName.charAt(0).toUpperCase()}
            </div>
          </button>
        </div>
      </header>

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={{ name: userName, email, role, department }}
      />
    </>
  );
}

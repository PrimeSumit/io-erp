"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  Ticket,
  FileClock,
  LogOut,
  Briefcase,
  FileCheck,
  Layers,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const adminMenu = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { title: "User Management", icon: Users, href: "/admin/users" },
  { title: "Departments", icon: Building2, href: "/admin/departments" },
  { title: "Global Tasks", icon: Layers, href: "/admin/tasks" },
  { title: "Support Tickets", icon: Ticket, href: "/admin/support" },
  { title: "Audit Logs", icon: FileClock, href: "/admin/audit" },
];

const managerMenu = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/manager/dashboard" },
  { title: "Task Management", icon: ClipboardList, href: "/manager/tasks" },
  { title: "My Team", icon: Briefcase, href: "/manager/team" },
];

const employeeMenu = [
  { title: "Workspace", icon: LayoutDashboard, href: "/employee/dashboard" },
  { title: "Work Queue", icon: FileCheck, href: "/employee/work" },
];

const getMenuByRole = (role: string) => {
  switch (role) {
    case "admin":
      return adminMenu;
    case "manager":
    case "team_lead":
      return managerMenu;
    case "employee":
      return employeeMenu;
    default:
      return [];
  }
};

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const menuItems = getMenuByRole(userRole);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="flex h-16 items-center justify-center border-b border-gray-100 px-6">
        <div className="relative h-16 w-32">
          <Image
            src="/app-logo.png"
            alt="IO ERP"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={`group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

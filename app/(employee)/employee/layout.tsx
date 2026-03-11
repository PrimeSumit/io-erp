import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getProfile } from "@/lib/supabase/get-profile";
import { redirect } from "next/navigation";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  if (!profile || profile.role !== "employee") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar userRole="employee" />
      <div className="ml-64 min-h-screen flex flex-col">
        <Topbar
          userName={profile.name}
          role={profile.role}
          userId={profile.id}
          email={profile.email}
          department={profile.departments?.name || "General"}
        />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

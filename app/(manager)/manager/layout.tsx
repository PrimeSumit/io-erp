import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getProfile } from "@/lib/supabase/get-profile";
import { redirect } from "next/navigation";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  const role = profile?.role?.toLowerCase();
  if (!profile || (role !== "manager" && role !== "team_lead")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar userRole={role} />

      <div className="ml-64 min-h-screen flex flex-col">
        <Topbar
          userName={profile.name}
          role={profile.role}
          userId={profile.id}
          email={profile.email}
          department={profile.departments?.name || "General"}
        />

        <main className="flex-1 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}

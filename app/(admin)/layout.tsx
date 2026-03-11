import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getProfile } from "@/lib/supabase/get-profile";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  if (!profile || profile.role?.toLowerCase() !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar userRole="admin" />

      <div className="ml-64 min-h-screen flex flex-col">
        <Topbar
          userName={profile.name}
          role="Admin"
          userId={profile.id}
          email={profile.email}
          department={profile.departments?.name || "Administration"}
        />

        <main className="flex-1 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}

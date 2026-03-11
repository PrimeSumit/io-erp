import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { redirect } from "next/navigation";
import { DepartmentList } from "@/components/admin/department-list";
import { AddDepartmentForm } from "@/components/admin/add-department-form";

export default async function DepartmentsPage() {
  const supabase = await createClient();
  const profile = await getProfile();

  if (profile?.role !== "admin") redirect("/");

  const [deptRes, managerRes, usersRes] = await Promise.all([
    supabase
      .from("departments")
      .select(
        `
        id, 
        name, 
        manager_id, 
        manager:manager_id ( name )
      `,
      )
      .eq("organization_id", profile.organization_id)
      .order("name"),

    supabase.from("users").select("id, name, role").neq("role", "employee"),

    // 👇 FIXED: Now we fetch the actual employee details, not just the ID!
    supabase
      .from("users")
      .select("id, name, email, department_id")
      .eq("role", "employee"),
  ]);

  // Map employees to their specific departments
  const formattedDepartments =
    deptRes.data?.map((dept: any) => {
      const deptEmployees =
        usersRes.data?.filter((u) => u.department_id === dept.id) || [];

      return {
        ...dept,
        employee_count: deptEmployees.length,
        employees: deptEmployees, // 👈 Passing the full list to the client!
      };
    }) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3">
          <DepartmentList
            departments={formattedDepartments}
            allManagers={managerRes.data || []}
          />
        </div>

        <div className="xl:col-span-1">
          <div className="sticky top-24">
            <AddDepartmentForm />
          </div>
        </div>
      </div>
    </div>
  );
}

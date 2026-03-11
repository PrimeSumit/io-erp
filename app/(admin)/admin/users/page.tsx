import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { UserList } from "@/components/admin/user-table"; // 👈 Import our new component
import { redirect } from "next/navigation";

type SearchParams = Promise<{ page?: string }>;

export default async function UserManagementPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const profile = await getProfile();

  if (profile?.role !== "admin") redirect("/");

  // 1. Pagination Setup
  const page = Number(searchParams?.page) || 1;
  const itemsPerPage = 10;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // 2. Fetch Users
  const {
    data: users,
    count,
    error,
  } = await supabase
    .from("users")
    .select(
      `id, name, email, role, created_at, deleted_at, departments!department_id ( id, name )`, // Make sure 'id' is selected here for the edit form!
      { count: "exact" },
    )
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalUsers = count || 0;
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // 3. Fetch Departments
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .order("name");

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
      <div className="xl:col-span-2">
        {/* Pass all the data into our new interactive table */}
        <UserList
          users={users || []}
          departments={departments || []}
          page={page}
          totalPages={totalPages}
          hasPrevPage={hasPrevPage}
          hasNextPage={hasNextPage}
        />
      </div>

      <div className="xl:col-span-1 sticky top-24">
        <InviteUserForm departments={departments || []} />
      </div>
    </div>
  );
}

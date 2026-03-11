export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { CheckCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function TeamPage() {
  const supabase = await createClient();
  const profile = await getProfile();

  const { data: team, error } = await supabase
    .from("users")
    .select(
      `
      id, 
      name, 
      email, 
      role,
      department_id,
      tasks!assigned_to (status)
    `,
    )
    .eq("department_id", profile.department_id)
    .eq("role", "employee");

  if (error) {
    console.error("Supabase Error:", error.message);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-[40%]">
                  Employee
                </th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-[20%]">
                  Role
                </th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-[20%]">
                  Active Tasks
                </th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-[20%]">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!team || team.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-gray-400 font-medium"
                  >
                    No employees found in your department.
                  </td>
                </tr>
              ) : (
                team.map((member) => {
                  const tasks = member.tasks || [];
                  const totalTasks = tasks.length;
                  const completedTasks = tasks.filter(
                    (t: any) => t.status === "approved",
                  ).length;
                  const activeTasks = totalTasks - completedTasks;

                  return (
                    <tr
                      key={member.id}
                      className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <td className="p-0">
                        <Link
                          href={`/manager/team/${member.id}`}
                          className="flex items-center gap-3 py-4 px-6"
                        >
                          <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs border border-purple-100 shrink-0">
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {member.name}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">
                              {member.email}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link
                          href={`/manager/team/${member.id}`}
                          className="flex items-center py-4 px-6"
                        >
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border bg-gray-50 text-gray-600 border-gray-100">
                            {member.role.replace("_", " ")}
                          </span>
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link
                          href={`/manager/team/${member.id}`}
                          className="flex items-center py-4 px-6"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <Clock className="h-3.5 w-3.5 text-blue-500" />
                            {activeTasks} Pending
                          </div>
                        </Link>
                      </td>
                      <td className="p-0">
                        <Link
                          href={`/manager/team/${member.id}`}
                          className="flex items-center py-4 px-6"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            {completedTasks} Done
                          </div>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

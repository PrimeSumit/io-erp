export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Briefcase, FileText, Calendar } from "lucide-react";
import Link from "next/link";

type Params = Promise<{ id: string }>;

export default async function MemberAnalysisPage(props: { params: Params }) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: member, error } = await supabase
    .from("users")
    .select(
      `
      *,
      tasks!assigned_to (*)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Supabase Error:", error.message);
  }

  if (!member) notFound();

  const tasks = member.tasks || [];
  const total = tasks.length;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Link
        href="/manager/team"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Team
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 sticky top-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-8 text-center border-b border-gray-50">
              <div className="h-24 w-24 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900 font-black text-3xl mx-auto mb-4 border border-gray-100">
                {member.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                {member.name}
              </h2>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-1">
                {member.role?.replace("_", " ")}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-[13px] font-medium truncate">
                  {member.email}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-[13px] font-medium">
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-gray-50/50 p-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Performance Overview</span>
                <span className="text-gray-900">{total} Tasks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900">
                  Task History
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Task Details
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                      Priority
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                      Status
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-sm text-gray-400 italic"
                      >
                        No tasks assigned yet.
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task: any) => (
                      <tr
                        key={task.id}
                        className="group hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="text-[13px] font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {task.title}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center">
                            <PriorityBadge priority={task.priority} />
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center">
                            <StatusBadge status={task.status} />
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span className="text-[11px] font-medium">
                              {new Date(task.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: any = {
    high: "text-red-600 bg-red-50 border-red-100",
    medium: "text-orange-600 bg-orange-50 border-orange-100",
    low: "text-gray-500 bg-gray-50 border-gray-100",
  };
  return (
    <span
      className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${styles[priority] || styles.low}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    submitted: "bg-purple-50 text-purple-700 border-purple-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    assigned: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span
      className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-tight ${styles[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

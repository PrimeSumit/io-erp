import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/supabase/get-profile";
import { TaskActionPanel } from "@/components/employee/task-action-panel";
import { ArrowLeft, Paperclip, Download, AlertCircle } from "lucide-react";
import Link from "next/link";

type Params = Promise<{ id: string }>;

export default async function TaskDetailsPage(props: { params: Params }) {
  const params = await props.params;
  const supabase = await createClient();
  const profile = await getProfile();

  const { data: task } = await supabase
    .from("tasks")
    .select(`*, manager:users!created_by (name), attachments(*)`)
    .eq("id", params.id)
    .maybeSingle();

  if (!task) {
    redirect("/employee/work");
  }

  if (task.assigned_to !== profile.id) {
    return (
      <div className="p-6 text-red-500 text-[13px] font-medium">
        Unauthorized access.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Link
        href="/employee/work"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Work Queue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {task.title}
                </h1>
                <div className="flex items-center mt-1">
                  <StatusBadge status={task.status} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[13px] text-gray-500 mt-3">
                <span>
                  Manager:{" "}
                  <span className="font-medium text-gray-900">
                    {task.manager?.name || "Manager"}
                  </span>
                </span>
                <span className="text-gray-300">•</span>
                <span>
                  Due:{" "}
                  <span className="font-medium text-gray-900">
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                </span>
                <span className="text-gray-300">•</span>
                <span>
                  Priority:{" "}
                  <span className="font-medium text-gray-900 capitalize">
                    {task.priority}
                  </span>
                </span>
              </div>
            </div>

            {task.status === "rejected" && task.manager_feedback && (
              <div className="p-5 bg-red-50/50 border-b border-red-100">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <h3 className="text-[13px] font-bold text-red-900 mb-1">
                      Manager requested revisions:
                    </h3>
                    <p className="text-[13px] text-red-800 leading-relaxed">
                      {task.manager_feedback}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 border-b border-gray-100">
              <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Instructions
              </h3>
              <div className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                {task.description || "No specific instructions provided."}
              </div>
            </div>

            {task.attachments && task.attachments.length > 0 && (
              <div className="p-6">
                <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Attached Files
                </h3>
                <div className="flex flex-col gap-1.5 max-w-lg">
                  {task.attachments.map((file: any) => (
                    <a
                      key={file.id}
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/task-attachments/${file.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors group"
                    >
                      <Paperclip className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-[13px] font-medium text-gray-700 truncate flex-1">
                        {file.file_path.split("/").pop()}
                      </span>
                      <Download className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-gray-900 transition-all shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            <TaskActionPanel
              taskId={task.id}
              status={task.status}
              managerId={task.created_by}
              taskTitle={task.title}
              employeeName={profile.name}
            />

            <div className="border border-gray-200 rounded-lg p-5 bg-transparent">
              <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-5">
                Activity Timeline
              </h3>
              <div className="ml-2 border-l border-gray-100 pl-5 space-y-6 relative">
                <TimelineNode
                  label="Task Assigned"
                  date={task.created_at}
                  active={true}
                />
                <TimelineNode
                  label="In Progress"
                  date={task.updated_at}
                  active={["in_progress", "submitted", "approved"].includes(
                    task.status,
                  )}
                />
                <TimelineNode
                  label="Submitted for Review"
                  date={task.updated_at}
                  active={["submitted", "approved"].includes(task.status)}
                />
                <TimelineNode
                  label="Approved"
                  date={task.updated_at}
                  active={task.status === "approved"}
                  isLast={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    draft: "bg-gray-50 text-gray-600 border-gray-200",
    assigned: "bg-blue-50 text-blue-700 border-blue-200",
    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
    submitted: "bg-purple-50 text-purple-700 border-purple-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest border ${styles[status] || styles.draft}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function TimelineNode({ label, date, active, isLast = false }: any) {
  return (
    <div className="relative">
      <div
        className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${active ? "bg-gray-900" : "bg-gray-200"}`}
      />
      {isLast && (
        <div className="absolute -left-[21px] top-4 bottom-[-30px] w-1 bg-white z-10" />
      )}
      <div className={`flex flex-col ${active ? "opacity-100" : "opacity-40"}`}>
        <span className="text-[13px] font-medium text-gray-900">{label}</span>
        {active && date && (
          <span className="text-[11px] text-gray-400 mt-0.5">
            {new Date(date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

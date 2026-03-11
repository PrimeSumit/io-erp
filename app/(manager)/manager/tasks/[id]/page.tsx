export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { redirect } from "next/navigation";
import { ReviewForm } from "@/components/manager/review-form";
import { TaskManagementPanel } from "@/components/manager/task-management-panel";
import { EditTaskModal } from "@/components/manager/edit-task-modal";
import { ArrowLeft, Paperclip, Download, User, X } from "lucide-react";
import { deleteAttachment } from "@/app/(manager)/actions";
import Link from "next/link";

type Params = Promise<{ id: string }>;

export default async function TaskReviewPage(props: { params: Params }) {
  const { id } = await props.params;
  const supabase = await createClient();
  const profile = await getProfile();

  // Fetch from task_assignees instead of single assigned_to
  const { data: task, error } = await supabase
    .from("tasks")
    .select(
      `
      *, 
      assignees:task_assignees (
        user:users ( id, name, email )
      ),
      attachments(*)
    `,
    )
    .eq("id", id)
    .single();

  if (error || !task) {
    redirect("/manager/tasks");
  }

  const { data: employees } = await supabase
    .from("users")
    .select("id, name")
    .eq("department_id", profile.department_id)
    .eq("role", "employee");

  const isSubmitted = task.status === "submitted";

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Link
        href="/manager/tasks"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Tasks
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {task.title}
                  </h1>
                  <div className="flex items-center mt-1">
                    <StatusBadge status={task.status} />
                  </div>
                </div>

                {/* The Edit button */}
                <EditTaskModal task={task} employees={employees || []} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-500 mt-4">
                <div className="flex items-center gap-2">
                  <span>Assignees:</span>
                  <div className="flex items-center -space-x-1.5 ml-1 relative">
                    {task.assignees && task.assignees.length > 0 ? (
                      <>
                        {/* FIRST 3 AVATARS */}
                        {task.assignees
                          .slice(0, 3)
                          .map((a: any, idx: number) => (
                            <div
                              key={a.user.id}
                              className="relative group/avatar h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold border-2 border-white text-purple-700 shadow-sm cursor-pointer"
                              style={{ zIndex: 10 - idx }}
                            >
                              {a.user.name.charAt(0).toUpperCase()}

                              {/* Single User Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/avatar:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-[100]">
                                {a.user.name}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                              </div>
                            </div>
                          ))}

                        {/* THE "+N" BUBBLE */}
                        {task.assignees.length > 3 && (
                          <div
                            className="relative group/more h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold border-2 border-white text-gray-600 shadow-sm cursor-help"
                            style={{ zIndex: 0 }}
                          >
                            +{task.assignees.length - 3}
                            {/* List Tooltip for the +N bubble */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/more:block bg-gray-900 text-white text-[10px] px-3 py-2 rounded-lg shadow-xl z-[100] min-w-[100px] text-left">
                              <p className="font-bold text-gray-400 uppercase text-[9px] mb-1">
                                Others:
                              </p>
                              <div className="flex flex-col gap-0.5">
                                {task.assignees.slice(3).map((a: any) => (
                                  <span
                                    key={a.user.id}
                                    className="block whitespace-nowrap"
                                  >
                                    {a.user.name}
                                  </span>
                                ))}
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200 border-dashed">
                        <User className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>

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

            <div className="p-6 border-b border-gray-100">
              <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Description / Instructions
              </h3>
              <div className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                {task.description || "No description provided."}
              </div>
            </div>

            {["submitted", "approved", "rejected"].includes(task.status) &&
              task.employee_notes && (
                <div className="p-6 border-b border-gray-100 bg-emerald-50/30">
                  <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    Employee Submission Notes
                  </h3>
                  <div className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {task.employee_notes}
                  </div>
                </div>
              )}

            {task.attachments && task.attachments.length > 0 && (
              <div className="p-6">
                <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  All Attached Files
                </h3>
                <div className="flex flex-col gap-1.5 max-w-lg">
                  {task.attachments.map((file: any) => {
                    // Bind the specific file data to the server action
                    const removeFile = deleteAttachment.bind(
                      null,
                      file.id,
                      file.file_path,
                    );

                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 -mx-2 rounded-md hover:bg-gray-50 transition-colors group"
                      >
                        {/* 1. The File Link (Left Side) */}
                        <a
                          href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/task-attachments/${file.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 overflow-hidden mr-4"
                        >
                          <Paperclip className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-[13px] font-medium text-gray-700 truncate hover:text-primary transition-colors">
                            {file.file_path.split("/").pop()}
                          </span>
                        </a>

                        {/* 2. Action Icons (Grouped side-by-side on the Right) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          {/* The Download Button */}
                          <a
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/task-attachments/${file.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-all flex items-center justify-center"
                            title="Download attachment"
                          >
                            <Download className="h-4 w-4" />
                          </a>

                          {/* The Remove Button (Normal gray color on hover) */}
                          <form action={removeFile}>
                            <button
                              type="submit"
                              className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-all flex items-center justify-center"
                              title="Remove attachment"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            {isSubmitted ? (
              <ReviewForm
                taskId={task.id}
                assignees={task.assignees}
                taskTitle={task.title}
              />
            ) : (
              <TaskManagementPanel task={task} employees={employees || []} />
            )}

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

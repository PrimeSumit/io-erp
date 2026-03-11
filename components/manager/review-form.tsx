"use client";

import { useState } from "react";
import { reviewTask } from "@/app/(manager)/actions";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

export function ReviewForm({ taskId, assignees, taskTitle }: any) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleAction(status: "approved" | "rejected") {
    setErrorMsg("");
    if (status === "rejected" && !feedback.trim()) {
      setErrorMsg("Feedback required for revisions.");
      return;
    }
    setLoading(true);

    const assigneeIds = assignees
      ? assignees.map((a: any) => a.user?.id || a.user_id)
      : [];

    try {
      const res = await reviewTask({
        taskId,
        assigneeIds,
        taskTitle,
        status,
        feedback,
      });

      if (res?.success) {
        router.push("/manager/tasks");
        router.refresh();
      } else {
        setErrorMsg(res?.error || "Failed to update task.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-transparent">
      <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-5">
        Manager Decision
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
            Review Feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add notes for the employee..."
            className="w-full text-[13px] p-3 rounded-md border border-gray-300 bg-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all h-24 resize-none shadow-sm"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-red-50 text-red-700 rounded-md text-[12px] font-medium border border-red-100 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <button
            disabled={loading}
            onClick={() => handleAction("approved")}
            className="w-full py-2 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm"
          >
            {loading ? "Processing..." : "Approve Task"}
          </button>

          <button
            disabled={loading}
            onClick={() => handleAction("rejected")}
            className="w-full py-2 bg-white border border-gray-300 text-gray-700 text-[13px] font-medium rounded-md hover:bg-gray-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-all shadow-sm"
          >
            {loading ? "Processing..." : "Reject & Return"}
          </button>
        </div>
      </div>
    </div>
  );
}

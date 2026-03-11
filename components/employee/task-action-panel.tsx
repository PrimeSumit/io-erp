"use client";

import { useState } from "react";
import {
  Play,
  Loader2,
  Send,
  Clock,
  CheckCircle2,
  Paperclip,
  X,
} from "lucide-react";
import { startTask, submitTask } from "@/app/(employee)/actions";
import { useRouter } from "next/navigation";

export function TaskActionPanel({
  taskId,
  status,
  managerId,
  taskTitle,
  employeeName,
}: any) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleStart = async () => {
    setLoading(true);
    await startTask(taskId);
    router.refresh();
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (
      !notes &&
      files.length === 0 &&
      !confirm("Submit without notes or files?")
    )
      return;
    setLoading(true);

    // Modern Next.js way: Pack everything into FormData
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("managerId", managerId);
    formData.append("taskTitle", taskTitle);
    formData.append("employeeName", employeeName);
    formData.append("submissionNotes", notes);

    // Append all selected files
    files.forEach((file) => formData.append("files", file));

    await submitTask(formData);

    router.refresh();
    setLoading(false);
  };

  if (status === "approved") {
    return (
      <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-6 text-center shadow-sm">
        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-[14px] font-bold text-emerald-900">
          Task Approved
        </h3>
        <p className="text-[13px] text-emerald-700 mt-1">
          Excellent work. This task is closed.
        </p>
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6 text-center shadow-sm">
        <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-3 animate-pulse" />
        <h3 className="text-[14px] font-bold text-yellow-900">Under Review</h3>
        <p className="text-[13px] text-yellow-700 mt-1">
          Waiting for manager feedback.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-transparent shadow-sm">
      <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-5">
        {status === "assigned" ? "Action Required" : "Submit Your Work"}
      </h3>

      {status === "assigned" || status === "rejected" ? (
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-2.5 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Start Working
        </button>
      ) : (
        <div className="space-y-4">
          {/* Notes Input */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
              Proof of Work / Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain what you did, paste links, etc..."
              className="w-full text-[13px] p-3 rounded-md border border-gray-300 bg-white outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all h-28 resize-none shadow-sm"
            />
          </div>

          {/* File Upload Input */}
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
              Attach Files (Optional)
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-md p-4 hover:bg-gray-50 transition-colors text-center cursor-pointer">
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Paperclip className="h-5 w-5 text-gray-400 mx-auto mb-1" />
              <span className="text-[12px] text-gray-500 font-medium">
                Click to upload files
              </span>
            </div>

            {/* List selected files */}
            {files.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
                  >
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      {file.name}
                    </span>
                    <button
                      onClick={() =>
                        setFiles(files.filter((_, index) => index !== i))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit for Review
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";
import { deleteTask } from "@/app/(manager)/actions";
import { useRouter } from "next/navigation";

export function DeleteTaskButton({
  taskId,
  taskTitle,
}: {
  taskId: string;
  taskTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleDelete() {
    setLoading(true);
    const res = await deleteTask(taskId);
    if (res.success) {
      setIsOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  // The beautiful custom modal (same as the panel!)
  const modalContent = isOpen && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 cursor-default text-left"
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(false);
      }}
    >
      <div
        className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-[17px] font-black text-gray-900 leading-tight">
            Delete Task?
          </h3>
        </div>

        <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
          Are you sure you want to delete the following task? <br />
          <span className="font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded mt-2 inline-block break-words w-full">
            "{taskTitle}"
          </span>
          <br />
          <br />
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 py-3 rounded-xl font-bold text-[13px] text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 text-white font-bold text-[13px] rounded-xl hover:bg-red-700 transition-all flex justify-center items-center shadow-md disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors relative z-10"
        title="Delete Task"
      >
        <Trash2 className="h-[18px] w-[18px]" />
      </button>

      {/* Mount Modal safely outside the UI wrapper */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}

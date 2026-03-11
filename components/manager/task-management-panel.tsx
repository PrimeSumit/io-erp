"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { updateTask, deleteTask } from "@/app/(manager)/actions";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Trash2, X } from "lucide-react";

export function TaskManagementPanel({ task, employees }: any) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // 👇 FIXED: This useEffect ensures the Panel dynamically syncs if the task is edited somewhere else!
  useEffect(() => {
    if (task && task.assignees) {
      const currentAssignees = task.assignees.map(
        (a: any) => a.user?.id || a.user_id,
      );
      setSelectedUsers(currentAssignees);
    } else {
      setSelectedUsers([]);
    }
  }, [task]);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  async function handleSave() {
    setLoading(true);

    const res = await updateTask(task.id, {
      ...task,
      assigned_to: selectedUsers,
    });
    if (res.success) {
      setIsOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    const res = await deleteTask(task.id);
    if (res.success) router.push("/manager/tasks");
    setLoading(false);
  }

  // The Delete Confirmation Modal
  const deleteModal = isDeleteModalOpen && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setIsDeleteModalOpen(false)}
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
            "{task.title}"
          </span>
          <br />
          <br />
          This action cannot be undone and will remove all associated
          attachments.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
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
      <div className="border border-gray-200 rounded-lg p-5 bg-transparent">
        <h3 className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-5">
          Task Control
        </h3>

        <div className="space-y-4">
          {/* Reassign Section (Bubbles UI) */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[12px] font-medium text-gray-700 mb-1.5">
              Reassign To
            </label>

            {/* The Top Selection Box */}
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="w-full min-h-[46px] p-2 rounded-xl border border-gray-200 bg-white hover:border-purple-200 focus:border-purple-300 focus:ring-4 focus:ring-purple-50 outline-none text-[13px] font-medium text-gray-900 transition-all shadow-sm flex justify-between items-center cursor-pointer"
            >
              <div className="flex flex-wrap gap-1.5 flex-1 mr-2">
                {selectedUsers.length === 0 ? (
                  <span className="text-gray-500 px-1 py-1 text-xs">
                    Unassigned
                  </span>
                ) : (
                  selectedUsers.map((userId) => {
                    const emp = employees.find((e: any) => e.id === userId);
                    if (!emp) return null;
                    return (
                      <span
                        key={userId}
                        className="flex items-center gap-1 bg-purple-50 text-[#8b5a83] px-2 py-1 rounded-lg text-xs font-bold border border-purple-100 shadow-sm"
                      >
                        {emp.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents dropdown from toggling when clicking X
                            toggleUser(userId);
                          }}
                          className="hover:bg-purple-200 hover:text-[#7a4e73] rounded p-0.5 ml-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </div>

            {/* The Dropdown List */}
            {isOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto py-2 custom-scrollbar">
                <div
                  onClick={() => setSelectedUsers([])}
                  className="px-4 py-2.5 text-[13px] font-medium cursor-pointer hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                >
                  <div className="w-4 flex justify-center">
                    {selectedUsers.length === 0 && (
                      <Check className="h-4 w-4 text-[#8b5a83]" />
                    )}
                  </div>
                  Unassigned
                </div>
                {employees.map((emp: any) => {
                  const isSelected = selectedUsers.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleUser(emp.id)}
                      className={`px-4 py-2.5 text-[13px] font-medium cursor-pointer hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                        isSelected
                          ? "text-[#8b5a83] bg-purple-50/50"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="w-4 flex justify-center">
                        {isSelected && (
                          <Check className="h-4 w-4 text-[#8b5a83]" />
                        )}
                      </div>
                      {emp.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-2 bg-primary text-white text-[13px] font-medium rounded-md hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={loading}
              className="w-full py-2 bg-transparent text-red-600 text-[13px] font-medium rounded-md hover:bg-red-50 transition-all"
            >
              Delete Task
            </button>
          </div>
        </div>
      </div>

      {mounted && createPortal(deleteModal, document.body)}
    </>
  );
}

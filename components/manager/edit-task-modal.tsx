"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Edit,
  SquarePen,
  Calendar,
  User,
  AlertCircle,
  FileText,
  Check,
  ChevronDown,
  Paperclip,
  Trash2,
} from "lucide-react";
import { updateTask } from "@/app/(manager)/actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function EditTaskModal({
  task,
  employees,
  triggerType = "button",
}: {
  task: any;
  employees: any[];
  triggerType?: "icon" | "button";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [mounted, setMounted] = useState(false);

  // Safely extract exact YYYY-MM-DD
  const getFormattedDate = (dateString: string) => {
    if (!dateString) return "";
    const rawDate = String(dateString);
    if (rawDate.includes("T")) return rawDate.split("T")[0];
    return rawDate.substring(0, 10);
  };

  const [dueDate, setDueDate] = useState(() =>
    getFormattedDate(task?.due_date),
  );

  const initialAssignees = task.assignees
    ? task.assignees.map((a: any) => a.user?.id || a.user_id)
    : [];
  const [selectedUsers, setSelectedUsers] =
    useState<string[]>(initialAssignees);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // Allow past dates only if it was the original due date
  const todayDate = new Date().toISOString().split("T")[0];
  const minDate = dueDate && dueDate < todayDate ? dueDate : todayDate;

  // 👇 FIXED: Ensure the Edit Modal updates its state if the task is edited via the Panel!
  useEffect(() => {
    if (task && task.assignees) {
      const currentAssignees = task.assignees.map(
        (a: any) => a.user?.id || a.user_id,
      );
      setSelectedUsers(currentAssignees);
    } else {
      setSelectedUsers([]);
    }

    if (task?.due_date) {
      setDueDate(getFormattedDate(task.due_date));
    }
  }, [task]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    const result = await updateTask(task.id, {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as string,
      due_date: formData.get("due_date") as string,
      assigned_to: selectedUsers,
    });

    if (result?.error) {
      setErrorMsg(result.error);
      setLoading(false);
      return;
    }

    if (result?.success && files.length > 0) {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;

      const uploadPromises = files.map(async (f) => {
        const fileExt = f.name.split(".").pop();
        const fileName = `${task.id}/${Math.random()}.${fileExt}`;

        const { data: uploadData } = await supabase.storage
          .from("task-attachments")
          .upload(fileName, f);

        if (uploadData) {
          await supabase.from("attachments").insert({
            task_id: task.id,
            file_path: uploadData.path,
            file_type: f.type,
            uploaded_by: userId,
          });
        }
      });

      await Promise.all(uploadPromises);
    }

    setLoading(false);
    if (result?.success) {
      setIsOpen(false);
      setFiles([]);
      router.refresh();
    }
  }

  const inputStyles =
    "w-full px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-purple-200 focus:border-purple-300 focus:ring-4 focus:ring-purple-50 outline-none text-[13px] font-medium text-gray-900 transition-all shadow-sm";
  const labelStyles =
    "text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 ml-1";

  const modalContent = isOpen && (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-left cursor-default animate-in fade-in duration-200"
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(false);
      }}
    >
      <div
        className="w-full max-w-[500px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-50 shrink-0">
          <h3 className="text-lg font-black text-gray-900">Edit Task</h3>
          <button
            onClick={() => {
              setIsOpen(false);
              setFiles([]);
            }}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-7 custom-scrollbar bg-[#fcfcfc]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className={labelStyles}>
                <FileText className="h-[13px] w-[13px] text-[#8b5a83]" /> Task
                Title
              </label>
              <input
                name="title"
                defaultValue={task.title}
                required
                className={inputStyles}
              />
            </div>

            <div>
              <label className={labelStyles}>Description</label>
              <textarea
                name="description"
                defaultValue={task.description}
                required
                rows={3}
                className={`${inputStyles} resize-none`}
              />
            </div>

            {/* Attachments */}
            <div>
              <label className={labelStyles}>
                <Paperclip className="h-[13px] w-[13px] text-[#8b5a83]" /> Add
                New Attachments
              </label>
              <div className="relative bg-white rounded-xl border border-gray-100 p-2.5 shadow-sm hover:border-purple-200 transition-colors">
                <div className="flex items-center">
                  <input
                    type="file"
                    multiple={true}
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files || []);
                      setFiles((prev) => [...prev, ...newFiles]);
                      e.target.value = "";
                    }}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:tracking-wide file:bg-purple-50 file:text-[#8b5a83] hover:file:bg-purple-100 cursor-pointer transition-colors"
                  />
                </div>

                {files.length > 0 ? (
                  <div className="mt-3 px-1 flex flex-col gap-1.5 border-t border-gray-50 pt-3">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-sm"
                      >
                        <p className="text-[11px] font-medium text-gray-600 truncate flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500 shrink-0" />{" "}
                          {f.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove file"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 mt-2 ml-2 italic">
                    Existing attachments are safe. Select files to add more.
                  </p>
                )}
              </div>
            </div>

            {/* Assignees */}
            <div className="relative" ref={dropdownRef}>
              <label className={labelStyles}>
                <User className="h-[13px] w-[13px] text-[#8b5a83]" /> Assignees
                (Select Multiple)
              </label>

              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full min-h-[46px] p-2 rounded-xl border border-gray-200 bg-white hover:border-purple-200 focus:border-purple-300 focus:ring-4 focus:ring-purple-50 outline-none text-[13px] font-medium text-gray-900 transition-all shadow-sm flex justify-between items-center cursor-pointer"
              >
                <div className="flex flex-wrap gap-1.5 flex-1 mr-2">
                  {selectedUsers.length === 0 ? (
                    <span className="text-gray-500 px-1 py-1">
                      Unassigned (Save to Draft)
                    </span>
                  ) : (
                    selectedUsers.map((userId) => {
                      const emp = employees.find((e: any) => e.id === userId);
                      if (!emp) return null;
                      return (
                        <span
                          key={userId}
                          className="flex items-center gap-1 bg-purple-50 text-[#8b5a83] px-2 py-1 rounded-lg text-xs font-bold border border-purple-100"
                        >
                          {emp.name}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
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
                  className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto p-3 custom-scrollbar">
                  <div className="flex flex-wrap gap-2">
                    <div
                      onClick={() => setSelectedUsers([])}
                      className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                        selectedUsers.length === 0
                          ? "bg-purple-50 border-purple-200 text-[#8b5a83]"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      {selectedUsers.length === 0 && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Unassigned (Draft)
                    </div>

                    {employees.map((emp) => {
                      const isSelected = selectedUsers.includes(emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => toggleUser(emp.id)}
                          className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                            isSelected
                              ? "bg-purple-50 border-purple-200 text-[#8b5a83]"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                          {emp.name}
                        </div>
                      );
                    })}

                    {employees.length === 0 && (
                      <div className="text-[13px] text-gray-400 italic px-1 w-full mt-1">
                        No employees available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Priority & Due Date Row */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelStyles}>
                  <AlertCircle className="h-[13px] w-[13px] text-[#8b5a83]" />{" "}
                  Priority
                </label>
                <select
                  name="priority"
                  defaultValue={task.priority}
                  required
                  className={`${inputStyles} appearance-none cursor-pointer`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className={labelStyles}>
                  <Calendar className="h-[13px] w-[13px] text-[#8b5a83]" /> Due
                  Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  min={minDate}
                  className={`${inputStyles} cursor-pointer`}
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {errorMsg}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-2 flex gap-3 pb-2 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setFiles([]);
                }}
                className="flex-1 py-3.5 rounded-xl font-bold text-[13px] text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 transition-colors mt-4"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                type="submit"
                className="flex-[2] py-3.5 bg-[#8b5a83] text-white font-bold text-[13px] rounded-xl shadow-md hover:bg-[#7a4e73] transition-all disabled:opacity-70 flex justify-center items-center mt-4"
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {triggerType === "icon" ? (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="p-1.5 text-gray-500 hover:text-[#8b5a83] hover:bg-purple-50 rounded-md transition-colors relative z-10"
          title="Edit Task"
        >
          <SquarePen className="h-[18px] w-[18px]" />
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3.5 py-2 rounded-lg text-[13px] font-bold hover:bg-gray-50 hover:text-[#8b5a83] transition-all shadow-sm"
        >
          <Edit className="h-3.5 w-3.5" /> Edit Task
        </button>
      )}

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}

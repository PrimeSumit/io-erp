"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/lib/notifications";

export async function startTask(taskId: string) {
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("title, created_by, users!assigned_to(name)")
    .eq("id", taskId)
    .single();

  const { error } = await supabase
    .from("tasks")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) return { success: false, error: error.message };

  if (task && task.created_by) {
    const empName = (task.users as any)?.name || "An employee";
    await sendNotification({
      userId: task.created_by,
      title: "Task In Progress",
      message: `${empName} started working on "${task.title}".`,
      link: `/manager/tasks/${taskId}`,
    });
  }

  revalidatePath(`/employee/work/${taskId}`);
  revalidatePath("/employee/dashboard");
  return { success: true };
}

export async function submitTask(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const taskId = formData.get("taskId") as string;
  const managerId = formData.get("managerId") as string;
  const taskTitle = formData.get("taskTitle") as string;
  const employeeName = formData.get("employeeName") as string;
  const submissionNotes = formData.get("submissionNotes") as string;

  const files = formData.getAll("files") as File[];

  if (files && files.length > 0) {
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${taskId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("task-attachments")
          .upload(filePath, arrayBuffer, {
            contentType: file.type,
            upsert: false,
          });

        if (!uploadError) {
          const { error: dbError } = await supabase.from("attachments").insert({
            task_id: taskId,
            file_path: filePath,
            file_type: file.type,
            uploaded_by: user?.id,
          });

          if (dbError) console.error("Database Insert Error:", dbError.message);
        } else {
          console.error("File upload failed:", uploadError.message);
        }
      } catch (err) {
        console.error("File processing error:", err);
      }
    }
  }

  const updateData: any = {
    status: "submitted",
    updated_at: new Date().toISOString(),
  };

  if (submissionNotes) {
    updateData.employee_notes = submissionNotes;
  }

  const { error: updateError } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId);

  if (updateError) {
    console.error("Error submitting task:", updateError);
    return { success: false, error: "Failed to submit task." };
  }

  if (managerId) {
    await sendNotification({
      userId: managerId,
      title: "Task Submitted",
      message: `${employeeName} has submitted proof of work for "${taskTitle}".`,
      link: `/manager/tasks/${taskId}`,
    });
  }

  revalidatePath("/employee/dashboard");
  revalidatePath(`/manager/tasks/${taskId}`);
  revalidatePath(`/employee/work/${taskId}`);

  return { success: true };
}

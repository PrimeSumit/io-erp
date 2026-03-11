"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendNotification } from "@/lib/notifications";

/**
 * 1. ASSIGN NEW TASK
 */
export async function assignTask(data: any) {
  const supabase = await createClient();

  // Securely get the logged-in Manager's ID
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { error: "Authentication required to create a task." };
  }
  const creatorId = authData.user.id;

  // Safely ensure assigned_to is treated as an array
  const assigneesArray = Array.isArray(data.assigned_to)
    ? data.assigned_to
    : data.assigned_to
      ? [data.assigned_to]
      : [];

  const initialStatus = assigneesArray.length > 0 ? "assigned" : "draft";
  const primaryAssignee = assigneesArray.length > 0 ? assigneesArray[0] : null;

  // 1. Insert the Task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      title: data.title,
      description: data.description,
      priority: data.priority,
      due_date: data.due_date,
      department_id: data.department_id,
      status: initialStatus,
      assigned_to: primaryAssignee,
      created_by: creatorId,
    })
    .select()
    .single();

  if (taskError) {
    console.error("Task Insert Error:", taskError);
    return { error: `Task Error: ${taskError.message}` };
  }

  // 2. Insert Multiple Assignees into the Junction Table
  if (assigneesArray.length > 0) {
    const junctionData = assigneesArray.map((userId: string) => ({
      task_id: task.id,
      user_id: userId,
    }));

    const { error: assigneesError } = await supabase
      .from("task_assignees")
      .insert(junctionData);

    if (assigneesError) {
      console.error("Assignees Insert Error:", assigneesError);
      return { error: `Junction Error: ${assigneesError.message}` };
    }

    // 👇 ADDED: Notify employees about the brand new task!
    for (const userId of assigneesArray) {
      await sendNotification({
        userId: userId,
        title: "New Task Assigned",
        message: `You have been assigned a new task: "${data.title}"`,
        link: `/employee/work/${task.id}`,
      });
    }
  }

  return { success: true, taskId: task.id };
}

/**
 * 2. REVIEW TASK (Approved/Rejected)
 */
export async function reviewTask({
  taskId,
  assigneeIds, // Now expects an array of user IDs
  taskTitle,
  status,
  feedback,
}: {
  taskId: string;
  assigneeIds: string[];
  taskTitle: string;
  status: "approved" | "rejected";
  feedback?: string;
}) {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("tasks")
    .update({
      status: status,
      manager_feedback: feedback,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (updateError) return { error: "Failed to update task status" };

  const notificationTitle =
    status === "approved" ? "Task Approved!" : "Task Returned";
  const notificationMessage =
    status === "approved"
      ? `Your task "${taskTitle}" was approved.`
      : `Your task "${taskTitle}" was rejected. Feedback: ${feedback}`;

  // Loop through ALL assignees and send them a notification
  if (assigneeIds && assigneeIds.length > 0) {
    for (const userId of assigneeIds) {
      await sendNotification({
        userId: userId,
        title: notificationTitle,
        message: notificationMessage,
        link: `/employee/work/${taskId}`,
      });
    }
  }

  revalidatePath("/manager/dashboard");
  revalidatePath("/manager/tasks");

  return { success: true };
}

/**
 * 3. DELETE TASK
 */
export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  // Fetch task AND all its assignees before deleting
  const { data: task } = await supabase
    .from("tasks")
    .select("title, assignees:task_assignees(user_id)")
    .eq("id", taskId)
    .single();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) return { success: false, error: error.message };

  // Loop through to notify everyone the task was cancelled
  if (task && task.assignees && task.assignees.length > 0) {
    for (const assignee of task.assignees) {
      await sendNotification({
        userId: assignee.user_id,
        title: "Task Cancelled",
        message: `Manager deleted the task: "${task.title}".`,
        link: `/employee/work`,
      });
    }
  }

  revalidatePath("/manager/tasks");
  return { success: true };
}

/**
 * 4. UPDATE TASK (Reassign)
 */
export async function updateTask(taskId: string, data: any) {
  const supabase = await createClient();

  // Safely format assignees as an array
  const assigneesArray = Array.isArray(data.assigned_to)
    ? data.assigned_to
    : data.assigned_to
      ? [data.assigned_to]
      : [];

  const { data: currentTask } = await supabase
    .from("tasks")
    .select("status")
    .eq("id", taskId)
    .single();

  // Handle status logic
  let newStatus = currentTask?.status;
  if (assigneesArray.length === 0) {
    newStatus = "draft";
  } else if (newStatus === "draft" && assigneesArray.length > 0) {
    newStatus = "assigned";
  }

  const primaryAssignee = assigneesArray.length > 0 ? assigneesArray[0] : null;

  // 1. Update the main task details
  const { error } = await supabase
    .from("tasks")
    .update({
      title: data.title,
      description: data.description,
      priority: data.priority,
      due_date: data.due_date,
      status: newStatus,
      assigned_to: primaryAssignee, // Satisfy legacy RLS
    })
    .eq("id", taskId);

  if (error) return { success: false, error: error.message };

  // 2. Manage the Junction Table (task_assignees)
  // Clear out old assignees
  await supabase.from("task_assignees").delete().eq("task_id", taskId);

  // Insert the new selected assignees
  if (assigneesArray.length > 0) {
    const junctionData = assigneesArray.map((userId: string) => ({
      task_id: taskId,
      user_id: userId,
    }));
    await supabase.from("task_assignees").insert(junctionData);

    // Notify the users they were added to this task
    for (const userId of assigneesArray) {
      await sendNotification({
        userId: userId,
        title: "Task Assignment Updated",
        message: `You are assigned to the task: "${data.title}"`,
        link: `/employee/work/${taskId}`,
      });
    }
  }

  revalidatePath("/manager/tasks");
  revalidatePath(`/manager/tasks/${taskId}`);
  return { success: true };
}
export async function deleteAttachment(attachmentId: string, filePath: string) {
  const supabase = await createClient();

  // 1. Remove from Storage
  const { error: storageError } = await supabase.storage
    .from("task-attachments")
    .remove([filePath]);

  if (storageError) console.error("Storage Delete Error:", storageError);

  // 2. Remove from Database
  const { error: dbError } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId);

  if (dbError) console.error("DB Delete Error:", dbError);

  // 3. FIX: Add "layout" so it refreshes the [id] details page too!
  revalidatePath("/manager/tasks", "layout");
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/get-profile";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { sendNotification } from "@/lib/notifications";

async function notifyAllAdmins(title: string, message: string, link: string) {
  const supabase = await createClient();
  const { data: admins } = await supabase
    .from("users")
    .select("id")
    .eq("role", "admin");

  if (admins) {
    for (const admin of admins) {
      await sendNotification({
        userId: admin.id,
        title,
        message,
        link,
      });
    }
  }
}

export async function updateUserDetails(formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile();

  // 👇 ADD THIS SECURITY CHECK
  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  let department_id = formData.get("department_id") as string | null;
  const status = formData.get("status") as string;

  // Enforce rule: Admins cannot belong to a specific department
  if (role === "admin" || department_id === "null" || department_id === "") {
    department_id = null;
  }

  // Handle Active/Inactive status via the deleted_at column
  const deleted_at = status === "active" ? null : new Date().toISOString();

  const { error } = await supabase
    .from("users")
    .update({ name, role, department_id, deleted_at })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function createDepartment(formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  if (!name) return { error: "Department name is required" };

  const { data, error } = await supabase
    .from("departments")
    .insert({
      name,
      organization_id: profile.organization_id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    action: `Created department: ${name}`,
    performed_by: profile.id,
    new_state: { name, id: data.id },
  });

  await notifyAllAdmins(
    "New Department",
    `${profile.name} created the "${name}" department.`,
    "/admin/departments",
  );

  revalidatePath("/admin/departments");
  return { success: true };
}

export async function addUserDirectly(formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string; // 👈 Admin sets this now
  const role = (formData.get("role") as string).toLowerCase();
  const rawDeptId = formData.get("departmentId") as string;
  const departmentId =
    rawDeptId === "none" || rawDeptId === "" ? null : rawDeptId;

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm
    user_metadata: {
      name,
      role,
      organization_id: profile.organization_id,
      department_id: departmentId,
    },
  });

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    action: `Added user directly: ${email}`,
    performed_by: profile.id,
    new_state: { role, departmentId, name },
  });

  await notifyAllAdmins(
    "User Added 👤",
    `${profile.name} added ${name} (${role}) to the system.`,
    "/admin/users",
  );

  revalidatePath("/admin/users");
  revalidatePath("/admin/departments");
  revalidatePath("/manager/team");
  revalidatePath("/manager/dashboard");

  return { success: true };
}
export async function updateDepartment(formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const managerId = formData.get("manager_id") as string;

  const { error } = await supabase
    .from("departments")
    .update({
      name,
      manager_id: managerId === "none" || managerId === "" ? null : managerId,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // Audit Log
  await supabase.from("audit_logs").insert({
    action: `Updated department: ${name}`,
    performed_by: profile.id,
    new_state: { id, name, managerId },
  });

  revalidatePath("/admin/departments");
  return { success: true };
}

export async function deleteDepartment(departmentId: string) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("department_id", departmentId);

  if (count && count > 0) {
    return {
      error: `Cannot delete: ${count} users are still assigned to this department.`,
    };
  }

  const { error } = await supabase
    .from("departments")
    .delete()
    .eq("id", departmentId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    action: `Deleted department ID: ${departmentId}`,
    performed_by: profile.id,
  });

  revalidatePath("/admin/departments");
  return { success: true };
}

export async function updateTicketStatus(formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile || profile.role !== "admin") return { error: "Unauthorized" };

  const ticketId = formData.get("ticketId") as string;
  const newStatus = formData.get("status") as string;

  const { error } = await supabase
    .from("support_tickets")
    .update({ status: newStatus.toLowerCase() })
    .eq("id", ticketId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    action: `Ticket ${newStatus}: ${ticketId}`,
    performed_by: profile.id,
    new_state: { status: newStatus },
  });

  await notifyAllAdmins(
    "Support Ticket Updated",
    `Ticket #${ticketId.substring(0, 6)} is now ${newStatus}.`,
    "/admin/support",
  );

  revalidatePath("/admin/support");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

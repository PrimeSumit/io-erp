import { createClient } from "@/lib/supabase/server";

export async function logAction(userId: string, action: string, details: any) {
  const supabase = await createClient();

  // We map the incoming data to YOUR table columns:
  // user_id -> performed_by
  // details -> new_state
  const { error } = await supabase.from("audit_logs").insert({
    performed_by: userId,
    action: action,
    new_state: details, // Storing details in 'new_state' since you don't have a 'details' column
    // task_id: null,      // Optional: leave null for general system actions
  });

  if (error) {
    console.error("Audit Log Failed:", error.message);
  }
}

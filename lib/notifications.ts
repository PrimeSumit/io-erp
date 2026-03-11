import { createClient } from "@/lib/supabase/server";

export async function sendNotification({
  userId,
  title,
  message,
  link = "/dashboard", // Default fallback if no link is provided
}: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title: title,
    message: message,
    link: link,
    // created_at & is_read are handled automatically by the DB
  });

  if (error) {
    console.error("Failed to send notification:", error);
  }
}

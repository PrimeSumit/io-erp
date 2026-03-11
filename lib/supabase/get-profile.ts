import { createClient } from "./server";

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // FIX: We added '!department_id' to tell Supabase which relationship to use
  const { data: profile, error } = await supabase
    .from("users")
    .select("*, organizations(name), departments!department_id(name)")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("❌ Profile Query Failed:", error.message);
    return null;
  }

  return profile;
}

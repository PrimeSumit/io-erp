import { getProfile } from "@/lib/supabase/get-profile";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server"; // Import this!

export default async function HomePage() {
  // 1. Fetch the user profile
  const profile = await getProfile();

  // 2. SAFETY CHECK: If no profile found (Zombie User)
  if (!profile) {
    // Initialize Supabase to sign them out server-side
    const supabase = await createClient();
    await supabase.auth.signOut();

    // Now redirect to login with a clear error
    redirect("/login?error=Profile not found. Please contact admin.");
  }

  // 3. ROLE BASED REDIRECTS
  switch (profile.role) {
    case "admin":
      redirect("/admin/dashboard");
      break;
    case "manager":
    case "hr":
    case "team_leader":
      redirect("/manager/dashboard");
      break;
    case "employee":
      redirect("/employee/dashboard");
      break;
    default:
      redirect("/unauthorized");
  }

  return null;
}

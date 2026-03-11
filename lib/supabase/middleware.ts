import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // 1. Create the initial response
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2. Initialize Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 3. Refresh the Session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // =============================================================
  // 🔒 SECURITY GUARD
  // =============================================================

  const path = request.nextUrl.pathname;

  // A. Pages only for GUESTS (Logged out users)
  // We do NOT include /update-password here because you must be logged in to update it!
  const isGuestPage =
    path.startsWith("/login") ||
    path.startsWith("/auth") ||
    path === "/forgot-password";

  // RULE 1: If user is NOT logged in and tries to visit a private page...
  // ...kick them back to /login
  if (!user && !isGuestPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // RULE 2: If user IS logged in and tries to visit a guest page (like Login)...
  // ...redirect them to the dashboard
  if (user && isGuestPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

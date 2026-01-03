import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Admin-only routes (require admin role)
  const adminRoutes = ["/admin"];

  // Public routes (no auth required)
  const publicRoutes = ["/login", "/api"];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes without auth
  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Redirect to login if not authenticated and accessing protected route
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Get user role from profile
  let userRole: "admin" | "officer" = "officer";
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role) {
    userRole = profile.role;
  }

  // Role-based route protection
  // Officers cannot access admin routes
  if (userRole === "officer" && isAdminRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users from login page based on role
  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = userRole === "admin" ? "/admin" : "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const authRoutes = ["/login"];
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  const protectedRoutes = ["/dashboard"];
  const isProtectedRoute = protectedRoutes.some((r) =>
    pathname.startsWith(r)
  );

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user?.id ?? "");

  const tenantId = user?.user_metadata?.tenant_id;
  const role = user?.user_metadata?.role;

  if (tenantId) requestHeaders.set("x-tenant-id", tenantId);
  if (role) requestHeaders.set("x-user-role", role);
  
  console.log('[middleware] Setting headers:', { userId: user?.id, tenantId, role });

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Copy cookies from supabaseResponse to the new response
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    response.cookies.set(name, value, options as any);
  });

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
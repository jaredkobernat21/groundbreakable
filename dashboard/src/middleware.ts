import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedPath =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/leads") ||
    request.nextUrl.pathname.startsWith("/welcome");

  if (!user && protectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("investor_profiles")
      .select("welcomed_at, must_change_password")
      .eq("id", user.id)
      .single();

    // Admin-set temporary passwords (2026-09-29 fallback -- see
    // dashboard/admin/users/actions.ts) must be changed before anything
    // else. Checked ahead of the welcome screen so the order is always
    // password -> welcome -> dashboard, never welcome -> password.
    if (profile?.must_change_password) {
      const url = request.nextUrl.clone();
      url.pathname = "/set-password";
      return NextResponse.redirect(url);
    }

    // First-login welcome screen: an authenticated developer whose profile
    // hasn't been marked welcomed yet gets sent there before the dashboard,
    // exactly once (welcome/page.tsx's "Enter Dashboard" action sets
    // welcomed_at). Existing accounts were backfilled non-null in the
    // migration that added this column, so this only ever fires for
    // genuinely new accounts.
    if (profile && profile.welcomed_at === null) {
      const url = request.nextUrl.clone();
      url.pathname = "/welcome";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/leads/:path*", "/login", "/welcome"],
};

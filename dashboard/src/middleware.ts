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

  if (!user && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/leads"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Onboarding gate (3-tier product model, section 1): every account
  // must pick a professional role before seeing the rest of the
  // dashboard, since role drives which categories/cards/terminology the
  // Access-tier dashboard emphasizes. Admin routes are exempt -- an
  // admin operating the Partner desk isn't "onboarding" as a customer.
  if (
    user &&
    request.nextUrl.pathname.startsWith("/dashboard") &&
    !request.nextUrl.pathname.startsWith("/dashboard/profile") &&
    !request.nextUrl.pathname.startsWith("/dashboard/admin")
  ) {
    const { data: profileRows } = await supabase.from("investor_profiles").select("professional_role").eq("id", user.id);
    if (profileRows && profileRows.length > 0 && !profileRows[0].professional_role) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/profile";
      url.searchParams.set("onboarding", "1");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/leads/:path*", "/login"],
};

import { NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/utils/supabase/middleware";

const MAINTENANCE_MODE = true;

export async function middleware(request: NextRequest) {
  // The inventory admin is hosted separately and enforces its own Supabase auth.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (
    MAINTENANCE_MODE &&
    request.nextUrl.pathname !== "/maintenance" &&
    !request.nextUrl.pathname.startsWith("/_next") &&
    !request.nextUrl.pathname.startsWith("/api")
  ) {
    const maintenanceUrl = new URL("/maintenance", request.url);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-cardpulse-maintenance", "1");

    return NextResponse.rewrite(maintenanceUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

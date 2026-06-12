import { NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/utils/supabase/middleware";

const MAINTENANCE_MODE = true;

function unauthorizedResponse() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="CardPulse Admin"',
    },
  });
}

function configurationErrorResponse() {
  return new NextResponse("Admin credentials are not configured.", {
    status: 500,
  });
}

export async function middleware(request: NextRequest) {
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

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return updateSession(request);
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  let decoded = "";

  try {
    decoded = atob(authHeader.split(" ")[1] || "");
  } catch {
    return unauthorizedResponse();
  }

  const [username, password] = decoded.split(":");
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return configurationErrorResponse();
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return unauthorizedResponse();
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

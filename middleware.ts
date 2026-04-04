import { NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/utils/supabase/middleware";

function unauthorizedResponse() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="CardPulse Admin"',
    },
  });
}

export async function middleware(request: NextRequest) {
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
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "cardpulse";

  if (username !== expectedUsername || password !== expectedPassword) {
    return unauthorizedResponse();
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

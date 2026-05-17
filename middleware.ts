import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

type RoleString = "SUPERADMIN" | "ADMIN" | "MODERATOR" | "USER";

const ROUTE_PERMISSIONS: { pattern: RegExp; roles: RoleString[] }[] = [
  { pattern: /^\/admin\/settings/, roles: ["SUPERADMIN", "ADMIN"] },
  { pattern: /^\/admin\/api-keys/, roles: ["SUPERADMIN", "ADMIN"] },
  { pattern: /^\/admin\/users/, roles: ["SUPERADMIN", "ADMIN", "MODERATOR"] },
  { pattern: /^\/admin\/audit/, roles: ["SUPERADMIN", "ADMIN", "MODERATOR"] },
  { pattern: /^\/admin\/notifications/, roles: ["SUPERADMIN", "ADMIN"] },
  { pattern: /^\/servers\/new/, roles: ["SUPERADMIN", "ADMIN", "MODERATOR"] },
  { pattern: /^\/web-hosting\/new/, roles: ["SUPERADMIN", "ADMIN", "MODERATOR"] },
  { pattern: /^\/api\/admin\/settings/, roles: ["SUPERADMIN", "ADMIN"] },
  { pattern: /^\/api\/admin\/api-keys/, roles: ["SUPERADMIN", "ADMIN"] },
  { pattern: /^\/api\/admin\/users/, roles: ["SUPERADMIN", "ADMIN", "MODERATOR"] },
  { pattern: /^\/api\/admin\/audit/, roles: ["SUPERADMIN", "ADMIN", "MODERATOR"] },
];

function isRouteAllowed(pathname: string, role: string): boolean {
  for (const { pattern, roles } of ROUTE_PERMISSIONS) {
    if (pattern.test(pathname)) {
      return roles.includes(role as RoleString);
    }
  }
  return true;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const session = await auth();
  const isEmergencyAdmin = session?.user?.id === "emergency-admin-id";

  if (isEmergencyAdmin) {
    if (pathname === "/setup" || pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/setup" || pathname.startsWith("/api/setup")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/reset-password") || pathname.startsWith("/signup")) {
    return NextResponse.next();
  }

  if (!session?.user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
  }

  const userRole = (session.user.role as string) ?? "USER";

  if (!isRouteAllowed(pathname, userRole)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js).*)"]
};

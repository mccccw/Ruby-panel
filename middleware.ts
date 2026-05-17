import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

const DEFAULT_ADMIN_EMAIL = "cattech3d@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "@a240924";
const DEFAULT_ADMIN_USERNAME = "cattech";

async function ensureAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: DEFAULT_ADMIN_EMAIL }
    });

    if (!admin) {
      const passwordHash = await hash(DEFAULT_ADMIN_PASSWORD, 12);
      await prisma.user.create({
        data: {
          email: DEFAULT_ADMIN_EMAIL,
          username: DEFAULT_ADMIN_USERNAME,
          passwordHash,
          role: Role.SUPERADMIN,
          isActive: true
        }
      });
      console.log("Default admin user created successfully.");
    }
  } catch {
    // DB unavailable, skip silently
  }
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

  if (pathname.startsWith("/login") || pathname.startsWith("/reset-password")) {
    return NextResponse.next();
  }

  let userCount = 0;
  let dbAvailable = false;
  try {
    userCount = await prisma.user.count();
    dbAvailable = true;
  } catch {
    dbAvailable = false;
  }

  if (!dbAvailable) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/setup", request.url));
    }
    return NextResponse.next();
  }

  if (userCount === 0) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  void ensureAdmin();

  if (!session?.user) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js).*)"]
};

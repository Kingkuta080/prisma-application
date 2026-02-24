import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const parentPaths = ["/"];

function isParentPath(pathname: string) {
  return parentPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const user = req.auth?.user;
  const hasName = !!user?.name?.trim();
  const hasPhone = !!user?.phone?.trim();
  const profileComplete = hasName && hasPhone;

  if (pathname === "/complete-profile") {
    if (req.auth && profileComplete) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (isParentPath(pathname) && req.auth && !profileComplete) {
    return NextResponse.redirect(new URL("/complete-profile", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/complete-profile"],
};

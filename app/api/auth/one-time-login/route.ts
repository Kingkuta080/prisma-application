import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token?.trim() || !email?.trim()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const emailNorm = email.trim().toLowerCase();
  const tokenRecord = await prisma.oneTimeLoginToken.findUnique({
    where: { token: token.trim() },
  });

  if (
    !tokenRecord ||
    tokenRecord.email !== emailNorm ||
    new Date() > tokenRecord.expiresAt
  ) {
    return NextResponse.redirect(new URL("/login?error=invalid_or_expired_link", request.url));
  }

  const base = new URL(request.url).origin;
  const loginUrl = new URL("/login", base);
  loginUrl.searchParams.set("oneTimeToken", token.trim());
  loginUrl.searchParams.set("email", emailNorm);
  loginUrl.searchParams.set("auto", "1");
  return NextResponse.redirect(loginUrl);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl } from "@/lib/school-config";

function randomHexToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const baseUrl = getAppBaseUrl() || new URL(request.url).origin;
  if (!token?.trim() || !email?.trim()) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_link", baseUrl)
    );
  }

  const emailNorm = email.trim().toLowerCase();
  const verification = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: emailNorm,
        token: token.trim(),
      },
    },
  });

  if (!verification) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_or_expired_link", baseUrl)
    );
  }
  if (new Date() > verification.expires) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: emailNorm,
          token: token.trim(),
        },
      },
    });
    return NextResponse.redirect(
      new URL("/login?error=link_expired", baseUrl)
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: emailNorm },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: emailNorm,
          token: token.trim(),
        },
      },
    }),
  ]);

  const oneTimeToken = randomHexToken(32);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await prisma.oneTimeLoginToken.create({
    data: { email: emailNorm, token: oneTimeToken, expiresAt },
  });

  const loginUrl = new URL("/api/auth/one-time-login", baseUrl);
  loginUrl.searchParams.set("token", oneTimeToken);
  loginUrl.searchParams.set("email", emailNorm);
  return NextResponse.redirect(loginUrl);
}

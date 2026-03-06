"use server";

import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { sendVerificationEmail } from "@/lib/mail";

export type SignInCredentialsResult =
  | { success: true }
  | { success: false; errorCode: string };

export async function signInCredentials(
  email: string,
  password: string
): Promise<SignInCredentialsResult> {
  try {
    await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    return { success: true };
  } catch (e) {
    if (e instanceof AuthError) {
      const code = (e as { code?: string }).code;
      return { success: false, errorCode: code ?? "CredentialsSignin" };
    }
    throw e;
  }
}

/** Generate a 32-byte hex token using Web Crypto (works in Node and Edge). */
function randomHexToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email?.trim() || !password?.trim()) {
    return { error: "Email and password are required" };
  }

  const emailNorm = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: emailNorm },
  });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const hashed = await hash(password, 10);
  await prisma.user.create({
    data: {
      email: emailNorm,
      password: hashed,
      name: null,
      emailVerified: null,
    },
  });

  const token = randomHexToken(32);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.verificationToken.create({
    data: {
      identifier: emailNorm,
      token,
      expires,
    },
  });
  await sendVerificationEmail(emailNorm, token);

  redirect("/register/check-email?email=" + encodeURIComponent(emailNorm));
}

export async function resendVerification(email: string) {
  const emailNorm = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: emailNorm },
  });
  if (!user) return { error: "User not found" };
  if (user.emailVerified) return { error: "Already verified" };

  const token = randomHexToken(32);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.verificationToken.deleteMany({
    where: { identifier: emailNorm },
  });
  await prisma.verificationToken.create({
    data: { identifier: emailNorm, token, expires },
  });
  await sendVerificationEmail(emailNorm, token);
  return { ok: true };
}

export type UpdateProfileData = {
  name: string;
  phone: string;
  guardianFullName?: string;
  residence?: string;
  occupation?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  motherPhone?: string;
};

export async function updateProfile(data: UpdateProfileData) {
  const { name, phone } = data;
  if (!name?.trim() || !phone?.trim()) {
    return { error: "Full name and phone are required" };
  }
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name.trim(),
      phone: phone.trim(),
      guardianFullName: data.guardianFullName?.trim() ?? undefined,
      residence: data.residence?.trim() ?? undefined,
      occupation: data.occupation?.trim() ?? undefined,
      guardianPhone: data.guardianPhone?.trim() ?? undefined,
      guardianEmail: data.guardianEmail?.trim() ?? undefined,
      motherPhone: data.motherPhone?.trim() ?? undefined,
    },
  });
  return { ok: true };
}

export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}

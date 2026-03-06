import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { CredentialsSignin } from "next-auth";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";
import type { DefaultSession } from "next-auth";

/** Custom credential error codes for the client to show specific messages */
class AccountNotFoundError extends CredentialsSignin {
  code = "account_not_found";
}
class IncorrectPasswordError extends CredentialsSignin {
  code = "incorrect_password";
}
class AccountSuspendedError extends CredentialsSignin {
  code = "account_suspended";
}
class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string | null;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        oneTimeToken: { label: "One-time token", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const oneTimeToken = credentials?.oneTimeToken as string | undefined;
        const emailNorm = email?.trim()?.toLowerCase();
        if (!emailNorm) return null;

        if (oneTimeToken?.trim()) {
          const tokenRecord = await prisma.oneTimeLoginToken.findUnique({
            where: { token: oneTimeToken.trim() },
          });
          if (
            !tokenRecord ||
            tokenRecord.email !== emailNorm ||
            new Date() > tokenRecord.expiresAt
          ) {
            return null;
          }
          await prisma.oneTimeLoginToken.delete({
            where: { id: tokenRecord.id },
          });
          const user = await prisma.user.findUnique({
            where: { email: emailNorm },
          });
          if (!user || (user as { suspended?: boolean }).suspended) return null;
          return {
            id: user.id,
            email: user.email ?? undefined,
            name: user.name ?? null,
            image: user.image ?? null,
            emailVerified: user.emailVerified,
            phone: (user as { phone?: string | null }).phone ?? null,
          };
        }

        if (!password) return null;
        const user = await prisma.user.findUnique({
          where: { email: emailNorm },
        });
        if (!user?.password) throw new AccountNotFoundError();
        if ((user as { suspended?: boolean }).suspended) throw new AccountSuspendedError();
        if (!user.emailVerified) throw new EmailNotVerifiedError();
        const ok = await compare(password, user.password);
        if (!ok) throw new IncorrectPasswordError();
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? null,
          image: user.image ?? null,
          emailVerified: user.emailVerified,
          phone: (user as { phone?: string | null }).phone ?? null,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  events: {
    async signIn({ user }) {
      // Ensure JWT gets fresh user fields (e.g. phone) from DB for OAuth users
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          (user as { phone?: string | null }).phone = (dbUser as { phone?: string | null }).phone ?? null;
        }
      }
    },
  },
});

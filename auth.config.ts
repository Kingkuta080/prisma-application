import type { NextAuthConfig } from "next-auth";

const authConfig = {
  providers: [],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      const t = token as Record<string, unknown>;
      if (user) {
        t.id = user.id;
        t.name = user.name ?? null;
        t.email = user.email ?? null;
        t.image = user.image ?? null;
        t.phone = (user as { phone?: string | null }).phone ?? null;
      }
      if (trigger === "update" && session?.user) {
        t.name = session.user.name ?? t.name;
        t.phone = session.user.phone ?? t.phone;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as Record<string, unknown>;
      if (session.user) {
        session.user.id = String(t.sub ?? t.id ?? "");
        session.user.name = (t.name as string | null | undefined) ?? undefined;
        session.user.email = (t.email as string | null | undefined) ?? "";
        session.user.image = (t.image as string | null | undefined) ?? undefined;
        session.user.phone = (t.phone as string | null | undefined) ?? undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
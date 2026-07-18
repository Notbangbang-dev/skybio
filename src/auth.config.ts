import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import { env } from "@/env";

/**
 * Edge-safe auth config shared by the middleware and the full server instance.
 * Must NOT import the Prisma adapter or any Node-only modules.
 */
export const authConfig = {
  trustHost: true,
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Discord({
      clientId: env.DISCORD_ID,
      clientSecret: env.DISCORD_SECRET,
      authorization: { params: { scope: "identify" } },
    }),
  ],
  callbacks: {
    // Only the owner may reach /admin. Fine-grained ownership is re-checked
    // server-side in requireOwner(); this is the edge gate.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = nextUrl.pathname.startsWith("/admin");
      if (isAdmin && !isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        (session.user as { role?: string }).role =
          (token.role as string) ?? "USER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

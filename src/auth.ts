import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";
import { authConfig } from "@/auth.config";

/**
 * Full server-side auth instance: adds the Prisma adapter and a sign-in event
 * that captures the Discord id and promotes owner accounts to role OWNER.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ user, account }) {
      if (!user.id || account?.provider !== "discord") return;
      try {
        const discordId = account.providerAccountId;
        const isOwner = env.OWNER_DISCORD_IDS.includes(discordId);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            discordId,
            // Promote owners; never silently demote an existing OWNER here.
            ...(isOwner ? { role: "OWNER" } : {}),
          },
        });
      } catch (err) {
        console.error("[auth] signIn event failed:", err);
      }
    },
  },
});

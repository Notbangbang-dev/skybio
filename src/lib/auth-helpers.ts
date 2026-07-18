import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { env } from "@/env";

/** Full DB user for the current session, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

/** Is this user the site owner? (role OWNER, or Discord id in the owner list). */
export function isOwner(user: User | null): boolean {
  if (!user) return false;
  if (user.role === "OWNER") return true;
  return !!user.discordId && env.OWNER_DISCORD_IDS.includes(user.discordId);
}

/** Require the site owner, else redirect. Used to gate /admin. */
export async function requireOwner(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isOwner(user)) redirect("/");
  return user;
}

/** Assert owner inside API routes / server actions (throws instead of redirecting). */
export async function assertOwner(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || !isOwner(user)) {
    throw new Error("Forbidden");
  }
  return user;
}

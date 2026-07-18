import "server-only";
import type { Profile } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Fetch the bio config singleton, creating it on first access. */
export async function getProfile(): Promise<Profile> {
  const existing = await prisma.profile.findUnique({ where: { id: "singleton" } });
  if (existing) return existing;
  return prisma.profile.create({ data: { id: "singleton" } });
}

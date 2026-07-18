"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertOwner } from "@/lib/auth-helpers";
import { clamp } from "@/lib/utils";
import {
  DISPLAY_FONTS,
  BODY_FONTS,
  NAME_EFFECTS,
  AVATAR_STYLES,
  BG_TYPES,
  SOCIAL_PLATFORMS,
} from "@/lib/theme";

type Result = { ok: boolean; error?: string; id?: string };

// ── validators ───────────────────────────────────────────────────────────────
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
function hex(v: unknown, fallback: string): string {
  return typeof v === "string" && HEX.test(v.trim()) ? v.trim() : fallback;
}
function oneOf(v: unknown, list: readonly string[], fallback: string): string {
  return typeof v === "string" && list.includes(v) ? v : fallback;
}
function str(v: unknown, max: number): string {
  return String(v ?? "").slice(0, max);
}
function int(v: unknown, min: number, max: number): number {
  return Math.round(clamp(v, min, max));
}
/** Only allow safe URLs: same-origin paths, http(s), or mailto. Blocks javascript:. */
function safeUrl(v: unknown): string {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (s.startsWith("/")) return s.slice(0, 2000);
  if (/^https?:\/\//i.test(s) || /^mailto:/i.test(s)) return s.slice(0, 2000);
  return "";
}

function revalidateAll() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

// ── Profile ──────────────────────────────────────────────────────────────────

export interface ProfileInput {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  avatarStyle: string;
  avatarSize: number;
  location: string;
  pronouns: string;
  discordEnabled: boolean;
  discordUserId: string;
  discordShowActivity: boolean;
  bgType: string;
  bgUrl: string;
  bgColor: string;
  bgBlur: number;
  bgBrightness: number;
  bgOverlay: number;
  accent: string;
  accent2: string;
  textColor: string;
  displayFont: string;
  bodyFont: string;
  radius: number;
  cardOpacity: number;
  cardBlur: number;
  cardWidth: number;
  overlayColor: string;
  glowBehindCard: boolean;
  effectConfetti: boolean;
  footerText: string;
  nameEffect: string;
  effectParticles: boolean;
  effectStars: boolean;
  effectCursor: boolean;
  effectRain: boolean;
  effectTilt: boolean;
  effectGrain: boolean;
  particleColor: string;
  particleDensity: number;
  splashEnabled: boolean;
  enterText: string;
  musicEnabled: boolean;
  autoplay: boolean;
  volume: number;
  showVisualizer: boolean;
  loopTracks: boolean;
  siteTitle: string;
  metaDescription: string;
  faviconUrl: string;
  embedColor: string;
  showViews: boolean;
  badges: string[];
}

export async function saveProfile(input: ProfileInput): Promise<Result> {
  try {
    await assertOwner();
  } catch {
    return { ok: false, error: "Forbidden" };
  }
  try {
    const data = {
      displayName: str(input.displayName, 60) || "your name",
      username: str(input.username, 40),
      bio: str(input.bio, 1000),
      avatarUrl: safeUrl(input.avatarUrl) || null,
      avatarStyle: oneOf(input.avatarStyle, AVATAR_STYLES, "glow"),
      avatarSize: int(input.avatarSize, 64, 200),
      location: str(input.location, 60),
      pronouns: str(input.pronouns, 40),
      // Discord snowflakes are numeric; strip anything else.
      discordEnabled: Boolean(input.discordEnabled),
      discordUserId: String(input.discordUserId ?? "").replace(/[^0-9]/g, "").slice(0, 24),
      discordShowActivity: Boolean(input.discordShowActivity),
      bgType: oneOf(input.bgType, BG_TYPES, "gradient"),
      bgUrl: safeUrl(input.bgUrl) || null,
      bgColor: hex(input.bgColor, "#05060a"),
      bgBlur: clamp(input.bgBlur, 0, 60),
      bgBrightness: clamp(input.bgBrightness, 0, 200),
      bgOverlay: clamp(input.bgOverlay, 0, 100),
      accent: hex(input.accent, "#8b5cf6"),
      accent2: hex(input.accent2, "#22d3ee"),
      textColor: hex(input.textColor, "#f5f5fb"),
      displayFont: oneOf(input.displayFont, DISPLAY_FONTS, "Unbounded"),
      bodyFont: oneOf(input.bodyFont, BODY_FONTS, "Sora"),
      radius: clamp(input.radius, 0, 60),
      cardOpacity: clamp(input.cardOpacity, 0, 100),
      cardBlur: clamp(input.cardBlur, 0, 60),
      cardWidth: int(input.cardWidth, 320, 640),
      overlayColor: hex(input.overlayColor, "#000000"),
      glowBehindCard: Boolean(input.glowBehindCard),
      effectConfetti: Boolean(input.effectConfetti),
      footerText: str(input.footerText, 120),
      nameEffect: oneOf(input.nameEffect, NAME_EFFECTS, "shine"),
      effectParticles: Boolean(input.effectParticles),
      effectStars: Boolean(input.effectStars),
      effectCursor: Boolean(input.effectCursor),
      effectRain: Boolean(input.effectRain),
      effectTilt: Boolean(input.effectTilt),
      effectGrain: Boolean(input.effectGrain),
      particleColor: hex(input.particleColor, "#8b5cf6"),
      particleDensity: clamp(input.particleDensity, 0, 100),
      splashEnabled: Boolean(input.splashEnabled),
      enterText: str(input.enterText, 60),
      musicEnabled: Boolean(input.musicEnabled),
      autoplay: Boolean(input.autoplay),
      volume: clamp(input.volume, 0, 100),
      showVisualizer: Boolean(input.showVisualizer),
      loopTracks: Boolean(input.loopTracks),
      siteTitle: str(input.siteTitle, 80) || "bio",
      metaDescription: str(input.metaDescription, 300),
      faviconUrl: safeUrl(input.faviconUrl) || null,
      embedColor: hex(input.embedColor, "#8b5cf6"),
      showViews: Boolean(input.showViews),
      badges: (Array.isArray(input.badges) ? input.badges : [])
        .map((b) => str(b, 24))
        .filter(Boolean)
        .slice(0, 12),
    };
    await prisma.profile.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    revalidateAll();
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "Failed to save" };
  }
}

// ── Tracks ───────────────────────────────────────────────────────────────────

export async function addTrack(input: {
  title: string;
  artist: string;
  url: string;
  coverUrl: string;
}): Promise<Result> {
  try {
    await assertOwner();
  } catch {
    return { ok: false, error: "Forbidden" };
  }
  const url = safeUrl(input.url);
  if (!url) return { ok: false, error: "A track needs an audio URL" };
  const count = await prisma.track.count();
  const t = await prisma.track.create({
    data: {
      title: str(input.title, 100) || "Untitled",
      artist: str(input.artist, 100),
      url,
      coverUrl: safeUrl(input.coverUrl) || null,
      sortOrder: count + 1,
    },
  });
  revalidateAll();
  return { ok: true, id: t.id };
}

export async function updateTrack(
  id: string,
  input: { title: string; artist: string; coverUrl: string }
): Promise<Result> {
  try {
    await assertOwner();
  } catch {
    return { ok: false, error: "Forbidden" };
  }
  await prisma.track.update({
    where: { id },
    data: {
      title: str(input.title, 100) || "Untitled",
      artist: str(input.artist, 100),
      coverUrl: safeUrl(input.coverUrl) || null,
    },
  });
  revalidateAll();
  return { ok: true };
}

export async function deleteTrack(id: string): Promise<Result> {
  try {
    await assertOwner();
  } catch {
    return { ok: false, error: "Forbidden" };
  }
  await prisma.track.delete({ where: { id } });
  revalidateAll();
  return { ok: true };
}

// ── Social links ─────────────────────────────────────────────────────────────

export async function addSocial(input: {
  platform: string;
  url: string;
  label: string;
}): Promise<Result> {
  try {
    await assertOwner();
  } catch {
    return { ok: false, error: "Forbidden" };
  }
  const url = safeUrl(input.url);
  if (!url) return { ok: false, error: "Enter a valid URL (https://… or /… )" };
  const count = await prisma.socialLink.count();
  const s = await prisma.socialLink.create({
    data: {
      platform: oneOf(input.platform, SOCIAL_PLATFORMS, "custom"),
      url,
      label: str(input.label, 40),
      sortOrder: count + 1,
    },
  });
  revalidateAll();
  return { ok: true, id: s.id };
}

export async function updateSocial(
  id: string,
  input: { platform: string; url: string; label: string }
): Promise<Result> {
  try {
    await assertOwner();
  } catch {
    return { ok: false, error: "Forbidden" };
  }
  const url = safeUrl(input.url);
  if (!url) return { ok: false, error: "Enter a valid URL" };
  await prisma.socialLink.update({
    where: { id },
    data: {
      platform: oneOf(input.platform, SOCIAL_PLATFORMS, "custom"),
      url,
      label: str(input.label, 40),
    },
  });
  revalidateAll();
  return { ok: true };
}

export async function deleteSocial(id: string): Promise<Result> {
  try {
    await assertOwner();
  } catch {
    return { ok: false, error: "Forbidden" };
  }
  await prisma.socialLink.delete({ where: { id } });
  revalidateAll();
  return { ok: true };
}

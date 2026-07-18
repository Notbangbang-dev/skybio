import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireOwner } from "@/lib/auth-helpers";
import { getProfile } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";
import { AdminConsole } from "@/components/admin/admin-console";
import type { AdminData } from "@/components/admin/admin-console";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · skybio" };

export default async function AdminPage() {
  const owner = await requireOwner();
  const [profile, tracks, socials] = await Promise.all([
    getProfile(),
    prisma.track.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const data: AdminData = {
    profile: {
      displayName: profile.displayName,
      username: profile.username,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl ?? "",
      avatarStyle: profile.avatarStyle,
      avatarSize: profile.avatarSize,
      location: profile.location,
      pronouns: profile.pronouns,
      discordEnabled: profile.discordEnabled,
      discordUserId: profile.discordUserId,
      discordShowActivity: profile.discordShowActivity,
      bgType: profile.bgType,
      bgUrl: profile.bgUrl ?? "",
      bgColor: profile.bgColor,
      bgBlur: profile.bgBlur,
      bgBrightness: profile.bgBrightness,
      bgOverlay: profile.bgOverlay,
      accent: profile.accent,
      accent2: profile.accent2,
      textColor: profile.textColor,
      displayFont: profile.displayFont,
      bodyFont: profile.bodyFont,
      radius: profile.radius,
      cardOpacity: profile.cardOpacity,
      cardBlur: profile.cardBlur,
      cardWidth: profile.cardWidth,
      overlayColor: profile.overlayColor,
      glowBehindCard: profile.glowBehindCard,
      effectConfetti: profile.effectConfetti,
      footerText: profile.footerText,
      nameEffect: profile.nameEffect,
      effectParticles: profile.effectParticles,
      effectStars: profile.effectStars,
      effectCursor: profile.effectCursor,
      effectRain: profile.effectRain,
      effectTilt: profile.effectTilt,
      effectGrain: profile.effectGrain,
      particleColor: profile.particleColor,
      particleDensity: profile.particleDensity,
      splashEnabled: profile.splashEnabled,
      enterText: profile.enterText,
      musicEnabled: profile.musicEnabled,
      autoplay: profile.autoplay,
      volume: profile.volume,
      showVisualizer: profile.showVisualizer,
      loopTracks: profile.loopTracks,
      siteTitle: profile.siteTitle,
      metaDescription: profile.metaDescription,
      faviconUrl: profile.faviconUrl ?? "",
      embedColor: profile.embedColor,
      showViews: profile.showViews,
      badges: profile.badges,
    },
    tracks: tracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      url: t.url,
      coverUrl: t.coverUrl ?? "",
    })),
    socials: socials.map((s) => ({
      id: s.id,
      platform: s.platform,
      url: s.url,
      label: s.label,
    })),
  };

  return (
    <div className="admin-scope">
      <header className="sticky top-0 z-30 border-b border-line bg-panel/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "linear-gradient(135deg,#8b5cf6,#22d3ee)" }}>
              ✦
            </span>
            <div>
              <p className="font-display text-sm font-bold leading-none">skybio admin</p>
              <p className="text-[11px] text-muted">signed in as {owner.name ?? owner.email ?? "owner"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="press inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-panel-2"
            >
              <ExternalLink className="h-4 w-4" /> View bio
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="press inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:bg-panel-2">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <AdminConsole data={data} />
      </main>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/profile";
import { BioExperience } from "@/components/bio/bio-experience";
import type { BioProfile, BioTrack, BioSocial } from "@/components/bio/types";

export const dynamic = "force-dynamic";

export default async function BioPage() {
  const [profile, tracks, socials] = await Promise.all([
    getProfile(),
    prisma.track.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const p: BioProfile = {
    displayName: profile.displayName,
    username: profile.username,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    avatarStyle: profile.avatarStyle,
    avatarSize: profile.avatarSize,
    location: profile.location,
    pronouns: profile.pronouns,
    discordEnabled: profile.discordEnabled,
    discordUserId: profile.discordUserId,
    discordShowActivity: profile.discordShowActivity,
    bgType: profile.bgType,
    bgUrl: profile.bgUrl,
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
    donateEnabled: profile.donateEnabled,
    showViews: profile.showViews,
    views: profile.views,
    badges: profile.badges,
  };

  const t: BioTrack[] = tracks.map((x) => ({
    id: x.id,
    title: x.title,
    artist: x.artist,
    url: x.url,
    coverUrl: x.coverUrl,
  }));

  const s: BioSocial[] = socials.map((x) => ({
    id: x.id,
    platform: x.platform,
    label: x.label,
    url: x.url,
  }));

  return <BioExperience profile={p} tracks={t} socials={s} />;
}

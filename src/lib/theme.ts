import type { Profile } from "@prisma/client";

/**
 * Build the inline CSS custom properties that drive the live bio theme from the
 * owner's Profile. Rendered on the root of the public experience so every
 * component reads var(--accent), var(--radius), etc. Also used by the admin
 * live-preview.
 */
export function themeVars(p: Profile): React.CSSProperties {
  return {
    // colors
    ["--accent" as string]: p.accent,
    ["--accent-2" as string]: p.accent2,
    ["--text-color" as string]: p.textColor,
    ["--bg-color" as string]: p.bgColor,
    ["--particle-color" as string]: p.particleColor,
    // shape / glass
    ["--radius" as string]: `${p.radius}px`,
    ["--card-opacity" as string]: `${p.cardOpacity / 100}`,
    ["--card-blur" as string]: `${p.cardBlur}px`,
    // background treatment
    ["--bg-blur" as string]: `${p.bgBlur}px`,
    ["--bg-brightness" as string]: `${p.bgBrightness / 100}`,
    ["--bg-overlay" as string]: `${p.bgOverlay / 100}`,
    // fonts
    ["--font-display" as string]: `"${p.displayFont}", system-ui, sans-serif`,
    ["--font-body" as string]: `"${p.bodyFont}", system-ui, sans-serif`,
  };
}

/** Google Fonts families we offer in the admin (loaded on demand in layout). */
// All must be available on Google Fonts (loaded in the root layout).
export const DISPLAY_FONTS = [
  "Unbounded",
  "Syne",
  "Space Grotesk",
  "Orbitron",
  "Bricolage Grotesque",
  "Instrument Serif",
  "Sora",
];

export const BODY_FONTS = ["Sora", "Space Grotesk", "Outfit", "Inter", "JetBrains Mono"];

export const NAME_EFFECTS = ["shine", "glitch", "typewriter", "none"] as const;
export const AVATAR_STYLES = ["glow", "ring", "pulse", "plain"] as const;
export const BG_TYPES = ["gradient", "image", "gif", "video", "color"] as const;

export const SOCIAL_PLATFORMS = [
  "discord",
  "github",
  "twitter",
  "instagram",
  "youtube",
  "tiktok",
  "spotify",
  "twitch",
  "telegram",
  "email",
  "website",
  "custom",
] as const;

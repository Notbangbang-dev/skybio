"use client";

import type { BioProfile } from "./types";

/**
 * The fullscreen backdrop: solid color, animated gradient, or user media
 * (image / gif / video). A dark scrim + brightness/blur are applied on top so
 * foreground text stays readable regardless of what the owner uploads.
 */
export function Background({ p }: { p: BioProfile }) {
  const mediaFilter = `brightness(${p.bgBrightness}%) blur(${p.bgBlur}px)`;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[var(--bg-color)]">
      {p.bgType === "video" && p.bgUrl && (
        <video
          className="h-full w-full scale-110 object-cover"
          style={{ filter: mediaFilter }}
          src={p.bgUrl}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {(p.bgType === "image" || p.bgType === "gif") && p.bgUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="h-full w-full scale-110 object-cover"
          style={{ filter: mediaFilter }}
          src={p.bgUrl}
          alt=""
        />
      )}

      {p.bgType === "gradient" && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 120% at 20% 0%, ${p.accent}33, transparent 50%), radial-gradient(120% 120% at 80% 100%, ${p.accent2}33, transparent 50%), ${p.bgColor}`,
            backgroundSize: "200% 200%",
            animation: "gradient-pan 18s ease infinite",
          }}
        />
      )}

      {/* Dark scrim for legibility */}
      <div
        className="absolute inset-0"
        style={{ background: "#000", opacity: p.bgOverlay / 100 }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
}

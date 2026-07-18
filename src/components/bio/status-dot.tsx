"use client";

import { useId } from "react";
import { STATUS_META, type DiscordStatus } from "@/lib/use-lanyard";

/**
 * A Discord-accurate status indicator:
 *   online  → solid filled circle
 *   idle    → crescent moon (circle with an offset circular bite)
 *   dnd     → circle with a horizontal rounded dash cut out
 *   offline → hollow ring (circle with a concentric hole)
 * Shapes are carved with an SVG mask so the "holes" show whatever is behind.
 */
export function StatusDot({ status, size = 16 }: { status: DiscordStatus; size?: number }) {
  const color = STATUS_META[status].color;
  const maskId = "sd-" + useId().replace(/:/g, "");

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden role="img">
      <mask id={maskId}>
        {/* white = visible, black = cut out */}
        <circle cx="12" cy="12" r="12" fill="white" />
        {status === "idle" && <circle cx="7" cy="7" r="11" fill="black" />}
        {status === "dnd" && <rect x="5" y="10.5" width="14" height="3" rx="1.5" fill="black" />}
        {status === "offline" && <circle cx="12" cy="12" r="5" fill="black" />}
      </mask>
      <circle cx="12" cy="12" r="12" fill={color} mask={`url(#${maskId})`} />
    </svg>
  );
}

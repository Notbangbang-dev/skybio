"use client";

import { useState } from "react";
import type { BioProfile } from "./types";

/** Fullscreen "click to enter" gate. Clicking anywhere fades it out and calls
 *  onEnter() (which starts audio + counts the view). */
export function Splash({ p, onEnter }: { p: BioProfile; onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false);

  function enter() {
    if (leaving) return;
    setLeaving(true);
    // Let the fade play, then hand control to the page.
    setTimeout(onEnter, 520);
  }

  return (
    <button
      onClick={enter}
      className="fixed inset-0 z-[60] grid cursor-pointer place-items-center transition-opacity duration-500"
      style={{
        opacity: leaving ? 0 : 1,
        background: "rgba(3,4,8,0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
      aria-label="Enter"
    >
      <div className="flex flex-col items-center gap-6">
        {/* pulsing orb */}
        <span className="relative grid h-24 w-24 place-items-center">
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--accent)", opacity: 0.3, animation: "glow-pulse 2.4s ease-in-out infinite" }}
          />
          <span
            className="absolute inset-2 rounded-full"
            style={{ border: "1px solid color-mix(in srgb, var(--text-color) 30%, transparent)" }}
          />
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: "var(--text-color)", boxShadow: "0 0 24px var(--accent)" }}
          />
        </span>
        <p
          className="font-display text-lg font-semibold uppercase tracking-[0.35em] text-shine"
          style={{ animation: "float-y 3s ease-in-out infinite" }}
        >
          {p.enterText || "click to enter"}
        </p>
      </div>
    </button>
  );
}

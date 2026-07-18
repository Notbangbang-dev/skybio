"use client";

import type { BioProfile } from "./types";

/** Slow-drifting accent glow blobs layered over the backdrop for depth. */
export function Aurora({ p }: { p: BioProfile }) {
  return (
    <div className="aurora-layer">
      <div
        className="aurora-blob"
        style={{
          width: "48vmax",
          height: "48vmax",
          top: "-10%",
          left: "-5%",
          background: p.accent,
          animationDuration: "26s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: "42vmax",
          height: "42vmax",
          bottom: "-15%",
          right: "-8%",
          background: p.accent2,
          animationDuration: "32s",
          animationDirection: "reverse",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: "30vmax",
          height: "30vmax",
          top: "40%",
          left: "55%",
          background: p.accent,
          opacity: 0.5,
          animationDuration: "38s",
        }}
      />
    </div>
  );
}

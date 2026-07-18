"use client";

import { useEffect, useRef, useState } from "react";
import { Background } from "./background";
import { Aurora } from "./aurora";
import { Particles } from "./particles";
import { CursorTrail } from "./cursor-trail";
import { Splash } from "./splash";
import { ProfileCard } from "./profile-card";
import { AudioPlayer } from "./audio-player";
import type { BioProfile, BioTrack, BioSocial } from "./types";

function themeStyle(p: BioProfile): React.CSSProperties {
  return {
    ["--accent" as string]: p.accent,
    ["--accent-2" as string]: p.accent2,
    ["--text-color" as string]: p.textColor,
    ["--bg-color" as string]: p.bgColor,
    ["--particle-color" as string]: p.particleColor,
    ["--radius" as string]: `${p.radius}px`,
    ["--card-opacity" as string]: `${p.cardOpacity / 100}`,
    ["--card-blur" as string]: `${p.cardBlur}px`,
    ["--font-display" as string]: `"${p.displayFont}", system-ui, sans-serif`,
    ["--font-body" as string]: `"${p.bodyFont}", system-ui, sans-serif`,
  };
}

export function BioExperience({
  profile,
  tracks,
  socials,
}: {
  profile: BioProfile;
  tracks: BioTrack[];
  socials: BioSocial[];
}) {
  const p = profile;
  const [entered, setEntered] = useState(!p.splashEnabled);
  const [views, setViews] = useState(p.views);
  const pinged = useRef(false);

  function handleEnter() {
    setEntered(true);
  }

  // Count the view once, after entering (so splash bounces don't inflate it).
  useEffect(() => {
    if (!entered || pinged.current) return;
    pinged.current = true;
    fetch("/api/view", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.views === "number") setViews(d.views);
      })
      .catch(() => {});
  }, [entered]);

  return (
    <main
      className="relative min-h-screen w-full font-sans"
      style={{ ...themeStyle(p), color: "var(--text-color)" }}
    >
      <Background p={p} />
      <Aurora p={p} />
      <Particles
        color={p.particleColor}
        density={p.particleDensity}
        stars={p.effectStars}
        particles={p.effectParticles}
        rain={p.effectRain}
      />
      {p.effectCursor && <CursorTrail color={p.accent} />}
      {p.effectGrain && <div className="grain-overlay" aria-hidden />}

      {/* Center stage */}
      <div className="relative z-10 grid min-h-screen place-items-center px-4 py-16">
        <ProfileCard p={p} socials={socials} views={views} />
      </div>

      {entered && <AudioPlayer tracks={tracks} p={p} active={entered} />}

      {!entered && p.splashEnabled && <Splash p={p} onEnter={handleEnter} />}
    </main>
  );
}

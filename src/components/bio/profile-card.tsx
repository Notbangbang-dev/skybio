"use client";

import { useRef } from "react";
import { Eye, MapPin } from "lucide-react";
import { NameEffect } from "./name-effect";
import { SocialLinks } from "./social-links";
import type { BioProfile, BioSocial } from "./types";

/** The centerpiece: glass card with a glowing avatar, animated name, bio,
 *  badges, socials, and (optionally) view count. Tilts toward the cursor. */
export function ProfileCard({
  p,
  socials,
  views,
}: {
  p: BioProfile;
  socials: BioSocial[];
  views: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    if (!p.effectTilt) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="glass conic-border animate-scale-in relative w-full max-w-md rounded-[var(--radius)] p-8 transition-transform duration-200 ease-out will-change-transform"
    >
      <div className="stagger flex flex-col items-center text-center">
        {/* Avatar */}
        <Avatar p={p} />

        {/* Name */}
        <div className="mt-5">
          <NameEffect name={p.displayName} effect={p.nameEffect} />
        </div>

        {/* handle / pronouns / location */}
        <div
          className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-sm"
          style={{ color: "color-mix(in srgb, var(--text-color) 60%, transparent)" }}
        >
          {p.username && <span>@{p.username}</span>}
          {p.pronouns && <span>· {p.pronouns}</span>}
          {p.location && (
            <span className="inline-flex items-center gap-1">
              · <MapPin className="h-3 w-3" /> {p.location}
            </span>
          )}
        </div>

        {/* Badges */}
        {p.badges.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {p.badges.map((b) => (
              <span
                key={b}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide"
                style={{
                  background: "color-mix(in srgb, var(--accent) 18%, transparent)",
                  color: "var(--text-color)",
                  border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {p.bio && (
          <p
            className="mt-4 max-w-sm whitespace-pre-line text-[15px] leading-relaxed"
            style={{ color: "color-mix(in srgb, var(--text-color) 82%, transparent)" }}
          >
            {p.bio}
          </p>
        )}

        {/* Socials */}
        <div className="mt-6">
          <SocialLinks socials={socials} />
        </div>

        {/* Views */}
        {p.showViews && (
          <div
            className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs"
            style={{ color: "color-mix(in srgb, var(--text-color) 55%, transparent)" }}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="tabular-nums">{views.toLocaleString()}</span> views
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ p }: { p: BioProfile }) {
  const style = p.avatarStyle;
  return (
    <div className="relative grid h-28 w-28 place-items-center">
      {/* rotating gradient ring */}
      {(style === "ring" || style === "glow") && (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, var(--accent), var(--accent-2), var(--accent))`,
            animation: "ring-rotate 4s linear infinite",
            padding: 3,
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
          }}
          aria-hidden
        />
      )}
      {/* glow halo */}
      {(style === "glow" || style === "pulse") && (
        <span
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            background: "var(--accent)",
            opacity: 0.55,
            animation: style === "pulse" ? "glow-pulse 2.6s ease-in-out infinite" : undefined,
          }}
          aria-hidden
        />
      )}
      {/* avatar image */}
      <span
        className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full"
        style={{ border: "2px solid color-mix(in srgb, var(--text-color) 18%, transparent)" }}
      >
        {p.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatarUrl} alt={p.displayName} className="h-full w-full object-cover" />
        ) : (
          <span
            className="font-display text-3xl font-bold"
            style={{ color: "var(--text-color)" }}
          >
            {(p.displayName || "?").slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>
    </div>
  );
}

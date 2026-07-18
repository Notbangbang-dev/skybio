"use client";

import { useRef } from "react";
import { Eye, MapPin } from "lucide-react";
import { NameEffect } from "./name-effect";
import { SocialLinks } from "./social-links";
import { DiscordActivity } from "./discord-activity";
import { useLanyard, STATUS_META } from "@/lib/use-lanyard";
import type { BioProfile, BioSocial } from "./types";

/** The centerpiece: glass card with a glowing avatar (+ live Discord status),
 *  animated name, bio, badges, socials, activity, and view count. Tilts. */
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
  const presence = useLanyard(p.discordUserId, p.discordEnabled);

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
      className="glass animate-scale-in relative w-full rounded-[var(--radius)] p-8 transition-transform duration-200 ease-out will-change-transform"
      style={{
        maxWidth: p.cardWidth,
        borderColor: "color-mix(in srgb, var(--accent) 28%, transparent)",
      }}
    >
      <div className="stagger flex flex-col items-center text-center">
        {/* Avatar + live status dot */}
        <Avatar p={p} status={p.discordEnabled ? presence?.status ?? "offline" : null} />

        {/* Name */}
        <div className="mt-5">
          <NameEffect name={p.displayName} effect={p.nameEffect} />
        </div>

        {/* handle / pronouns / location / status label */}
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
          {p.discordEnabled && presence && (
            <span className="inline-flex items-center gap-1.5">
              ·
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: STATUS_META[presence.status].color }}
              />
              {STATUS_META[presence.status].label}
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

        {/* Live Discord activity */}
        {p.discordEnabled && p.discordShowActivity && presence && (
          <div className="mt-4 w-full">
            <DiscordActivity presence={presence} />
          </div>
        )}

        {/* Socials */}
        <div className="mt-6">
          <SocialLinks socials={socials} />
        </div>

        {/* Views + footer */}
        {(p.showViews || p.footerText) && (
          <div className="mt-6 flex flex-col items-center gap-1.5">
            {p.showViews && (
              <div
                className="inline-flex items-center gap-1.5 font-mono text-xs"
                style={{ color: "color-mix(in srgb, var(--text-color) 55%, transparent)" }}
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="tabular-nums">{views.toLocaleString()}</span> views
              </div>
            )}
            {p.footerText && (
              <p className="text-xs" style={{ color: "color-mix(in srgb, var(--text-color) 45%, transparent)" }}>
                {p.footerText}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ p, status }: { p: BioProfile; status: string | null }) {
  const style = p.avatarStyle;
  const size = p.avatarSize;
  const inner = Math.round(size * 0.86);
  const dot = Math.max(12, Math.round(size * 0.16));
  const statusColor =
    status && status in STATUS_META
      ? STATUS_META[status as keyof typeof STATUS_META].color
      : null;

  return (
    <div className="relative grid place-items-center" style={{ height: size, width: size }}>
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
        className="relative grid place-items-center overflow-hidden rounded-full"
        style={{
          height: inner,
          width: inner,
          border: "2px solid color-mix(in srgb, var(--text-color) 18%, transparent)",
        }}
      >
        {p.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatarUrl} alt={p.displayName} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display font-bold" style={{ color: "var(--text-color)", fontSize: size * 0.3 }}>
            {(p.displayName || "?").slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>

      {/* live status dot */}
      {statusColor && (
        <span
          className="absolute rounded-full"
          style={{
            height: dot,
            width: dot,
            right: "6%",
            bottom: "6%",
            background: statusColor,
            border: "3px solid var(--bg-color)",
            boxShadow: `0 0 10px ${statusColor}`,
          }}
          title={status ?? undefined}
          aria-label={`Discord: ${status}`}
        />
      )}
    </div>
  );
}

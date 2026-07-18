"use client";

import { Music2, Gamepad2 } from "lucide-react";
import type { LanyardPresence } from "@/lib/use-lanyard";

/** A small glass chip showing what the owner is currently doing on Discord:
 *  Spotify (with album art), a game/app being played, or a custom status. */
export function DiscordActivity({ presence }: { presence: LanyardPresence }) {
  const { spotify, playing, customStatus } = presence;

  if (spotify) {
    return (
      <Chip>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={spotify.albumArt} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 text-left">
          <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: "#1db954" }}>
            <Music2 className="h-3 w-3" /> Listening to Spotify
          </div>
          <div className="truncate text-sm font-semibold" style={{ color: "var(--text-color)" }}>
            {spotify.song}
          </div>
          <div className="truncate text-xs" style={{ color: "color-mix(in srgb, var(--text-color) 55%, transparent)" }}>
            by {spotify.artist}
          </div>
        </div>
      </Chip>
    );
  }

  if (playing) {
    return (
      <Chip>
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md"
          style={{ background: "color-mix(in srgb, var(--accent) 20%, transparent)" }}
        >
          <Gamepad2 className="h-4 w-4" style={{ color: "var(--accent)" }} />
        </span>
        <div className="min-w-0 text-left">
          <div className="text-[11px] font-medium" style={{ color: "color-mix(in srgb, var(--text-color) 55%, transparent)" }}>
            Playing
          </div>
          <div className="truncate text-sm font-semibold" style={{ color: "var(--text-color)" }}>
            {playing.name}
          </div>
          {playing.details && (
            <div className="truncate text-xs" style={{ color: "color-mix(in srgb, var(--text-color) 55%, transparent)" }}>
              {playing.details}
            </div>
          )}
        </div>
      </Chip>
    );
  }

  if (customStatus && (customStatus.text || customStatus.emoji)) {
    return (
      <Chip>
        <span className="text-lg">{customStatus.emoji ?? "💬"}</span>
        <span className="truncate text-sm" style={{ color: "color-mix(in srgb, var(--text-color) 85%, transparent)" }}>
          {customStatus.text}
        </span>
      </Chip>
    );
  }

  return null;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto flex max-w-full items-center gap-2.5 rounded-xl px-3 py-2"
      style={{
        background: "color-mix(in srgb, var(--text-color) 6%, transparent)",
        border: "1px solid color-mix(in srgb, var(--text-color) 12%, transparent)",
      }}
    >
      {children}
    </div>
  );
}

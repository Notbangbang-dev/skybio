"use client";

import { useEffect, useState } from "react";

export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export interface LanyardPresence {
  status: DiscordStatus;
  customStatus?: { text: string; emoji: string | null };
  playing?: { name: string; details?: string; state?: string };
  spotify?: { song: string; artist: string; albumArt: string } | null;
}

/** Human label + dot color for a Discord status. */
export const STATUS_META: Record<DiscordStatus, { label: string; color: string }> = {
  online: { label: "Online", color: "#43b581" },
  idle: { label: "Idle", color: "#faa61a" },
  dnd: { label: "Do Not Disturb", color: "#f04747" },
  offline: { label: "Offline", color: "#747f8d" },
};

/**
 * Poll a user's live Discord presence from Lanyard (api.lanyard.rest). The user
 * must have joined the Lanyard Discord (discord.gg/lanyard) to be tracked.
 * Returns null until the first successful fetch (or if disabled).
 */
export function useLanyard(id: string, enabled: boolean): LanyardPresence | null {
  const [data, setData] = useState<LanyardPresence | null>(null);

  useEffect(() => {
    if (!enabled || !id) {
      setData(null);
      return;
    }
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!alive || !json?.success || !json.data) return;
        const d = json.data;
        const acts: Array<Record<string, any>> = Array.isArray(d.activities) ? d.activities : [];
        const custom = acts.find((a) => a.type === 4);
        const game = acts.find((a) => a.type === 0);
        setData({
          status: (d.discord_status as DiscordStatus) ?? "offline",
          customStatus: custom
            ? { text: custom.state ?? "", emoji: custom.emoji?.name ?? null }
            : undefined,
          playing: game
            ? { name: game.name, details: game.details, state: game.state }
            : undefined,
          spotify:
            d.listening_to_spotify && d.spotify
              ? {
                  song: d.spotify.song,
                  artist: d.spotify.artist,
                  albumArt: d.spotify.album_art_url,
                }
              : null,
        });
      } catch {
        /* transient — keep the last value */
      }
    }

    load();
    const iv = setInterval(load, 20_000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [id, enabled]);

  return data;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music2 } from "lucide-react";
import type { BioProfile, BioTrack } from "./types";

export function AudioPlayer({
  tracks,
  p,
  active,
}: {
  tracks: BioTrack[];
  p: BioProfile;
  active: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const startedRef = useRef(false);

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(Math.min(1, Math.max(0, p.volume / 100)));

  const track = tracks[i];

  // Build the Web Audio graph once (needed for the visualizer). Must run after a
  // user gesture, so we call it from play().
  const ensureGraph = useCallback(() => {
    if (startedRef.current || !audioRef.current) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaElementSource(audioRef.current);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      startedRef.current = true;
    } catch {
      /* visualizer unavailable — audio still plays */
    }
  }, []);

  const play = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    ensureGraph();
    try {
      await ctxRef.current?.resume();
      await a.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [ensureGraph]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const next = useCallback(() => {
    setI((v) => (tracks.length ? (v + 1) % tracks.length : 0));
  }, [tracks.length]);
  const prev = useCallback(() => {
    setI((v) => (tracks.length ? (v - 1 + tracks.length) % tracks.length : 0));
  }, [tracks.length]);

  // Volume / mute.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : vol;
  }, [vol, muted]);

  // When the track index changes, load it and keep playing if we were playing.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    a.src = track.url;
    a.load();
    if (playing) void play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  // Autoplay after the visitor enters (a user gesture, so it's allowed).
  useEffect(() => {
    if (active && p.autoplay && p.musicEnabled && tracks.length && !playing) {
      void play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Visualizer render loop.
  useEffect(() => {
    if (!p.showVisualizer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cctx = canvas.getContext("2d");
    if (!cctx) return;
    const bars = 28;
    const data = new Uint8Array(64);

    const draw = () => {
      const analyser = analyserRef.current;
      const w = (canvas.width = canvas.clientWidth * 2);
      const h = (canvas.height = canvas.clientHeight * 2);
      cctx.clearRect(0, 0, w, h);
      if (analyser) analyser.getByteFrequencyData(data);
      const bw = w / bars;
      for (let b = 0; b < bars; b++) {
        const v = analyser ? data[b + 2] / 255 : (playing ? 0.15 + 0.1 * Math.sin(b) : 0.05);
        const bh = Math.max(2, v * h);
        cctx.fillStyle = b % 2 ? p.accent2 : p.accent;
        cctx.globalAlpha = 0.85;
        cctx.fillRect(b * bw + bw * 0.2, h - bh, bw * 0.6, bh);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [p.showVisualizer, p.accent, p.accent2, playing]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  if (!p.musicEnabled || tracks.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3 sm:bottom-5 sm:px-4">
      <div
        className="glass animate-fade-up flex w-full max-w-md items-center gap-3 rounded-2xl p-2.5 pr-4"
        style={{ animationDelay: "0.5s" }}
      >
        <audio
          ref={audioRef}
          onEnded={() => {
            if (tracks.length > 1 || p.loopTracks) next();
            else setPlaying(false);
          }}
          preload="none"
        />

        {/* cover / icon */}
        <div
          className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl"
          style={{ background: "color-mix(in srgb, var(--text-color) 8%, transparent)" }}
        >
          {track?.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Music2 className="h-5 w-5" style={{ color: "var(--accent)" }} />
          )}
        </div>

        {/* title + visualizer */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold" style={{ color: "var(--text-color)" }}>
            {track?.title ?? "—"}
          </div>
          {track?.artist ? (
            <div
              className="truncate text-xs"
              style={{ color: "color-mix(in srgb, var(--text-color) 55%, transparent)" }}
            >
              {track.artist}
            </div>
          ) : null}
          {p.showVisualizer && (
            <canvas ref={canvasRef} className="mt-1 h-4 w-full" aria-hidden />
          )}
        </div>

        {/* controls */}
        <div className="flex items-center gap-1" style={{ color: "var(--text-color)" }}>
          {tracks.length > 1 && (
            <button onClick={prev} className="press grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10" aria-label="Previous">
              <SkipBack className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => (playing ? pause() : play())}
            className="press grid h-9 w-9 place-items-center rounded-full"
            style={{ background: "var(--accent)", color: "#fff" }}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          {tracks.length > 1 && (
            <button onClick={next} className="press grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10" aria-label="Next">
              <SkipForward className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => setMuted((m) => !m)} className="press grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10" aria-label="Mute">
            {muted || vol === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round((muted ? 0 : vol) * 100)}
            onChange={(e) => {
              setMuted(false);
              setVol(Number(e.target.value) / 100);
            }}
            className="hidden h-1 w-16 cursor-pointer accent-[var(--accent)] sm:block"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

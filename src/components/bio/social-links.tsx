"use client";

import { useRef } from "react";
import { platformIcon } from "./icons";
import type { BioSocial } from "./types";

/** Magnetic social icon buttons — the icon nudges toward the cursor on hover. */
export function SocialLinks({ socials }: { socials: BioSocial[] }) {
  if (socials.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {socials.map((s) => (
        <MagneticIcon key={s.id} social={s} />
      ))}
    </div>
  );
}

function MagneticIcon({ social }: { social: BioSocial }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const Icon = platformIcon(social.platform);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  }

  const href =
    social.platform === "email" && !/^mailto:/.test(social.url)
      ? `mailto:${social.url}`
      : social.url;

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      title={social.label || social.platform}
      className="group relative grid h-12 w-12 place-items-center rounded-2xl transition-[transform,background,box-shadow] duration-200 ease-out will-change-transform"
      style={{
        background: "color-mix(in srgb, var(--text-color) 8%, transparent)",
        border: "1px solid color-mix(in srgb, var(--text-color) 14%, transparent)",
      }}
    >
      <span
        className="absolute inset-0 rounded-2xl opacity-0 blur-md transition-opacity duration-200 group-hover:opacity-70"
        style={{ background: "var(--accent)" }}
        aria-hidden
      />
      <Icon
        className="relative h-5 w-5 transition-colors"
        style={{ color: "var(--text-color)" }}
      />
    </a>
  );
}

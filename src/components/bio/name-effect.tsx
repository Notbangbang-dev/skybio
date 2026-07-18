"use client";

import { useEffect, useState } from "react";

/** Renders the display name with the owner-selected effect. */
export function NameEffect({ name, effect }: { name: string; effect: string }) {
  const base = "font-display text-4xl font-extrabold tracking-tight sm:text-5xl";

  if (effect === "glitch") {
    return (
      <h1 className={`glitch ${base}`} data-text={name}>
        {name}
      </h1>
    );
  }
  if (effect === "typewriter") {
    return <Typewriter name={name} className={`caret ${base}`} />;
  }
  if (effect === "none") {
    return <h1 className={base} style={{ color: "var(--text-color)" }}>{name}</h1>;
  }
  // default: shine
  return <h1 className={`text-shine ${base}`}>{name}</h1>;
}

function Typewriter({ name, className }: { name: string; className: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= name.length) clearInterval(id);
    }, 90);
    return () => clearInterval(id);
  }, [name]);
  return (
    <h1 className={className} style={{ color: "var(--text-color)", minHeight: "1.2em" }}>
      {name.slice(0, n)}
    </h1>
  );
}

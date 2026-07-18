/**
 * Centralized, lazily-validated environment access. We avoid throwing at import
 * time so the app can still boot for setup screens, but AUTH_SECRET fails closed
 * at real production runtime.
 */

function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

function boolEnv(name: string): boolean {
  return (optional(name) ?? "").toLowerCase() === "true";
}

const DEV_AUTH_SECRET = "dev-insecure-secret-change-me";

function resolveAuthSecret(): string {
  const v = optional("AUTH_SECRET");
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const isProd = process.env.NODE_ENV === "production";
  if (v && v !== DEV_AUTH_SECRET) return v;
  if (isProd && !isBuild) {
    throw new Error(
      "AUTH_SECRET must be set to a strong random value in production " +
        "(generate one with `openssl rand -base64 32`)."
    );
  }
  return v || DEV_AUTH_SECRET;
}

// Discord user id(s) that own this bio (the only accounts that can open /admin).
// Read from BOOTSTRAP_ADMIN_DISCORD_IDS; a built-in default is included and can
// be cleared by setting DEFAULT_OWNER_DISCORD_IDS="" .
const DEFAULT_OWNER_DISCORD_IDS = (() => {
  const override = optional("DEFAULT_OWNER_DISCORD_IDS");
  if (override !== undefined) {
    return override.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return ["1226241151065919548"];
})();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",

  AUTH_SECRET: resolveAuthSecret(),
  AUTH_URL: optional("AUTH_URL") ?? optional("NEXTAUTH_URL"),

  DISCORD_ID: optional("AUTH_DISCORD_ID") ?? optional("DISCORD_CLIENT_ID"),
  DISCORD_SECRET: optional("AUTH_DISCORD_SECRET") ?? optional("DISCORD_CLIENT_SECRET"),

  APP_URL:
    optional("NEXT_PUBLIC_APP_URL") ??
    optional("AUTH_URL") ??
    "http://localhost:3000",

  OWNER_DISCORD_IDS: Array.from(
    new Set([
      ...DEFAULT_OWNER_DISCORD_IDS,
      ...(optional("BOOTSTRAP_ADMIN_DISCORD_IDS") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ])
  ),

  UPLOAD_DIR: optional("UPLOAD_DIR") ?? "uploads",
  MAX_UPLOAD_MB: (() => {
    const n = Number(optional("MAX_UPLOAD_MB") ?? "100");
    return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : 100;
  })(),

  TRUST_CLOUDFLARE: boolEnv("TRUST_CLOUDFLARE"),
};

export const isDiscordConfigured = Boolean(env.DISCORD_ID && env.DISCORD_SECRET);

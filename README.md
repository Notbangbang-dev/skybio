# skybio ✦

An insanely customizable **single-owner bio site** — a `guns.lol`-style link/profile
page where **you control everything from a Discord-gated admin console**: the
background (image / GIF / video), the music, every piece of text, colors, fonts,
effects, your avatar, socials, and link-embed metadata. Built to deploy on your
own VPS with the same one-command Docker + nginx + Let's Encrypt flow.

> One page. Infinite vibes. Edit it live at `/admin`.

---

## ✨ What you can customize (all from `/admin`)

- **Background** — upload an image, GIF, or video, or use an animated gradient /
  solid color. Control brightness, blur, and a darkening overlay for legibility.
- **Music** — upload multiple tracks; a floating player with a **live Web-Audio
  visualizer**, autoplay-on-enter, volume, and loop.
- **Identity** — avatar (with glow / rotating-ring / pulse styles), display name,
  handle, pronouns, location, a multi-line bio, and badges.
- **Look** — accent colors, text color, base color, display + body fonts (7
  distinctive Google fonts), corner radius, and the glass card's opacity + blur.
- **Name effect** — shine, glitch, typewriter, or plain.
- **Effects** — twinkling stars, floating particles, rain, cursor trail, 3D card
  tilt, film grain — each toggleable, with a particle color + density.
- **Splash** — an optional "click to enter" gate (also unlocks autoplay audio).
- **Socials** — add/remove links shown as **magnetic** icons (Discord, GitHub,
  Twitter/X, Instagram, YouTube, TikTok, Spotify, Twitch, Telegram, email, website,
  or custom).
- **Meta / embeds** — page title, link-preview description, theme/embed color,
  favicon, and a view counter.

Only the **owner** (your Discord account) can open `/admin`. Visitors just see the
bio — no login required.

---

## 🧱 Tech stack

| Area       | Choice                                             |
| ---------- | -------------------------------------------------- |
| Framework  | Next.js 15 (App Router) + React 19 + TypeScript    |
| Styling    | Tailwind CSS + a CSS-variable theme engine         |
| Auth       | Auth.js v5 (NextAuth) — Discord OAuth              |
| Database   | PostgreSQL via Prisma                              |
| Media      | Local uploads on a Docker volume, range-served     |
| Animations | Pure CSS keyframes + `<canvas>` + Web Audio API    |

No heavy animation libraries — every effect is hand-built CSS/canvas so it stays
smooth and light.

---

## 🚀 Deploy on your VPS (one command)

Fresh Ubuntu 22.04 / 24.04 box with a domain pointed at it:

```bash
git clone <your-fork-url> skybio && cd skybio
sudo ./install.sh          # installs Docker + firewall, creates .env, generates secrets
nano .env                  # set DOMAIN, LETSENCRYPT_EMAIL, Discord creds,
                           #   and BOOTSTRAP_ADMIN_DISCORD_IDS = YOUR Discord user id
sudo ./install.sh          # builds, starts, migrates/seeds, issues HTTPS certs
```

Then sign in at `https://<domain>/login` with your Discord account and customize
everything at `https://<domain>/admin`.

**Update any time:** `sudo ./redeploy.sh` (pulls, rebuilds, re-applies HTTPS;
migrations run automatically on boot).

Full guide + the manual `docker compose` flow: **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Discord setup
Create an app at <https://discord.com/developers/applications> → OAuth2 → add the
redirect `https://<domain>/api/auth/callback/discord`. Put the client id/secret in
`.env`. Get your own user id with Developer Mode → right-click your name → Copy
User ID, and set it as `BOOTSTRAP_ADMIN_DISCORD_IDS`.

---

## 🧑‍💻 Local development

```bash
npm install
cp .env.example .env        # set DATABASE_URL, AUTH_SECRET, Discord creds, your owner id
npm run db:push             # create tables
npm run db:seed             # create the profile singleton
npm run dev                 # http://localhost:3000  (admin at /admin)
```

---

## 🔐 Security notes

- `/admin`, all mutations, and uploads are gated to the owner (Discord id allowlist
  → `OWNER` role, re-checked server-side on every write).
- Uploads are validated by extension **and magic bytes**, size-capped
  (`MAX_UPLOAD_MB`), stored with random names, and served read-only with a
  path-traversal guard + HTTP range support (so video/audio seek).
- Owner-supplied URLs are sanitized (only `https?:`, `mailto:`, or same-origin
  `/paths` — never `javascript:`); colors, fonts, and enums are allow-listed
  before they touch CSS.

---

## 🗂️ Structure

```
prisma/                 schema (Profile singleton + Track + SocialLink + Auth.js) + migration + seed
src/
  auth.ts, middleware   Auth.js v5 (Discord) + owner promotion + edge gate
  lib/                  prisma, profile, uploads (validate/serve), theme, auth-helpers
  actions/profile.ts    owner-gated, validated save + track/social CRUD
  app/
    page.tsx            the public bio (renders BioExperience)
    admin/              the owner console
    login/              Discord sign-in
    api/                uploads (serve + receive), view counter, health, auth
  components/
    bio/                background, aurora, particles, cursor-trail, splash,
                        profile-card, name-effect, social-links, audio-player
    admin/              admin-console (tabbed editor)
```

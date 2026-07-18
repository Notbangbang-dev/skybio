# Deploying skybio

A Docker Compose stack: **postgres + the Next.js app + nginx + certbot**. The app
serves the public bio and the owner admin; nginx terminates TLS and proxies to it.

---

## Quick start (one command)

On a fresh Ubuntu 22.04 / 24.04 server with a domain's A record pointed at it:

```bash
cd /opt && git clone <your-fork-url> skybio
cd skybio
sudo ./install.sh     # installs Docker + firewall, creates .env, generates secrets
nano .env             # set DOMAIN, LETSENCRYPT_EMAIL, Discord creds, owner id
sudo ./install.sh     # builds, starts, migrates/seeds, and issues HTTPS certs
```

Update later with `sudo ./redeploy.sh`.

---

## 1. Prerequisites

- An Ubuntu 22.04 / 24.04 server (1 vCPU / 1–2 GB is plenty).
- A domain name you control.
- A Discord application for OAuth (client id + secret).
- Your own Discord user id (the site owner).
- Root / sudo access.

## 2. DNS

Create an **A record** for your domain pointing at the server's public IPv4
(add an `AAAA` for IPv6 if you use it). Wait for it to propagate
(`dig +short <domain>`).

## 3. Bootstrap the box

```bash
sudo ./scripts/setup-vps.sh   # Docker + compose + ufw (22/80/443) + data dirs + .env
# log out/in (or `newgrp docker`) so docker works without sudo
```

## 4. Configure `.env`

`cp .env.docker.example .env` (install.sh does this for you) and fill in:

| Key                            | What to put                                              |
| ------------------------------ | ------------------------------------------------------- |
| `POSTGRES_PASSWORD`            | a strong random password                                |
| `DOMAIN`                       | your domain, no scheme (e.g. `bio.example.com`)         |
| `LETSENCRYPT_EMAIL`            | email for cert expiry notices                           |
| `AUTH_SECRET`                  | `openssl rand -base64 32`                               |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | `https://<DOMAIN>`                                  |
| `AUTH_DISCORD_ID` / `_SECRET`  | Discord OAuth credentials                               |
| `BOOTSTRAP_ADMIN_DISCORD_IDS`  | **your** Discord user id (comma-separated for several)  |
| `MAX_UPLOAD_MB`                | max single upload size (default 100)                    |

**Discord redirect:** `https://<DOMAIN>/api/auth/callback/discord`.

## 5. Launch + TLS

```bash
docker compose up -d
./init-letsencrypt.sh
curl -fsS https://<DOMAIN>/api/health   # {"ok":true,"service":"skybio"}
```

nginx boots HTTP-only first (always succeeds), certbot issues the cert, then the
HTTPS config is swapped in. Renewal is automatic (certbot renews; nginx reloads
every 6h).

## 6. Use it

Open `https://<DOMAIN>/login`, sign in with the owner Discord account, then
customize everything at `https://<DOMAIN>/admin`.

---

## Updating

```bash
sudo ./redeploy.sh
```

Pulls latest, rebuilds the app image, restarts it (Prisma `migrate deploy` runs
on boot), and re-applies HTTPS. Data volumes (postgres, uploads, certs) are never
touched.

## Backups

Everything that matters lives in two Docker volumes:

```bash
# database
docker compose exec -T db pg_dump -U postgres skybio > backup-$(date +%F).sql
# uploaded media
docker run --rm -v skybio_uploads:/u -v "$PWD":/b alpine tar czf /b/uploads-$(date +%F).tgz -C /u .
```

## Behind Cloudflare (optional)

Set `TRUST_CLOUDFLARE=true`, uncomment the `real_ip` block in the nginx config,
and firewall the origin to Cloudflare's IP ranges.

## Notes

- Big backgrounds/music: nginx `client_max_body_size` is 150m and the app's
  `MAX_UPLOAD_MB` caps individual files — keep them in sync.
- The bio page and admin are server-rendered on demand (they read the DB live), so
  edits appear immediately after you save.
```

#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  install.sh — one-command install for a fresh Ubuntu 22.04 / 24.04 VPS.
#
#  Run it twice:
#    1) sudo ./install.sh   → installs Docker + firewall, creates .env,
#                             auto-generates AUTH_SECRET + POSTGRES_PASSWORD,
#                             then stops so you can fill in the rest.
#    2) (edit .env: DOMAIN, LETSENCRYPT_EMAIL, AUTH_DISCORD_ID/SECRET,
#        BOOTSTRAP_ADMIN_DISCORD_IDS)  then  sudo ./install.sh again
#                          → builds + starts the stack and issues HTTPS certs.
#
#  Safe to re-run at any time.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run with sudo:  sudo ./install.sh" >&2
  exit 1
fi

echo "==> [1/4] Installing prerequisites (Docker, firewall, .env) ..."
bash scripts/setup-vps.sh

[ -f .env ] || { echo "ERROR: .env was not created." >&2; exit 1; }

gen_secret() { openssl rand -base64 32 | tr -d '\n'; }
gen_pass()   { openssl rand -hex 24 | tr -d '\n'; }

if grep -q 'replace-me-with-a-long-random-string' .env; then
  echo "==> [2/4] Generating AUTH_SECRET ..."
  sed -i "s|^AUTH_SECRET=.*|AUTH_SECRET=\"$(gen_secret)\"|" .env
fi
if grep -q 'change-me-strong-password' .env; then
  echo "==> Generating POSTGRES_PASSWORD ..."
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=\"$(gen_pass)\"|" .env
fi

# Derive the public URLs from DOMAIN (Discord OAuth callback needs these).
CUR_DOMAIN="$(grep -E '^DOMAIN=' .env | head -1 | sed -E 's/^DOMAIN=//; s/^"//; s/"$//')"
if [ -n "$CUR_DOMAIN" ] && ! echo "$CUR_DOMAIN" | grep -Eq '(your-domain\.com|example\.com)'; then
  sed -i "s|^AUTH_URL=.*|AUTH_URL=\"https://${CUR_DOMAIN}\"|" .env
  sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=\"https://${CUR_DOMAIN}\"|" .env
fi

# Gate on values only YOU can supply.
missing=""
grep -Eq 'DOMAIN="?(your-domain\.com|example\.com)"?' .env       && missing="$missing DOMAIN"
grep -Eq 'LETSENCRYPT_EMAIL="?admin@(your-domain\.com|example\.com)"?' .env && missing="$missing LETSENCRYPT_EMAIL"
grep -q 'your-discord-client-id' .env                            && missing="$missing AUTH_DISCORD_ID"
grep -q 'your-discord-client-secret' .env                        && missing="$missing AUTH_DISCORD_SECRET"
grep -Eq 'BOOTSTRAP_ADMIN_DISCORD_IDS="(your-discord-user-id)?"' .env && missing="$missing BOOTSTRAP_ADMIN_DISCORD_IDS(your-id)"

if [ -n "$missing" ]; then
  cat <<EOF

⚙  Prerequisites are installed and .env was created (secrets auto-generated).

   Before launching, edit .env and set these:${missing}

   Also set BOOTSTRAP_ADMIN_DISCORD_IDS to YOUR Discord user id so you become
   the site owner (the only account that can open /admin).

     nano .env

   Then run this installer again to build + launch + enable HTTPS:

     sudo ./install.sh

EOF
  exit 0
fi

echo "==> [3/4] Building and starting the stack (docker compose up -d) ..."
docker compose up -d

set -a; . ./.env; set +a

echo "==> [4/4] Requesting HTTPS certificate for ${DOMAIN} ..."
if bash init-letsencrypt.sh; then
  echo
  echo "✅ Done. Your bio is live at:  https://${DOMAIN}"
  echo "   Sign in at https://${DOMAIN}/login with the owner Discord account,"
  echo "   then customize everything at https://${DOMAIN}/admin"
else
  echo
  echo "⚠  App is up over HTTP, but the TLS step failed (usually DNS not pointed"
  echo "   at this server yet). Verify:  dig +short ${DOMAIN}"
  echo "   then re-run:  sudo ./install.sh   (or just: ./init-letsencrypt.sh)"
fi

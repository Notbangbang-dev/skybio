#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  redeploy.sh — one-command update for the VPS.   sudo ./redeploy.sh
#
#  Handles the recurring snag where init-letsencrypt.sh has overwritten the
#  git-tracked nginx/conf.d/app.conf (which otherwise makes `git pull` abort).
#  Pulls latest, rebuilds, restarts (migrations apply on boot), and re-applies
#  the HTTPS config if a certificate already exists (kept, never re-issued).
# ─────────────────────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")"

if docker compose version >/dev/null 2>&1; then COMPOSE="docker compose"; else COMPOSE="docker-compose"; fi

echo "### [1/5] Discarding generated nginx config so the pull is clean ..."
git checkout -- nginx/conf.d/app.conf 2>/dev/null || true

echo "### [2/5] Pulling latest from origin ..."
git pull --ff-only

echo "### [3/5] Building the app image ..."
$COMPOSE build app

echo "### [4/5] Restarting app (Prisma migrations run automatically on boot) ..."
$COMPOSE up -d app

echo "### [5/5] Restoring HTTPS / reloading nginx ..."
DOMAIN=""
[ -f ./.env ] && DOMAIN="$(grep -E '^DOMAIN=' ./.env | head -1 | cut -d= -f2- | tr -d '\"' | xargs || true)"

if [ -n "$DOMAIN" ] && $COMPOSE run --rm --entrypoint sh certbot -c "[ -d /etc/letsencrypt/live/$DOMAIN ]" >/dev/null 2>&1; then
  echo "    Certificate found for $DOMAIN — re-applying HTTPS config ..."
  ./init-letsencrypt.sh
else
  echo "    No certificate detected — reloading nginx on HTTP ..."
  $COMPOSE restart nginx || true
fi

echo
echo "✅ Redeploy complete. Verify:"
echo "   $COMPOSE exec app curl -s -o /dev/null -w '%{http_code}\\n' localhost:3000/api/health"

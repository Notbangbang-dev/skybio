#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  init-letsencrypt.sh — enable HTTPS for this docker compose stack.
#
#    1. Reads DOMAIN and LETSENCRYPT_EMAIL from ./.env
#    2. Brings up db, app, and nginx. nginx starts with the DEFAULT HTTP-only
#       config (references NO certs) so it always boots and serves the ACME
#       challenge on :80.
#    3. Requests a real certificate from Let's Encrypt via the webroot.
#    4. Installs the HTTPS config (substitutes __DOMAIN__ into the template).
#    5. Reloads nginx to serve HTTPS (with :80 -> :443 redirect).
#
#  Safe to re-run at any time.  Set STAGING=1 to use the LE staging endpoint.
# ─────────────────────────────────────────────────────────────────────────────
set -e

if ! [ -f ./.env ]; then
  echo "ERROR: ./.env not found. Copy .env.docker.example to .env and fill it in first." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ./.env
set +a

: "${DOMAIN:?DOMAIN must be set in .env}"
: "${LETSENCRYPT_EMAIL:?LETSENCRYPT_EMAIL must be set in .env}"

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "ERROR: docker compose is not installed." >&2
  exit 1
fi

STAGING="${STAGING:-0}"
RSA_KEY_SIZE=4096

echo "### Bringing up backend + nginx (HTTP-only config, always boots) ..."
$COMPOSE up -d db app nginx

echo "### Waiting for nginx to answer on :80 ..."
sleep 5

STAGING_ARG=""
if [ "$STAGING" != "0" ]; then
  STAGING_ARG="--staging"
  echo "### (using Let's Encrypt STAGING environment)"
fi

echo "### Requesting the Let's Encrypt certificate for ${DOMAIN} ..."
$COMPOSE run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    ${STAGING_ARG} \
    --email ${LETSENCRYPT_EMAIL} \
    -d ${DOMAIN} \
    --rsa-key-size ${RSA_KEY_SIZE} \
    --agree-tos \
    --no-eff-email \
    --keep-until-expiring" certbot

echo "### Installing the HTTPS nginx config for ${DOMAIN} ..."
sed "s/__DOMAIN__/${DOMAIN}/g" nginx/https.conf.template > nginx/conf.d/app.conf

echo "### Validating and reloading nginx ..."
$COMPOSE exec nginx nginx -t
$COMPOSE exec nginx nginx -s reload

echo
echo "✅ Done. HTTPS should now be live at https://${DOMAIN}"
echo "   Renewal is automatic (certbot renews; nginx reloads every 6h)."

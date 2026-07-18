#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  scripts/setup-vps.sh — bootstrap a fresh Ubuntu 22.04 / 24.04 VPS to run the
#  skybio docker compose stack. Idempotent — safe to re-run.
#
#    • installs Docker Engine + the docker compose plugin (official Docker repo)
#    • enables + starts docker, adds the invoking user to the `docker` group
#    • configures ufw: allow OpenSSH, 80/tcp, 443/tcp; enables the firewall
#    • creates data dirs (uploads, logs, backups)
#    • copies .env.docker.example -> .env if .env is missing
#
#  Run from the project root:   sudo ./scripts/setup-vps.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")/.."

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run with sudo:  sudo ./scripts/setup-vps.sh" >&2
  exit 1
fi

TARGET_USER="${SUDO_USER:-$USER}"

echo "### Updating apt and installing prerequisites ..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg ufw

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "### Docker + compose plugin already installed — skipping."
else
  echo "### Installing Docker Engine + compose plugin ..."
  install -m 0755 -d /etc/apt/keyrings
  if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
      | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
  fi
  . /etc/os-release
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io \
                     docker-buildx-plugin docker-compose-plugin
fi

echo "### Enabling + starting the docker service ..."
systemctl enable docker >/dev/null 2>&1 || true
systemctl start docker  >/dev/null 2>&1 || true

echo "### Adding user '${TARGET_USER}' to the docker group ..."
usermod -aG docker "$TARGET_USER" || true

echo "### Configuring ufw (OpenSSH, 80, 443) ..."
ufw allow OpenSSH   || ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
yes | ufw enable >/dev/null 2>&1 || true
ufw --force reload || true

echo "### Creating data directories (uploads, logs, backups) ..."
mkdir -p uploads logs backups
chown -R "${TARGET_USER}:${TARGET_USER}" uploads logs backups || true

if [ ! -f ./.env ]; then
  if [ -f ./.env.docker.example ]; then
    echo "### No .env found — copying .env.docker.example -> .env ..."
    cp .env.docker.example .env
    chown "${TARGET_USER}:${TARGET_USER}" .env || true
  else
    echo "### WARNING: .env.docker.example not found; create .env manually." >&2
  fi
else
  echo "### .env already present — leaving it untouched."
fi

cat <<'EOF'

✅ VPS bootstrap complete.

NEXT STEPS
──────────
1. Log out/in (or `newgrp docker`) so docker works without sudo.
2. Edit .env: DOMAIN, LETSENCRYPT_EMAIL, POSTGRES_PASSWORD,
   AUTH_SECRET (openssl rand -base64 32), AUTH_URL / NEXT_PUBLIC_APP_URL,
   AUTH_DISCORD_ID, AUTH_DISCORD_SECRET, BOOTSTRAP_ADMIN_DISCORD_IDS (your id).
3. Point a DNS A record for your domain at this server.
4. docker compose up -d
5. ./init-letsencrypt.sh
6. curl -fsS https://<DOMAIN>/api/health
EOF

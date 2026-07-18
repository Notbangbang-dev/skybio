# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
#  skybio — production image
#  bookworm-slim + openssl so the Prisma query engine can load its
#  OpenSSL libraries at runtime.
# ─────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first for layer caching. The schema must exist before `npm ci`
# because the postinstall hook runs `prisma generate`.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

# prisma generate && next build
RUN npm run build

# Runtime data dirs (also backed by named volumes in compose).
RUN mkdir -p /app/uploads /app/logs

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]

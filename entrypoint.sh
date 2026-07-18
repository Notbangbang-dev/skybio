#!/bin/sh
set -e

echo "[entrypoint] applying database migrations (prisma migrate deploy)..."
npx prisma migrate deploy

echo "[entrypoint] seeding database (idempotent)..."
npm run db:seed || echo "[entrypoint] seed skipped"

echo "[entrypoint] starting Next.js on 0.0.0.0:${PORT:-3000}..."
exec npm run start

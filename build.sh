#!/bin/bash
set -e   # exit immediately on any error

REPO_ROOT="$(pwd)"
echo "=== Repo root: $REPO_ROOT ==="

# ── 1. Build NestJS API ───────────────────────────────────────────────────────
echo "=== Installing API deps ==="
cd "$REPO_ROOT/apps/api"
npm install --include=dev

echo "=== Generating Prisma client ==="
npx prisma generate

echo "=== Building NestJS ==="
npm run build

echo "=== Running Prisma migrations ==="
npx prisma migrate deploy

echo "=== NestJS dist contents ==="
ls -la dist/

# ── 2. Build React frontend ───────────────────────────────────────────────────
echo "=== Installing frontend deps ==="
cd "$REPO_ROOT"
npm install --include=dev

echo "=== Building React frontend ==="
npm run build

echo "=== Frontend dist contents ==="
ls -la dist/

echo "=== BUILD COMPLETE ==="

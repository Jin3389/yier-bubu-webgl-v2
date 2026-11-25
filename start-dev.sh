#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
if [ ! -d "node_modules" ]; then
  echo "[1/2] Installing dependencies..."
  npm install
fi
echo "[2/2] Starting Vite dev server..."
npm run dev

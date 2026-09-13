#!/bin/sh
set -e

mkdir -p "$DATABASE_DIR"

# Seed the SQLite file on first run against a fresh (or freshly mounted) volume.
if [ ! -f "$DATABASE_DIR/codebits.db" ]; then
  echo "No existing database found in $DATABASE_DIR, seeding 14 days of content..."
  node scripts/seed.js
fi

exec "$@"

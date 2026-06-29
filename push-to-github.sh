#!/bin/bash
# Run this once from the Replit Shell to push The Finance Fold to GitHub
# Usage: bash finance-fold/push-to-github.sh

set -e

cd "$(dirname "$0")"

echo "→ Initialising git repository…"
git init -b main

git config user.name "SoychaiDeedle"
git config user.email "214118887+SoychaiDeedle@users.noreply.github.com"

echo "→ Adding remote…"
git remote add origin https://github.com/SoychaiDeedle/The-Finance-Fold.git

echo "→ Staging all files…"
git add .

echo "→ Committing…"
git commit -m "Initial commit: The Finance Fold — full portal scaffold

Sections: Overview, Daily Sales, Orders, Returns, Inventory & Product,
Customers, Finance & Reporting, Reporting, Knowledge Library,
Support Tickets, Operations, People & Culture.

Stack: Next.js 16, Tailwind CSS v4, shadcn/ui, Supabase auth."

echo "→ Pushing to GitHub…"
git push -u origin main --force

echo "✓ Done! Repo live at https://github.com/SoychaiDeedle/The-Finance-Fold"

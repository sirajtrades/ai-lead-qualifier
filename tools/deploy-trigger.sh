#!/usr/bin/env bash
# Tool: deploy-trigger
# Does: Installs backend dependencies and deploys the qualify-lead task to Trigger.dev cloud
# Inputs: backend/.env must contain TRIGGER_SECRET_KEY and ANTHROPIC_API_KEY
#         trigger.config.ts must contain the real TRIGGER_PROJECT_ID
# Outputs: qualify-lead task deployed to Trigger.dev; confirmation printed to stdout
# Usage: bash tools/deploy-trigger.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"

echo "==> Checking backend/.env..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "ERROR: backend/.env not found. Create it with TRIGGER_SECRET_KEY and ANTHROPIC_API_KEY before deploying."
  exit 1
fi

if ! grep -q "TRIGGER_SECRET_KEY=tr_" "$BACKEND_DIR/.env"; then
  echo "ERROR: TRIGGER_SECRET_KEY not set in backend/.env (expected value starting with tr_)."
  exit 1
fi

echo "==> Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install

echo "==> Deploying to Trigger.dev..."
npm run deploy

echo ""
echo "Deploy complete. Verify the qualify-lead task is active at https://cloud.trigger.dev"

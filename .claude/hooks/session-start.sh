#!/bin/bash
# Installs RMR Hub's dependencies at the start of a Claude Code cloud session,
# so tests, typecheck and build can run straight away.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR/rmr-hub"
npm ci --no-audit --no-fund

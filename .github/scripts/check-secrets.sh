#!/bin/bash
# Quick check for secrets about to be committed. Used by the Claude Code hook before
# `git commit`, and can be run by hand. CI also runs gitleaks over the full history.
#   check-secrets.sh            checks staged changes
#   check-secrets.sh --all      checks staged and unstaged changes (for `git commit -a`)
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 0

if [ "${1:-}" = "--all" ]; then
  files=$(git diff HEAD --name-only --diff-filter=ACMR 2>/dev/null; git ls-files --others --exclude-standard)
  diff=$(git diff HEAD --diff-filter=ACMR -U0 2>/dev/null)
else
  files=$(git diff --cached --name-only --diff-filter=ACMR)
  diff=$(git diff --cached --diff-filter=ACMR -U0)
fi

problems=""

# Environment files hold real keys; only the empty .env.example template belongs in git.
env_files=$(printf '%s\n' "$files" | grep -E '(^|/)\.env($|\.)' | grep -vE '\.env\.example$' || true)
[ -n "$env_files" ] && problems+="Environment file(s) staged (keys belong in .env.local or host secrets): $env_files"$'\n'

# Private keys and well-known token formats, only in added lines.
patterns='-----BEGIN ([A-Z]+ )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|sk_live_[0-9a-zA-Z]{20,}|rk_live_[0-9a-zA-Z]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|sk-(proj-)?[A-Za-z0-9]{32,}|gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|GOCSPX-[A-Za-z0-9_-]{20,}|postgres(ql)?://[^:/[:space:]]+:[^@/[:space:]]{6,}@'
hits=$(printf '%s\n' "$diff" | grep -E '^\+' | grep -vE '^\+\+\+' | grep -oE -- "$patterns" | sed -E 's/(.{12}).*/\1…/' | sort -u || true)
[ -n "$hits" ] && problems+="Possible secret(s) in the changes: $(echo "$hits" | tr '\n' ' ')"$'\n'

if [ -n "$problems" ]; then
  printf '%s' "$problems"
  exit 1
fi
exit 0

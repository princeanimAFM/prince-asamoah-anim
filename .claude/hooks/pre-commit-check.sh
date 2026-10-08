#!/bin/bash
# Claude Code PreToolUse hook: before Claude runs `git commit`, block it if secrets or
# .env files are about to be committed, and remind it of the security review rule.
set -uo pipefail

cmd=$(jq -r '.tool_input.command // ""')
# Only `git commit` (also inside `&&` chains); everything else passes straight through.
if ! printf '%s' "$cmd" | grep -qE '(^|[;&|[:space:]])git([[:space:]]+-C[[:space:]]+[^[:space:]]+)?[[:space:]]+commit([[:space:]]|$)'; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
mode=""
printf '%s' "$cmd" | grep -qE 'commit[^;&|]*[[:space:]](-a|--all|-[a-zA-Z]*a[a-zA-Z]*)([[:space:]]|$)' && mode="--all"

if ! out=$("$CLAUDE_PROJECT_DIR/.github/scripts/check-secrets.sh" $mode 2>&1); then
  jq -n --arg r "Commit blocked: $out Remove it from the commit (keys go in .env.local or the host's secret settings), then try again." \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $r}}'
  exit 0
fi

jq -n '{hookSpecificOutput: {hookEventName: "PreToolUse", additionalContext: "Reminder (CLAUDE.md): app code changes need /security-review and the compliance checklist before they are called done."}}'

#!/usr/bin/env bash
# Read-only checks; safe to run locally or stream over SSH.
set -uo pipefail

failed=0
check() {
  printf '\n> '
  printf '%s ' "$@"
  printf '\n'
  "$@" || failed=1
}

printf 'Host: %s\n' "$(hostname)"
for tool in git gh ssh node npm pnpm uv python3 make rg docker; do
  if ! command -v "$tool"; then
    printf 'Missing tool: %s\n' "$tool" >&2
    failed=1
  fi
done
check git --version
check gh --version
check ssh -V
check node --version
check npm --version
check pnpm --version
check uv --version
check python3 --version
check make --version
check rg --version
# Explicitly check the host's local Docker daemon; do not change the selected context.
check docker --context default version --format '{{.Client.Version}} / {{.Server.Version}}'
check docker --context default compose version
exit "$failed"

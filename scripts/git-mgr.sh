#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd -- "$repo_root"

fail() { printf '%s\n' "$*" >&2; exit 1; }

[[ $# -eq 0 ]] || fail '인자 없이 실행하세요: ./scripts/git-mgr.sh'
branch=$(git symbolic-ref --quiet --short HEAD) || fail '브랜치로 전환한 뒤 실행하세요 (현재 detached HEAD).'
git remote get-url origin >/dev/null || fail 'origin 원격 저장소를 먼저 설정하세요.'

printf '전체 변경 파일을 스테이징합니다.\n'
git add --all
if git diff --cached --quiet; then
  printf '새 변경이 없습니다. 기존 커밋을 푸시합니다.\n'
else
  message="chore: auto-save $(date '+%Y-%m-%d %H:%M:%S %z')"
  git commit -m "$message"
fi

printf '%s 브랜치를 origin에 푸시합니다.\n' "$branch"
git push --set-upstream origin "refs/heads/$branch:refs/heads/$branch" ||
  fail '푸시에 실패했습니다. 로컬 커밋은 유지됩니다. 오류를 해결한 뒤 다시 실행하세요.'
printf '완료했습니다.\n'

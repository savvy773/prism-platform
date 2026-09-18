# 실행 가능한 명령

구현은 루트 `scripts/`, 짧은 명령은 루트 Makefile에 있습니다.
개발 명령은 WSL 로컬 Docker와 고정된 prism-dev-* 프로젝트만 사용합니다.

| 명령 | 동작 |
| --- | --- |
| `make up` / `make down` | 전체 개발 앱·DB 시작 / 중지; 데이터 유지 |
| `make up MODULE=portal` | 포털·프록시·MariaDB 시작 |
| `make up MODULE=erpnext` | ERPNext 데모·MariaDB 시작 |
| `make down MODULE=portal` / `MODULE=erpnext` | 해당 앱만 중지; 공용 DB 유지 |
| `make restart` | 전체 앱 재시작; MODULE로 선택 가능 |
| `make dev` | 포털 시작 (up MODULE=portal과 동일 목적) |
| `make erp-demo` | ERPNext 데모 시작 |
| `make stop` | 포털만 중지; ERPNext는 MODULE=erpnext |
| `make ps` | 앱·MariaDB 컨테이너 상태 |
| `make urls` | 접속 주소와 포트 |
| `make logs` / `make logs MODULE=erpnext` | 포털 / ERP 백엔드 로그 |
| `make rebuild MODULE=portal` | 포털 이미지 빌드·컨테이너 재생성, DB 유지 |
| `make reset-dev MODULE=portal` | 포털 DB 기록 초기화·샘플 재생성 |
| `make reset-dev MODULE=erpnext` | ERP DB·첨부파일·전용 큐 초기화·데모 재생성 |
| `make test` | 포털 TypeScript·입력 검증·업데이트 실패 경계 테스트; 초기화 없음 |
| `make check-updates` | 최신 호환 스택 버전 조회 |
| `make update-stack` | 변경 시 테스트·데이터 스냅샷·스택 업데이트 |
| `make setup-dev` | 로컬 비밀 설정 최초 생성; 기존 비밀번호 유지 |
| `make db-up ENV=development DB=mariadb` | 독립 MariaDB 시작 |
| `make db-stop ENV=development DB=mariadb` | MariaDB 중지 (연결 앱에 영향) |
| `make db-status ENV=development DB=mariadb` | DB 상태 |
| `make db-logs ENV=development DB=mariadb` | DB 로그 |
| `make doctor` / `make doctor-remote` | 로컬 / ssh su 개발 도구 점검 |
| `./scripts/git-mgr.sh` / `make git` / `make save` | 전체 변경 스테이징·자동 시간 메시지 커밋·푸시 |
| `python3 scripts/backup/backup-code.py` | 코드·Git 이력 백업; DB/비밀 파일 제외 |

Git 관리자 스크립트는 현재 인자/질문 없이 실행하도록 정리되어 있습니다.
변경이 없으면 기존 커밋만 푸시합니다. 푸시 실패 시 로컬 커밋이 남습니다.
커밋만 수시로 남기려면 기본 Git 명령을 사용합니다:

```bash
git status
git diff
git add <files>
git commit -m "변경 내용"
git push                      # 원하는 시점에 별도 실행
```

배포 `make deploy REV=<commit>`, PostgreSQL 실행, 정기 데이터 백업·복구 자동화는
아직 구현하지 않았습니다. 실행 가능한 명령처럼 사용하지 않습니다.

`down`은 데이터를 지우지 않습니다. 개발 데이터 삭제에는 반드시
`reset-dev MODULE=...`가 필요합니다. 전체 MariaDB 볼륨은 삭제하지 않습니다.
운영 환경·원격 Docker 대상·생략된 초기화 모듈은 거부합니다.
[접속 안내](ACCESS.md)와 [DB 소유권](DATABASE.md)을 참고하세요.

업데이트 스냅샷은 `~/.local/state/prism/stack-backups/`에 남습니다. 호스트 OS
업데이트·운영 배포는 하지 않습니다. [ERP 인수인계](../html/erpnext-handover.html#upgrade)를 참고하세요.

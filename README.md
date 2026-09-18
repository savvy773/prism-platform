# Prism Platform

Internal company platform developed on Windows through WSL2 and deployed to Ubuntu 26.04 with Docker Compose.

## Status

WSL에서 포털·ERPNext 데모·독립 MariaDB가 실행됩니다. Ubuntu 운영 배포,
PostgreSQL과 Cloudflare Tunnel은 후속 단계입니다.

```bash
make up             # 전체 시작
make down           # 전체 중지 · 데이터 유지
make ps             # 상태
make check-updates  # 최신 호환 버전 확인
make update-stack   # 변경 시 검증·백업·업데이트
make save           # 전체 변경 자동 커밋·푸시
```

접속: [포털](http://prismjuns:3000) · [ERPNext](http://prismjuns:8080) ·
[접속·포트 안내](http://prismjuns/reference/docs/html/access-guide.html) ·
[ERP 기술 인수인계](http://prismjuns/reference/docs/html/erpnext-handover.html).
이름 연결이 안 되면 `192.168.123.66`을 사용합니다.
실행 스크립트는 루트 `scripts/`, 사람을 위한 절차는 `ops/`에 둡니다.

## Layout

```text
prism-platform/
├── apps/
│   ├── portal/                 # Wiki, calendars, weekly reports, projects, boards
│   ├── erpnext/                # ERP app, private Redis/workers/site files
│   └── automation/             # Independent Playwright workers
├── packages/
│   ├── ui/                     # Shared UI source
│   ├── integrations/           # API clients and adapters
│   └── config/                 # Shared development configuration contract
├── infra/
│   ├── mariadb/               # Shared server; separate ERPNext and portal DBs
│   ├── postgres/              # Optional independent PostgreSQL stack
│   ├── redis/                 # Only for explicit platform needs
│   ├── proxy/                 # Shared HTTP entry point
│   ├── cloudflare/            # Future external ingress
│   └── docker/                # Shared Docker conventions
├── environments/
│   ├── development/           # WSL2 configuration
│   │   ├── apps/
│   │   ├── mariadb/
│   │   └── postgres/          # Optional engine
│   └── production/            # Ubuntu configuration
│       ├── apps/
│       ├── mariadb/
│       └── postgres/          # Optional engine
├── scripts/                   # Lifecycle, Git, updates, backup, Windows LAN
├── ops/
│   ├── compose/               # Assembly conventions
│   ├── database/              # Independent DB lifecycle design
│   ├── deploy/                # Deployment procedures
│   ├── backup/                # Backup procedures, not archives
│   └── restore/               # Recovery procedures
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/              # Synthetic data only
└── docs/                      # Architecture and operating guides
    ├── md/                    # Markdown documentation
    └── html/                  # Browser structure plan + reusable assets/
```

Root `compose.yaml` assembles applications and the proxy. Independent MariaDB
uses `infra/mariadb/compose.yaml`; it is never included in the app project.
PostgreSQL has a reserved structure but no runtime yet.

MariaDB is the default database engine. Each environment has its own independent
instance with separate ERPNext and portal databases/accounts. PostgreSQL is an
optional stack for a future consumer; current apps do not require it. Wiki and
business collaboration features live in the portal. See [database ownership](docs/md/DATABASE.md)
for application boundaries, shared dependencies, and reset rules.

## Start here

- [ERPNext technical handover](docs/html/erpnext-handover.html)
- [Access and ports](docs/html/access-guide.html)
- [Modernization roadmap](docs/md/ROADMAP.md)
- [Visual structure and workflow plan](docs/html/structure-plan.html)
- [Docker beginner guide](docs/md/DOCKER_GUIDE.md)
- [Windows / WSL2 development](docs/md/DEVELOPMENT.md)
- [Command design: available and planned](docs/md/COMMANDS.md)
- [Ubuntu deployment](docs/md/DEPLOYMENT.md)
- [Architecture and module independence](docs/md/ARCHITECTURE.md)
- [Shared MariaDB and application databases](docs/md/DATABASE.md)
- [Environment configuration](environments/README.md)
- [Architecture decisions](docs/md/DECISIONS.md)
- [Code backup to the backup disk](ops/backup/README.md)
- [Agent instructions](AGENTS.md)

Git stores source and reproducible configuration. Secrets, databases, uploaded files, and backup archives stay outside Git.

To back up the current code and Git history:

```bash
python3 scripts/backup/backup-code.py
```

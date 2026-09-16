# Prism Platform

Internal company platform developed on Windows through WSL2 and deployed to Ubuntu 24.04 with Docker Compose.

## Status

Repository structure, environment examples, and a verified code-backup script are established. Application source, Dockerfiles, Compose definitions, service lifecycle scripts, and application tests are not implemented yet.

## Layout

```text
prism-platform/
├── apps/
│   └── portal/                 # Owned web UI, dashboards, forms
├── packages/
│   ├── ui/                     # Shared UI source
│   └── integrations/           # API clients and adapters
├── services/
│   ├── erpnext/                # ERP and its private dependencies
│   ├── wiki/                   # Wiki and its private dependencies
│   └── automation/             # Independent Playwright workers
├── infra/
│   ├── postgres/              # Prism-owned application database
│   ├── redis/                 # Only for explicit platform needs
│   ├── proxy/                 # Shared HTTP entry point
│   ├── cloudflare/            # Future external ingress
│   └── docker/                # Shared Docker conventions
├── environments/
│   ├── development/           # WSL2 configuration and env example
│   └── production/            # Ubuntu configuration and env example
├── ops/
│   ├── compose/               # Assembly conventions
│   ├── scripts/               # Lifecycle helpers, when implemented
│   ├── deploy/                # Deployment procedures
│   ├── backup/                # Backup procedures, not archives
│   └── restore/               # Recovery procedures
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/              # Synthetic data only
└── docs/                      # Architecture and operating guides
```

A root `compose.yaml` will assemble module definitions once the first service is implemented. Each module owns its runtime configuration; environment overlays supply host-specific differences.

## Start here

- [Docker beginner guide](docs/DOCKER_GUIDE.md)
- [Windows / WSL2 development](docs/DEVELOPMENT.md)
- [Ubuntu deployment](docs/DEPLOYMENT.md)
- [Architecture and module independence](docs/ARCHITECTURE.md)
- [Environment configuration](environments/README.md)
- [Architecture decisions](docs/DECISIONS.md)
- [Code backup to the backup disk](ops/backup/README.md)
- [Agent instructions](AGENTS.md)

Git stores source and reproducible configuration. Secrets, databases, uploaded files, and backup archives stay outside Git.

To back up the current code and Git history:

```bash
python3 ops/backup/backup-code.py
```

# Prism Platform - Architecture

## High-Level Architecture

```text
Developer workstation
Windows + WSL2
        │
        │ git push
        ▼
GitHub repository
savvy773/prism-platform
        │
        │ clone / pull / later CI/CD
        ▼
Ubuntu 24.04 server
        │
        ▼
Docker Compose
        ├── ERPNext
        ├── Wiki / Knowledge service
        ├── Dashboard
        ├── Database services
        ├── Redis / cache / queue services
        └── Reverse proxy
                │
                └── Cloudflare Tunnel (later)
```

## Repository Direction

Expected top-level structure:

```text
prism-platform/
├── AGENTS.md
├── README.md
├── compose.yml
├── compose.dev.yml
├── compose.prod.yml
├── .env.example
├── .gitignore
├── apps/
├── services/
├── infra/
├── scripts/
└── docs/
    ├── PROJECT_CONTEXT.md
    ├── ARCHITECTURE.md
    └── DECISIONS.md
```

The exact service split is intentionally not frozen yet. It will evolve as ERPNext, wiki, dashboard, database, cache, and proxy requirements become concrete.

## Data Model Philosophy

Development data is disposable unless a test explicitly requires persistence.

Production data is not disposable and must eventually have:
- explicit persistent volumes
- backups
- restore procedures
- migration procedures
- access control

Development reset commands must be clearly separated from production operations.

## Networking Direction

Prefer Docker internal networks for service-to-service communication.

Expose only the minimum host ports required during development.

Later, consolidate external HTTP/HTTPS entry through a reverse proxy and then Cloudflare Tunnel where appropriate.

## Reverse Proxy

A reverse proxy such as Nginx may be introduced when multiple HTTP services need one controlled entry point.

It is not necessary to complicate the earliest experiments with full external routing before core services and database flows are verified.

## Database Testing Requirement

Database behavior must be observable, not assumed.

For important workflows verify:

```text
Web form / import
      ↓
Application
      ↓
Database write
      ↓
Direct database verification
      ↓
Application read-back verification
```

Tests should cover successful writes, validation errors, duplicates, schema changes, and reset/rebuild behavior.

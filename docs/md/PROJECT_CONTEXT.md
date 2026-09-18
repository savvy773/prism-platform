# Prism Platform - Project Context

## Purpose

Prism Platform is an internal company platform intended to combine operational tools and shared information systems under a manageable, reproducible infrastructure.

The initial scope includes:
- ERPNext for ERP workflows
- an owned portal wiki / Notion-like knowledge area
- shared calendars, weekly work reports, projects/tasks, boards, and dashboards
- shared MariaDB with separate ERPNext and portal databases/accounts
- future secure external access through Cloudflare Tunnel

## Current Stage

The project is in an early experimental and architecture-design phase.

Current scope includes a running WSL portal, MariaDB and ERPNext demo.
Production deployment is not yet implemented. MariaDB is the default for ERPNext and portal; PostgreSQL is an
optional independent stack for a future consumer. DB-server Compose projects
are separate from application assembly. The portal owns its wiki and business
features. See [database ownership](DATABASE.md).

The priority is not premature production hardening. The priority is to make development fast, repeatable, observable, and easy to reset.

The development environment should support frequent cycles of:
1. build
2. run
3. enter test data
4. test imports
5. test web forms
6. inspect database results
7. destroy
8. rebuild

## Development Environment

Primary development machine:

```text
Windows
└── WSL2
    └── Docker
        └── Docker Compose
```

Target server:

```text
Ubuntu 26.04 LTS
└── Docker
    └── Docker Compose
```

## Source Control and Deployment Direction

```text
WSL development
    ↓ git push
GitHub
    ↓ git pull / later CI/CD
Ubuntu server
    ↓
Docker Compose
```

GitHub should contain everything required to recreate the platform except secrets and persistent production data.

## Near-Term Priorities

1. Establish repository and folder structure.
2. Establish Docker Compose conventions.
3. Make create/destroy/rebuild workflows simple.
4. Test database writes from imports and web forms.
5. Separate development data handling from production data handling.
6. Deploy reproducibly to Ubuntu 26.04.
7. Add Cloudflare Tunnel after the local/server architecture is stable.
8. Add CI/CD after deployment mechanics are understood and stable.

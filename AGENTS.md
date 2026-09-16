# Prism Platform - Codex Instructions

## Project Goal

Build an internal company platform that is reproducible, disposable in development, and straightforward to deploy on Linux with Docker.

Planned platform components include:
- ERPNext
- Internal wiki / knowledge sharing
- Internal dashboard
- PostgreSQL where appropriate
- Redis where appropriate
- Reverse proxy
- Cloudflare Tunnel later

## Environments

Development:
- Windows
- WSL2
- Docker / Docker Compose

Deployment target:
- Ubuntu 24.04 LTS
- Docker / Docker Compose

GitHub is the source of truth for code, configuration, infrastructure definitions, scripts, and documentation.

## Development Philosophy

The early development environment must be disposable.

It should be easy to:
- create the environment
- destroy containers
- rebuild images
- reset development databases
- test imports and migrations repeatedly
- verify web-form-to-database flows

Do not treat development containers as pets. Prefer reproducible configuration over manual changes inside running containers.

## Configuration Rules

Keep reproducible configuration in Git:
- Dockerfiles
- compose files
- application source
- reverse-proxy configuration
- scripts
- database migrations / initialization scripts
- `.env.example`

Do not commit:
- `.env`
- passwords
- API keys
- TLS private keys
- production database data
- Docker volumes
- backups containing real company data

## Working Rules for Codex

Before making architecture-level changes, read:
- `docs/PROJECT_CONTEXT.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`

Prefer small, reversible changes during the early phase.

When introducing a new service:
1. Define its purpose.
2. Define ports and internal networking.
3. Define persistent vs disposable data.
4. Add health checks when practical.
5. Document environment variables.
6. Keep production and development differences explicit.

Never run destructive database reset operations against production.


## Repository Ownership

- `apps/portal/`: owned web UI, dashboards, and HTTP handlers
- `packages/`: reusable UI and integration source
- `services/`: ERPNext, wiki, and independent automation workers
- `infra/`: shared infrastructure
- `environments/development/`: WSL2 environment configuration
- `environments/production/`: Ubuntu environment configuration
- `ops/`: lifecycle, deployment, backup, and restore procedures
- `tests/`: integration/E2E tests and synthetic fixtures

Keep runtime definitions beside their owning module. Do not recreate duplicate ERPNext/wiki directories under `apps/`. Preserve independent module operation: stopping ERPNext must not stop wiki or unrelated databases. Document unavoidable shared dependencies.

Use LF line endings. Resolve script paths from the repository rather than hard-coded host paths. Select environments and Docker targets explicitly; do not treat an environment variable alone as a production reset guard. Runtime implementation is pending; keep setup documentation honest about what is executable.

# Prism Platform - Codex Instructions

## Project Goal

Build an internal company platform that is reproducible, disposable in development, and straightforward to deploy on Linux with Docker.

Planned platform components include:
- ERPNext
- Portal-owned wiki, schedules, weekly reports, projects, and shared boards
- Internal dashboard
- Shared MariaDB with separate ERPNext and portal databases/accounts
- Optional independently managed PostgreSQL for applications that require it
- Redis where appropriate
- Reverse proxy
- Cloudflare Tunnel later

## Environments

Development:
- Windows
- WSL2
- Docker / Docker Compose

Deployment target:
- Ubuntu 26.04 LTS
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
- `docs/md/PROJECT_CONTEXT.md`
- `docs/md/ARCHITECTURE.md`
- `docs/md/DECISIONS.md`

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

- `apps/portal/`: owned wiki/business features, web UI, dashboards, HTTP handlers, and portal schema migrations
- `apps/erpnext/`: vendor ERP configuration, integrations, private Redis/workers/site files
- `apps/automation/`: independently deployed automation workers
- `packages/`: reusable UI and integration source
- `infra/`: independently managed MariaDB/PostgreSQL stacks, proxy, and other infrastructure
- `environments/development/`: WSL2 environment configuration
- `environments/production/`: Ubuntu environment configuration
- `scripts/`: executable Git, development lifecycle, backup, Windows networking, and future deployment scripts
- `ops/`: operational procedure documentation
- `tests/`: integration/E2E tests and synthetic fixtures

Keep runtime definitions beside their owning module. ERPNext belongs in `apps/erpnext/`; the owned wiki belongs inside `apps/portal/`. Do not add a separate wiki service. MariaDB belongs in `infra/mariadb/`; optional PostgreSQL belongs in `infra/postgres/`. Both DB engines have independent Compose entry points/projects and separate storage per environment. ERPNext and the current portal use separate databases/accounts on MariaDB. Read `docs/md/DATABASE.md` before database changes.

Root Compose assembly is applications only; never include the DB-server Compose definitions. Environment configuration is split into `environments/<environment>/apps/`, `mariadb/`, and `postgres/`. Follow the fixed project/network mapping in `environments/README.md`. Apps attach only to the external DB networks they use. Keep Markdown sources in `docs/md/` and browser visualizations in `docs/html/`.

Keep all deployable applications under `apps/`; do not recreate a parallel
`services/` directory. Share design tokens/CSS/components through `packages/ui/`
and development configuration through `packages/config/`. Prefer current stable
releases and supported LTS runtimes, pin compatible versions/lockfiles, and
validate upgrades together across development and production. Do not blindly
upgrade vendor dependencies or duplicate shared styles/configuration in apps.

Stopping ERPNext must keep shared MariaDB and the portal (including wiki) running. Portal features may share portal tables; do not access ERPNext tables directly from other apps. Shared MariaDB maintenance affects all consumers. Module resets must target only the selected development database and private storage, never delete the shared MariaDB volume.

Use LF line endings. Resolve script paths from the repository rather than hard-coded host paths. Select environments and Docker targets explicitly; do not treat an environment variable alone as a production reset guard. Portal and ERPNext demos now run on WSL. Production deployment is pending; keep documentation honest about which commands exist.

## Current Implementation and User Overrides

The user authorized runnable WSL portal/MariaDB and ERPNext demos, superseding
the earlier design-only scope. All frequent executable scripts now belong at
root `scripts/`, including backup subdirectories and future `scripts/deploy/`.
Do not recreate `ops/scripts/`. The current Git manager was simplified to an
argument-free stage-all, timestamp commit, and push workflow; preserve it.

Development PC: `prismjuns` / 192.168.123.66 (Windows + WSL). Ubuntu target:
`prismdev` / 192.168.123.52, SSH alias `su`. LAN web access is authorized; internet
publication and production deployment are not part of this implementation.
Portal is currently an unauthenticated practice app. Its five record categories
are weekly work, schedule, project, wiki, and handover; advanced editing, file
uploads, authorization, and ERP integration remain future work.

Use `make up/down/ps` for the full development stack. Module resets are explicit.
Do not run automatic data-reset tests once users have started entering their own
records; lifecycle verification needs an explicitly disposable dataset.

## Human Handover and Readability

Maintain `docs/html/erpnext-handover.html` when ERP service topology, storage,
ports, lifecycle commands or compatibility policy changes. Separate current WSL
implementation from future Ubuntu deployment. Explain operational steps for a
human maintainer, including failure and recovery boundaries. Reuse local Korean
fonts and shared UI tokens; keep text readable at normal browser zoom.

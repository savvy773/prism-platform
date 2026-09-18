# Prism Platform - Architecture Decisions

This file records decisions that should survive individual ChatGPT or Codex sessions.

## ADR-001: Docker-first development

**Status:** Accepted

Use Docker / Docker Compose as the default execution model for the platform.

### Reason
- repeatable environments
- simple service isolation
- easy rebuilds
- good portability from WSL2 to Ubuntu 24.04
- easier experimentation during the early phase

## ADR-002: Disposable development environment

**Status:** Accepted

Development containers and development databases may be destroyed and recreated frequently.

### Reason
The project is still being shaped. Fast reset/rebuild cycles are more valuable than preserving experimental state.

### Constraint
Production data must never follow the same destructive reset policy.

## ADR-003: GitHub as source of truth

**Status:** Accepted

The GitHub repository stores source code, configuration, scripts, infrastructure definitions, and architecture documentation.

Persistent database data and secrets are excluded.

## ADR-004: WSL2 development, Ubuntu deployment

**Status:** Accepted

Develop primarily under Windows + WSL2 and deploy to Ubuntu 24.04 LTS.

Docker Compose should minimize environment-specific differences.

## ADR-005: Delay Cloudflare Tunnel until core services work

**Status:** Accepted

Do not make Cloudflare Tunnel a prerequisite for the first development iterations.

First stabilize:
- containers
- service networking
- database behavior
- internal HTTP access

Then add secure external routing.

## ADR-006: Delay CI/CD until manual deployment is understood

**Status:** Accepted

Initially deploy using explicit Git + Docker Compose operations.

After the deployment process is stable and understood, automate it with GitHub Actions or another CI/CD mechanism.

## ADR-007: Codex context lives in the repository

**Status:** Accepted

Use `AGENTS.md` for persistent Codex instructions and `docs/` for longer-lived project context and architecture decisions.

Chat conversations may guide decisions, but the repository documentation is the durable project memory.

## ADR-008: Shared browser automation service

**Status:** Accepted

Use Playwright-based browser automation as a shared platform service rather than embedding the Playwright runtime into every application.

### Direction
- run business RPA in dedicated worker containers
- expose automation through stable job/API contracts
- keep app-specific flows separate from the execution engine
- keep production RPA separate from Playwright E2E tests
- prefer documented APIs when available
- isolate automation credentials, logs, traces, screenshots, and downloaded artifacts
- keep ERPNext-internal Redis separate from platform automation queues

### Reason
Browser automation has different resource, security, retry, observability, and scaling characteristics from normal web applications. Isolation keeps application containers smaller and makes the automation engine independently replaceable and scalable.


## ADR-009: One repository across WSL2 and Ubuntu

**Status:** Accepted

The separate vendor-wiki placement below is superseded by ADR-012; the owned
wiki now belongs to the portal. ADR-014 supersedes the separate `services/`
tree. Other repository ownership principles remain.

Develop on the Windows PC through WSL2 and deploy the same committed modules to Ubuntu. Keep host differences under `environments/development/` and `environments/production/`, with distinct project names, secrets, and storage. Root Compose assembly will include module-owned definitions when implemented.

Use `apps/portal/` for the portal and dashboards; `services/erpnext/` and `services/wiki/` for vendor runtimes; and `packages/integrations/` for reusable adapters. Remove duplicate placeholder locations. Keep backup and restore procedures under `ops/` and runtime data outside Git.

### Reason
A single ownership location per component prevents drift between hosts and makes independent changes easier to review.

## ADR-010: Independent module lifecycle

**Status:** Accepted

The private database-server placement below is superseded by ADR-012. ERPNext
and the portal now use separate databases on shared MariaDB; application stop
operations keep the shared server running.

ERPNext must be stoppable with its private dependencies while wiki, portal, and unrelated databases remain operational. Keep private databases, Redis, networks, and workers within their module boundary. Module stop operations must target explicit services rather than the entire Compose project or Docker daemon.

### Constraint
Features that call a stopped module are unavailable and must fail gracefully. Shared infrastructure and the host remain common failure points; this design does not promise high availability.

## ADR-011: Local verification and explicit SSH deployment

**Status:** Accepted (2026-09-18)

Develop, run, and test frequently in WSL, then commit/push to GitHub and deploy
the tested revision to the SSH host `su`. Git + SSH is the normal code delivery
path. SCP is optional for files kept outside Git. Pushing code does not itself
deploy a service.

Use a root Makefile for short commands. Keep implementations in `scripts/`,
`ops/deploy/`, `ops/backup/`, and `ops/restore/` rather than adding root scripts.
Git shortcuts commit explicitly staged files and never force-push. Application
run, test, and deployment commands will be connected when services exist.

The actual WSL and server hosts both run Ubuntu 26.04.1 LTS; this supersedes the
Ubuntu 24.04 target in ADR-004. Align stable development tools across both hosts,
using the current Node.js LTS line. Record versions in the development guide and
runtime version files, and keep production data and configuration separate.

## ADR-012: Shared MariaDB and a portal-owned wiki

**Status:** Accepted (2026-09-18)

The PostgreSQL exclusion below is superseded by ADR-013. The shared MariaDB
and portal/wiki ownership decisions remain in effect.

Use MariaDB as the relational database engine for this project. Remove the
PostgreSQL infrastructure placeholder and active dependency plans. Other future
projects may choose PostgreSQL independently.

Define one shared MariaDB service per environment in `infra/mariadb/`. ERPNext
and the portal receive separate logical databases and runtime accounts. Portal
features share portal tables; integrations with ERPNext use APIs or explicit
import/export contracts. MariaDB versions must satisfy all consumers.

Build the Notion-style wiki, shared calendars, weekly reports, project/task
management, and boards as owned portal features. Remove the separate vendor-wiki
placeholder. Schema migrations belong to their application; infrastructure owns
the MariaDB runtime and database/account provisioning.

Stopping ERPNext must keep MariaDB and the portal running. Database-server
maintenance is a shared dependency affecting both apps. A module development
reset requires an explicit target and resets only that application's database
and private storage, never the shared MariaDB volume or production data.

This changes the wiki ownership in ADR-009 and database-server ownership in
ADR-010 while preserving independent application lifecycle. Implementation stays
at structure and command design until runnable services are introduced. See
[database ownership](DATABASE.md) for the full contract.

## ADR-013: Independent database stacks and optional PostgreSQL

**Status:** Accepted (2026-09-18)

Keep all configuration in this repository. Root `compose.yaml` assembles
applications; MariaDB and optional PostgreSQL use independent entry points in
`infra/mariadb/` and `infra/postgres/`. Never include DB-server definitions in
root app assembly. Separate folders at the parent of this repository are not
needed for independent Docker lifecycle.

Split environment configuration into `apps/`, `mariadb/`, and `postgres/` under
each environment. Use `prism-dev-apps`, `prism-dev-mariadb`, `prism-dev-postgres`,
and their production equivalents. Each DB stack owns its environment-specific
data network and volume; consumers attach to the required external networks.
App teardown/deployment must not modify DB-server lifecycle. App-owned schema
migrations remain part of the application deployment plan.

ERPNext and the current portal stay on MariaDB. PostgreSQL is optional for a
consumer that supports/requires it; no current app depends on its runtime or
network. It has its own native backup/restore. This supersedes the engine
exclusion in ADR-012, not the separate application database/account boundaries.

Keep database operations in `ops/database/` and app operations in `scripts/`
and `ops/deploy/`. Distinguish image rebuild, container recreation, and an explicit
development data reset. Folder replacement alone performs none of these runtime
operations. Preserve Markdown sources in `docs/md/` and put the interactive
top-down architecture plan in `docs/html/structure-plan.html`.

## ADR-014: One application directory and shared design/configuration

**Status:** Accepted (2026-09-18)

Consolidate portal, ERPNext, and automation under `apps/`. Remove `services/` to
avoid classifying deployable apps by whether they were written here or supplied
by a vendor. Keep database engines/proxy in `infra/`, reusable source in
`packages/`, environment values in `environments/`, and operations in `ops/`.
This supersedes the application placement in ADR-009 without changing runtime
isolation or database ownership.

Use `packages/ui/` for shared design tokens/CSS/components, `packages/config/`
for reusable development settings, and `packages/integrations/` for adapters.
Prefer current compatible stable releases and supported LTS runtimes with pinned
versions/lockfiles and verified upgrades. Shared configuration does not override
vendor compatibility requirements. The documentation plan consumes the common
CSS tokens and keeps its own visualization assets under `docs/html/assets/`.

## ADR-015: Runnable practice apps and root scripts

**Status:** Accepted (2026-09-18)

The user authorized the first WSL runtime: Next.js portal, independent MariaDB,
and an ERPNext demo with sample company data and Excel import/export. Portal
starts with five basic record categories: weekly work, schedules, projects, wiki,
and handover. Rich editing, auth, files, and ERP API integration are later work.

Promote frequent executable operations to root `scripts/`, including Git manager,
`dev.py`, `backup/`, `windows/`, and future `deploy/`. This supersedes ADR-011's
no-root-scripts rule. Keep `ops/` for procedures, not duplicate executables.

`prismjuns` is the Windows/WSL PC; `prismdev` is Ubuntu (`ssh su`). LAN access
via development hostname/IP is authorized. Internet publication and production
deployment are not part of this step. See ACCESS.md for current ports.

Pin ERPNext v16.35.0 with MariaDB 11.8.9 per the Frappe v16 11.8 requirement;
Node 24.21.0, Next.js 16.3.5, React 19.3.0, pnpm 12.4.2. Pin other packages
in the shared lockfile. ERP private Redis is 8.10.1; proxy is Traefik 3.7.13.

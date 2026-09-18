# Prism Platform - Technology Stack

## Goals

The stack should optimize for:
- modular replacement of services
- Docker-first development and deployment
- low coupling between vendor products and Prism-owned code
- maintainability by a small team
- clear upgrade paths
- reusable design and application conventions

## Platform Stack

### Runtime and packaging
- Docker Engine
- Docker Compose plugin (`docker compose`)
- Compose `include` for modular service composition
- Compose profiles for optional development/debug services

Each deployable module owns its own `compose.yaml` where practical. Root Compose
assembles applications only. MariaDB and optional PostgreSQL have separate
Compose entry points/projects and connect through explicit external data networks.

### Custom web application
- Next.js (App Router)
- React
- TypeScript
- Node.js current supported LTS compatible with the selected Next.js release
- pnpm workspaces
- Turborepo for monorepo task orchestration when the custom codebase grows

### UI / design system
- Shared CSS tokens and local Pretendard Variable font
- Tailwind CSS v4 (optional future adoption)
- shadcn/ui source components (optional future adoption)
- CSS variables/design tokens for color, spacing, radius, typography and theme
- Lucide icons unless a product-specific reason requires another set

Shared UI belongs in `packages/ui` and should be consumed by Prism-owned applications.

### Data
- Shared MariaDB instance per environment, defined in `infra/mariadb/`
- Separate ERPNext and portal databases with separate runtime accounts
- Portal wiki, calendars, reports, projects, and boards share the portal database
- Schema migrations belong to the application; shared server/account provisioning belongs to infrastructure
- Optional PostgreSQL stack in `infra/postgres/`, started only for an actual compatible consumer
- Redis only when a service has an explicit cache/queue/session requirement

Choose a MariaDB version compatible with the selected ERPNext release and portal
driver. See [database ownership](DATABASE.md) for lifecycle and recovery boundaries.

### Edge / routing
- Traefik as the preferred Docker-native reverse proxy
- Current file-provider routing in infra/proxy/dynamic.yaml; no Docker socket mount
- Cloudflare Tunnel added later as an external ingress layer

Traefik is an implementation choice, not an application dependency. Applications should only assume normal HTTP routing.

## Application Boundaries

### Deployable applications
All owned and vendor application modules live under `apps/`: portal, ERPNext,
and automation. Reusable source belongs in `packages/`; it is not a deployable app.

The Notion-style wiki and internal business collaboration features belong to
`apps/portal/`. They use the portal's users, teams, permissions, and database.

ERPNext's vendor origin does not require a separate `services/` directory. Keep
its configuration and supported customizations under `apps/erpnext/`.

### Shared infrastructure
Lives under `infra/`.

Examples:
- MariaDB
- PostgreSQL (optional, independently managed)
- Redis
- Traefik
- Cloudflare Tunnel

## Integration Rule

Prefer stable interfaces:
- HTTP APIs
- OpenAPI contracts
- webhooks
- explicit import/export formats
- queues only when required

Avoid direct cross-application database coupling.

## Versioning Rule

Do not use floating container tags such as `latest` for production. Pin major/minor or immutable image versions according to each service's upgrade policy.

Development may move faster, but upgrades should still be deliberate and documented.

Use the latest compatible stable releases and supported LTS runtimes, with exact
runtime/package-manager versions and the shared pnpm lockfile.
Validate upgrades in WSL before production. Shared CSS tokens/components belong
in `packages/ui/`; shared compiler/lint/build settings belong in `packages/config/`.

## Current versions and updates

See [ROADMAP](ROADMAP.md) for the pinned, verified version baseline and supported
upgrade policy. `make check-updates` checks official sources; `make update-stack`
tests, snapshots data, and applies available compatible updates in WSL.
[ERP handover](../html/erpnext-handover.html#upgrade) explains failure boundaries.

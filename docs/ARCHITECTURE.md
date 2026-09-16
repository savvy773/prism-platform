# Prism Platform - Architecture

## Hosts and delivery

```text
Windows PC → WSL2 development checkout → GitHub → Ubuntu deployment checkout
                     prism-dev                      prism-prod
```

Both environments use the same Linux-compatible application source and service modules. Environment-specific configuration lives in `environments/development/` and `environments/production/`. See the root [directory map](../README.md) for the current layout.

## Ownership

| Directory | Responsibility |
| --- | --- |
| `apps/portal/` | Prism-owned web UI, dashboards, forms, and HTTP handlers |
| `packages/ui/` | Shared UI source |
| `packages/integrations/` | Reusable API clients, adapters, and contracts |
| `services/erpnext/` | ERPNext and its database, Redis, workers, and site files |
| `services/wiki/` | Wiki product and its required storage/dependencies |
| `services/automation/` | Independent browser automation workers |
| `infra/` | Explicitly shared database, cache, routing, and ingress services |
| `environments/` | Environment overlays and secret-free configuration examples |
| `ops/` | Lifecycle, deployment, backup, and recovery procedures |
| `tests/` | Cross-service verification and synthetic fixtures |

Migrations, database initialization, Dockerfiles, and Compose definitions belong to the module that owns them. Add directories when their implementation is introduced.

## Independent modules

```text
Shared reverse proxy
├── Portal ── Prism PostgreSQL
├── Wiki ──── Wiki storage/database
└── ERPNext ─ ERP database + ERP Redis + ERP workers + site files

Automation workers → APIs or browser sessions of target services
```

ERPNext must be stoppable without stopping the wiki, portal, or unrelated databases. Do not make their startup depend on ERPNext or share its internal database/Redis. Stopping ERPNext makes ERP-dependent requests and automation unavailable; clients must use bounded timeouts and report service unavailability without crashing unrelated pages.

Treat ERPNext as a group of cooperating containers: stopping only its web process does not stop its scheduler or workers. Document exact Compose service names and the complete module stop/start procedure when its tested Compose definition is added.

A shared proxy remains a common dependency for routed HTTP access. A shared database remains a common dependency for its consumers. Container separation does not provide independent host availability: Docker daemon or host shutdown can affect every module.

## Compose assembly

The planned root `compose.yaml` uses `include` to assemble module definitions close to their owners. Keep environment changes in `environments/<environment>/compose.override.yaml`, with a small number of explicit overrides. These files do not exist until runtime implementation begins.

Use unique service keys such as `erpnext-backend`, `erpnext-db`, `wiki-web`, and `prism-postgres` in the assembled model. These are naming examples, not implemented services. Define project-scoped networks per module and connect only required endpoints to shared routing. Avoid a universal network that exposes every database to every app.

Lifecycle scripts must select the environment and Docker context deliberately. A module stop command must target that module's services; whole-project `down` is not a module stop command.

## Data and recovery

Development uses synthetic data and may be reset deliberately. Production databases and uploaded files require explicit persistent storage, backups, tested restores, and migration recovery procedures before real data is introduced.

Keep code/configuration edits in Git. Manual changes to a container's writable filesystem are not reproducible. Git does not back up runtime data or secrets.

Use different Compose project names (`prism-dev`, `prism-prod`), credentials, and storage for each environment. Do not assign global volume names that bypass project scoping. Reset scripts must validate their target and refuse production; the `PRISM_ENV` variable alone is not enforcement.

## Networking and integration

Use private Docker networks for service communication, minimum host ports, and loopback-only development database/debug access. Traefik is the preferred proxy from `STACK.md`; add Cloudflare Tunnel after local operation and recovery are proven.

Use APIs, webhooks, or explicit import/export contracts between products. Do not query another product's database as an application integration.

## Verification

For important workflows verify input, application validation, database write, and application read-back. Exercise container recreation separately from a destructive development reset. Verify that stopping ERPNext leaves a wiki read/write flow and an independent portal page working.

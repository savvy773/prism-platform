# Compose Assembly

The root `compose.yaml` assembles application modules using Compose
`include`, including ERPNext, portal, and their application-side dependencies.
It must not include the MariaDB or PostgreSQL server definitions. The owned wiki
is a portal feature.

`infra/mariadb/compose.yaml` and optional `infra/postgres/compose.yaml` are separate
Compose entry points with their own projects, networks, and volumes. Environment
files and overlays live in `environments/<environment>/apps/`, `mariadb/`, or
`postgres/`. See the [project mapping](../../environments/README.md). These Compose
development files are implemented for portal/ERP/proxy and independent MariaDB. Production and PostgreSQL runtime files are still planned.

Use unique service names and project-scoped volumes. Each DB stack owns an
environment/engine-specific data network; its app consumers join it as external.
Do not attach unused DB networks or require optional PostgreSQL for MariaDB apps.
Keep databases off web ingress networks. Portal must not depend on ERPNext
processes or private Redis. Applications verify DB readiness and retry connections;
`depends_on` cannot orchestrate a service in a different Compose project.

Use profiles for optional app modules/tools. Start only the DB engines required
by the selected apps. App-project `down` leaves DB projects running but stops all
apps in that project; use explicit service lists to stop ERPNext alone.

Keep shared MariaDB running when either application stops. Never remove its
volume to reset one application; the selected database and private storage are
the reset targets. See [database ownership](../../docs/md/DATABASE.md).

Lifecycle scripts must explicitly select environment files, overlays, and the Docker target. Validate paths and merges with `docker compose config` for updated definitions; avoid emitting resolved secrets into logs.

A replacement should primarily affect the module directory, assembly, routing, and integration adapters. See [architecture](../../docs/md/ARCHITECTURE.md).

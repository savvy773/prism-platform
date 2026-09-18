# Applications

All deployable applications live here, including owned code and configured vendor
products. Do not split applications between `apps/` and a second `services/` tree.

Application modules:
- `portal/` — internal entry point, wiki, calendars, weekly reports, projects, boards, and dashboards
- `erpnext/` — ERPNext configuration/integration and private Redis/workers/site files
- `automation/` — independently deployed browser-automation/RPA workers

Keep portal features together until a separate deployment is justified. Reusable
UI, CSS tokens, configuration, and API adapters belong in `packages/`. Database
servers and web routing belong in `infra/`. Portal features share its MariaDB
database, separate from ERPNext's database on the shared server.

Each app owns its source, tests, Dockerfile, and module Compose definition when implemented. Shared infrastructure belongs in `infra/`, operational procedures in `ops/`, and environment configuration in `environments/`.

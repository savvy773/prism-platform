# Environments

Use the same application source and service modules on both hosts. Environment folders contain configuration differences, not copied applications.

Each environment separates application configuration from database-server
configuration. There is no combined environment `.env` at the environment root.

| Configuration folder | Development project | Production project | Future Compose entry point |
| --- | --- | --- | --- |
| `apps/` | `prism-dev-apps` | `prism-prod-apps` | Root `compose.yaml` |
| `mariadb/` | `prism-dev-mariadb` | `prism-prod-mariadb` | `infra/mariadb/compose.yaml` |
| `postgres/` (optional) | `prism-dev-postgres` | `prism-prod-postgres` | `infra/postgres/compose.yaml` |

Each component folder contains a tracked `.env.example`. Copy it to `.env` in
the same folder when needed and provision secrets there. WSL uses synthetic data;
production requires persistent storage and verified backups/restores. Never copy
development credentials or databases into production. Examples contain metadata
only, not complete service configuration.

Future overlays live at `environments/<environment>/<component>/compose.override.yaml`.
Root application assembly must not include either database-server Compose file.
Scripts must explicitly select the matching environment file, overlay, project,
and Docker target; never rely on working-directory `.env` discovery.

Each database stack owns a data network: `prism-dev-mariadb-data`,
`prism-dev-postgres-data`, and the corresponding `prism-prod-*` names. Apps attach
only to networks for engines they use, marking those networks external. An unused
PostgreSQL stack/network must not be required to start the MariaDB-based portal.
The app metadata lists both network names; this alone does not attach a service.

Keep volumes project-scoped and avoid fixed `container_name` values. Named
cross-stack data networks are an intentional exception to automatic network
naming; keep their names distinct by environment and engine. Project names do
not isolate host ports, bind paths, or external resources. Configuration variables
alone are not enforcement for reset/deployment safety.

See [Compose project naming](https://docs.docker.com/compose/how-tos/project-name/).

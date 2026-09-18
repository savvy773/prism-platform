# Optional production PostgreSQL

Configuration for the future independent `infra/postgres/compose.yaml` entry
point. Use project `prism-prod-postgres` and network `prism-prod-postgres-data`.

Provision `.env` on the server only for an actual PostgreSQL consumer. Future
`compose.override.yaml` settings include persistent storage, health/restart
policies, and resource limits. Keep credentials, volumes, and native backup/restore
procedures separate from MariaDB and WSL development.

This directory does not install or start PostgreSQL. Ordinary application deploys
must not change this database-server stack. See [database operations](../../../ops/database/README.md).

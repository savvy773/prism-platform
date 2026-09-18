# Optional PostgreSQL

This directory owns an independently operated PostgreSQL Compose stack. Add and
start it only when an application requires it; ERPNext and the current portal
remain MariaDB consumers. This folder is structure/design only, not a runtime.

The future entry point is `infra/postgres/compose.yaml`. Environment settings
belong in `environments/<environment>/postgres/`. Use `prism-dev-postgres` in WSL
and `prism-prod-postgres` on the Ubuntu server, with separate credentials and
project-scoped persistent volumes.

The stack owns its environment-specific PostgreSQL data network. Only its
consuming application services attach to that network as external. Use separate
logical databases/accounts for independently owned apps; application schema
migrations stay beside their source. Do not share MariaDB storage or credentials.

Select and pin a version supported by the actual consuming application. Changing
an app from MariaDB to PostgreSQL is a schema/query/data migration, not merely a
connection-string edit. Do not provision an unused portal or ERPNext database here.

Normal app deployments and resets must not stop this stack or delete its data
volume. Backup/restore must use PostgreSQL-appropriate procedures and be tested
independently of MariaDB. See [database ownership](../../docs/md/DATABASE.md) and
[database operations](../../ops/database/README.md).

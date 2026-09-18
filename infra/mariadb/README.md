# Shared MariaDB

This directory owns the common MariaDB service for Prism Platform. Plan one
MariaDB instance per environment: WSL development and Ubuntu production have
separate instances, credentials, and storage.

`infra/mariadb/compose.yaml` is an independent entry point, not an
include in the root application Compose. Use `prism-dev-mariadb` and
`prism-prod-mariadb` projects with configuration under
`environments/<environment>/mariadb/`. The DB stack owns its data network and
volume; applications attach to that network as external. See [environment mapping](../../environments/README.md).

ERPNext and the portal connect to the same instance using separate databases
and runtime accounts. The current development databases are `erpnext_demo` and `portal_db`.
Portal wiki, schedules, weekly reports, projects, and boards use tables within
the portal database. See [database ownership](../../docs/md/DATABASE.md).

This directory owns the MariaDB Compose definition, health check, private
network connections, persistent volume, and database/account provisioning.
Choose a supported MariaDB version compatible with the selected ERPNext release
and portal driver; pin and test it for both consumers.

ERPNext/Frappe owns its schema migrations. Portal schema migrations and synthetic
seeds belong under `apps/portal/`. Infrastructure provisioning must not manage
application tables.

Stopping either application must keep the shared MariaDB service running. A
module reset must target its database and private application storage, never the
shared MariaDB volume. Database maintenance and outages affect all consumers.

Before production use, implement database-specific backups and isolated restore
tests, including related uploaded files. Keep runtime data and credentials out
of Git. MariaDB 11.8.9 is running in WSL with readiness checks, portal-account provisioning and guarded per-app reset commands. Production recovery automation remains planned.

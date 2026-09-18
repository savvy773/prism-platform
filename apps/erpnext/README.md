# ERPNext Service

ERPNext/Frappe is treated as a replaceable application service with its own runtime dependencies and persistent data.

Principles:
- keep ERPNext-specific Redis, workers, scheduler, site files, and schema migration logic inside this service boundary
- connect to the shared MariaDB service in `infra/mariadb/` using the ERPNext site's own database and account
- do not couple Prism-owned applications directly to ERPNext database tables
- integrate through ERPNext/Frappe APIs, webhooks, or explicit import/export flows
- make local teardown/rebuild easy
- keep production data persistent and independently backed up

This directory contains the running WSL ERPNext demo Compose definition. Use `make erp-demo`, `make stop MODULE=erpnext`, or explicit `make reset-dev MODULE=erpnext`.

See [technical handover](../../docs/html/erpnext-handover.html) for the service tree, storage, commands, Excel and upgrade procedures.

Do not define a second MariaDB instance here. Stopping or resetting ERPNext must
keep the shared MariaDB service and portal database intact. The selected MariaDB
version must be compatible with ERPNext; shared-server upgrades are coordinated
with every consumer. See [database ownership](../../docs/md/DATABASE.md).

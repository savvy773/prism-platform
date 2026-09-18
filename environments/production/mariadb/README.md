# Production database

This folder owns Ubuntu configuration for the independent
`infra/mariadb/compose.yaml` entry point. The Compose project is `prism-prod-mariadb`.

Provision `.env` on the server independently of development. Future
`compose.override.yaml` settings include persistent storage, health/restart
policies, resource limits, and the `prism-prod-mariadb-data` network. Database data stays
in a dedicated Docker volume, not this directory. Host SQL access is not needed
for application connections over the Docker network.

Manage database-server upgrades and recovery separately from application
deployment. Keep separate databases/accounts for ERPNext and the portal; test
backups and restores for both. No database service has been installed or started
by creating this folder.

See [database operations](../../../ops/database/README.md).

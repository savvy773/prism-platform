# Development database

This folder owns WSL configuration for the independent
`infra/mariadb/compose.yaml` entry point. The Compose project is `prism-dev-mariadb`.

Copy `.env.example` to `.env` here. Future `compose.override.yaml` settings include
development resource limits and optional loopback-only SQL access. The database
stack owns the `prism-dev-mariadb-data` network and a project-scoped MariaDB data volume;
the application stack attaches to that network as external.

Server provisioning creates separate ERPNext and portal databases/accounts.
An application reset targets only its logical database and private storage;
never reset it by deleting this stack's shared data volume. No database runtime
or credentials have been provisioned by this directory structure.

See [database ownership](../../../docs/md/DATABASE.md).

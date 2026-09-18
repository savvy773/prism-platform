# Optional development PostgreSQL

Configuration for the future independent `infra/postgres/compose.yaml` entry
point. Use project `prism-dev-postgres` and network `prism-dev-postgres-data`.

Copy `.env.example` to `.env` here only when an app needs PostgreSQL. Future
`compose.override.yaml` settings can add loopback-only SQL access. The stack owns
its data volume and network; consuming apps attach to the network as external.
Application resets must target only their own logical database/private storage.

This directory does not install or start PostgreSQL. ERPNext and the current
portal continue to use MariaDB. See [database ownership](../../../docs/md/DATABASE.md).

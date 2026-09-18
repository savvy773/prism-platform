# Development applications

This folder owns WSL application configuration for the future root `compose.yaml`.
The Compose project is `prism-dev-apps`.

Copy `.env.example` to `.env` here. Future `compose.override.yaml` settings include
source mounts, hot reload, loopback web/debug ports, and the external database
network `prism-dev-mariadb-data`. Keep only application credentials here; database-server
administration credentials belong to the MariaDB configuration.

Start the independent database stack before database-dependent applications.
Application startup must check connectivity and retry; cross-project `depends_on`
is not a startup mechanism. App teardown must not remove the external network or
MariaDB volume. No Compose runtime is implemented yet.

See [environment layout](../../README.md) and [command design](../../../docs/md/COMMANDS.md).

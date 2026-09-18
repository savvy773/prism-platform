# Development: Windows + WSL2

Run Git, package tools, and Docker Compose from WSL2. Store the checkout in the Linux filesystem, for example `~/code/prism-platform`.

Preparation from the repository root:

```bash
cp -n environments/development/apps/.env.example environments/development/apps/.env
cp -n environments/development/mariadb/.env.example environments/development/mariadb/.env
```

Use `apps/` for source mounts, hot reload, and web/debug settings; `mariadb/` for
the independent default DB stack; and `postgres/` for an optional PostgreSQL
consumer. Copy the PostgreSQL example only when needed. Each component will have
its own `compose.override.yaml` when implemented. Bind database/admin host ports
to loopback and use synthetic fixtures. See [project names and networking](../README.md).

The environment is not runnable yet. Follow [the development guide](../../docs/md/DEVELOPMENT.md) as service implementations are added.

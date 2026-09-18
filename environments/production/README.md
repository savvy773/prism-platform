# Production: Ubuntu

Prepare secrets on the server, independently from development.

From the repository root:

```bash
cp -n environments/production/apps/.env.example environments/production/apps/.env
cp -n environments/production/mariadb/.env.example environments/production/mariadb/.env
chmod 600 environments/production/apps/.env environments/production/mariadb/.env
```

Each component has an independent configuration directory: `apps/`, `mariadb/`,
and optional `postgres/`. Provision PostgreSQL configuration only when required.
Future overrides belong in each component's `compose.override.yaml`: pinned
images, restart policies, health checks, persistent storage, and minimal host
ports. Application source must be built into images; avoid development source
mounts and hot reload. Keep DB-server operations separate from app deployments.

This folder does not yet make the platform deployable or production-ready. Follow [the deployment guide](../../docs/md/DEPLOYMENT.md) before adding real data.

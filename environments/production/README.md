# Production: Ubuntu

Prepare secrets on the server, independently from development.

From the repository root:

```bash
cp -n environments/production/.env.example environments/production/.env
chmod 600 environments/production/.env
```

Future production overrides belong in `compose.override.yaml`: pinned images, restart policies, health checks, persistent storage, and minimal published ports. Application source must be built into images; avoid development source mounts and hot reload.

This folder does not yet make the platform deployable or production-ready. Follow [the deployment guide](../../docs/DEPLOYMENT.md) before adding real data.

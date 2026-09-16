# Development: Windows + WSL2

Run Git, package tools, and Docker Compose from WSL2. Store the checkout in the Linux filesystem, for example `~/code/prism-platform`.

Preparation from the repository root:

```bash
cp -n environments/development/.env.example environments/development/.env
```

Future development overrides belong in `compose.override.yaml`: source bind mounts, hot reload, and local debug ports. Bind database/admin ports to loopback when host access is necessary. Use synthetic fixtures and seeds that can recreate a useful test environment.

The environment is not runnable yet. Follow [the development guide](../../docs/DEVELOPMENT.md) as service implementations are added.

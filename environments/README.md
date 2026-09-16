# Environments

Use the same application source and service modules on both hosts. Environment folders contain configuration differences, not copied applications.

| Environment | Host | Compose project | Data policy |
| --- | --- | --- | --- |
| `development/` | Windows PC through WSL2 | `prism-dev` | Synthetic data; deliberate reset allowed |
| `production/` | Ubuntu server | `prism-prod` | Persistent data; backup and verified restore required |

Each folder contains a tracked `.env.example`. Copy it to `.env` in the same folder and provide secrets locally. Never copy development credentials or databases into production.

When services are implemented, add `compose.override.yaml` in each environment folder. Keep root `compose.yaml` as the module assembly. Lifecycle scripts must select the environment file and overlay explicitly; do not rely on the current directory or automatic `.env` discovery.

Compose project names separate project-scoped resources. Do not override this separation with shared volume/network names or fixed `container_name` values. Project names do not isolate published host ports, bind-mount paths, or external resources; configure those separately. Environment variables are configuration, not an enforced reset safeguard.

See [Compose project naming](https://docs.docker.com/compose/how-tos/project-name/).

# Docker, one step at a time

Development happens on your Windows PC inside WSL2. Deployment happens on the Ubuntu server. Commands affect the Docker context selected in the terminal where you run them.

## The basic pieces

| Term | Meaning in this project |
| --- | --- |
| Image | Packaged application used to create containers |
| Container | A running or stopped instance of an image |
| Volume | Storage that can outlive a container, such as database files |
| Docker daemon | The engine managing containers on a host |
| Compose | Configuration and commands for a group of containers |
| Module | Our grouping of an app and its private dependencies, such as ERPNext |

A repository folder contains source/configuration; replacing it does not replace
a running container or erase a database. The intended flow is source change →
image rebuild → container recreation. Persistent volumes remain separate.
Development source mounts can show code edits immediately through hot reload.

All applications live under `apps/`; infrastructure such as DB engines lives
under `infra/`. A folder is an ownership boundary, not a container count.
See the [interactive plan](../html/structure-plan.html) for the top-down tree.

ERPNext uses multiple application containers such as web/backend, Redis,
scheduler, and workers. MariaDB is a shared infrastructure container used by
ERPNext and the portal, with separate databases/accounts. Wiki is part of the
portal. Stopping ERPNext keeps MariaDB and the portal running; ERP-dependent
features will be unavailable until ERPNext starts again.

## Step 1: Check your Windows development environment

Open your WSL Ubuntu terminal and run:

```bash
docker --version
docker compose version
docker context show
docker ps
```

These commands only inspect the environment. If a command fails, keep the exact error and resolve that before continuing. Installation and startup instructions depend on whether you use Docker Desktop's WSL integration or an Engine installed inside WSL.

## Step 2: Prepare the development checkout

After Docker access is confirmed, use a checkout inside the WSL Linux filesystem, such as `~/code/prism-platform`. Follow [DEVELOPMENT.md](DEVELOPMENT.md) to prepare the development environment file. Never copy the server's production secrets into it.

## Step 3: Start the implemented modules

Run `make up`, then `make ps`. Portal is at http://prismjuns:3000 and ERPNext at http://prismjuns:8080. Use `make down` to stop all apps and DB while retaining data. See [ERP handover](../html/erpnext-handover.html) for service names and request flow.

## Step 4: Learn stop versus reset

Apps, MariaDB, and optional PostgreSQL use independent Compose projects. Taking
down the app project leaves the DB projects running. Start only the engines
needed by the apps; PostgreSQL is optional for the current MariaDB consumers.

| Operation | Expected effect |
| --- | --- |
| Stop selected services | Stops those containers, retaining their storage |
| Start selected services | Starts the selected module again |
| Rebuild image | Creates a new image from source; running containers need recreation to use it |
| Recreate containers | Replaces containers; persistent data needs correctly mounted storage |
| Docker Compose `down` (different from our `make down`) | Removes the project's containers and networks; retains volumes by default |
| `down -v` | Also removes managed project volumes; can delete databases |
| Stop Docker daemon | Normally stops all its running containers, including other projects |

Implemented shortcuts are `make rebuild MODULE=portal` for an image rebuild plus
container recreation, and `make reset-dev MODULE=portal` for deliberately clearing
that app's development data. Both run only against the guarded WSL development target. A folder replacement,
image rebuild, and data reset are three different operations.

Containers also differ from published ports: multiple app containers can share
one browser entry through a reverse proxy. The intended production entry is
HTTPS on port 443, with hostname routing to portal and ERPNext. Database ports
stay internal. There are currently 10 steady containers: ERP 7, portal 1, proxy 1, MariaDB 1. Production TLS/hostnames are planned.

Use `make stop MODULE=erpnext` to stop the full ERP module. Do not use whole-project teardown to stop only ERPNext. Keep the shared proxy and unrelated databases running when their consumers need them.

For a module reset, keep shared MariaDB and its volume. Reset only the selected
application database and private storage; deleting the MariaDB volume would
delete every application database it holds. See [database ownership](DATABASE.md).

Docker references: [Compose teardown](https://docs.docker.com/reference/cli/docker/compose/down/), [volume persistence](https://docs.docker.com/engine/storage/volumes/), and [daemon shutdown](https://docs.docker.com/engine/daemon/live-restore/).

## Step 5: Verify data, then deploy

Use synthetic records to prove that normal restart/recreation preserves data and an intentional development reset clears it. Test that stopping ERPNext leaves wiki usable. Implement and test database/file backups before introducing real company data, then follow [DEPLOYMENT.md](DEPLOYMENT.md).

The existing [code backup](../../ops/backup/README.md) protects source files and Git history. It does not back up a running ERP or wiki database.

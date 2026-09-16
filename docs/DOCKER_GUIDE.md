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

ERPNext may need multiple containers: web/backend, database, Redis, scheduler, and workers. Wiki is a separate module. The planned structure allows ERPNext to stop while wiki remains available. ERP-dependent features will be unavailable until ERPNext starts again.

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

## Step 3: Implement and start one module

The repository has no runnable Compose definition yet. First implement one selected module, document its exact service names, and validate its configuration. Then start it in development and check its health and logs before introducing other modules.

## Step 4: Learn stop versus reset

| Operation | Expected effect |
| --- | --- |
| Stop selected services | Stops those containers, retaining their storage |
| Start selected services | Starts the selected module again |
| Recreate containers | Replaces containers; persistent data needs correctly mounted storage |
| Whole-project `down` | Removes the project's containers and networks; retains volumes by default |
| `down -v` | Also removes managed project volumes; can delete databases |
| Stop Docker daemon | Normally stops all its running containers, including other projects |

We will use exact service names once the modules exist. Do not use whole-project teardown to stop only ERPNext. Keep the shared proxy and unrelated databases running when their consumers need them.

Docker references: [Compose teardown](https://docs.docker.com/reference/cli/docker/compose/down/), [volume persistence](https://docs.docker.com/engine/storage/volumes/), and [daemon shutdown](https://docs.docker.com/engine/daemon/live-restore/).

## Step 5: Verify data, then deploy

Use synthetic records to prove that normal restart/recreation preserves data and an intentional development reset clears it. Test that stopping ERPNext leaves wiki usable. Implement and test database/file backups before introducing real company data, then follow [DEPLOYMENT.md](DEPLOYMENT.md).

The existing [code backup](../ops/backup/README.md) protects source files and Git history. It does not back up a running ERP or wiki database.

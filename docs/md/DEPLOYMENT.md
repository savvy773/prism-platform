# Deployment to Ubuntu

## Target

Ubuntu 26.04 LTS runs Docker Engine and Docker Compose. Deploy the same committed source used in WSL2, with independently provisioned production configuration and persistent data.

The current server checkout is `/home/suby/code/prism-platform`. Scripts must resolve the repository root instead of assuming a particular username or checkout path.

## Delivery from WSL

`su` is the SSH alias for the deployment host. Development and repeated local
testing happen in WSL. GitHub (`savvy773/prism-platform`) is the code handoff:

```text
WSL: run/test → git commit → git push → GitHub
                                         ↓ SSH: fetch the tested commit
                                      su: build/start → health checks
```

Use Git + SSH for code delivery. `gh` supports PRs and GitHub API operations;
SCP is optional for separately provisioned files outside Git, such as a server
secret file. Never copy the development `.env`, database, or local source tree
over the deployment checkout as the normal code deployment mechanism.

Available read-only checks from WSL:

```bash
make doctor-remote
ssh su 'git -C ~/code/prism-platform status --short --branch'
ssh su 'git -C ~/code/prism-platform log -1 --format="%h %s"'
```

The future `make deploy` entry point belongs in the root Makefile, with its
implementation under `ops/deploy/`. Require an explicit tested commit available
on the GitHub remote, a clean server checkout, and a production Docker target.
Deploy that commit, not whatever branch tip happens to exist later. Record the
deployed revision and check service health after startup. Running `make git`
alone must not trigger deployment.

## Preparation available now

From the repository root:

```bash
git status
docker context show
docker compose version
cp -n environments/production/apps/.env.example environments/production/apps/.env
cp -n environments/production/mariadb/.env.example environments/production/mariadb/.env
chmod 600 environments/production/apps/.env environments/production/mariadb/.env
```

The example contains environment metadata only. Provision service credentials and storage when each module is implemented. No deployment has been performed by establishing this directory structure.

Run this preparation on `su`. Provision PostgreSQL's environment file only when
a consumer needs it. Apps use `prism-prod-apps`; DB servers use independent
`prism-prod-mariadb` and optional `prism-prod-postgres` projects. Ordinary app
deployment must not stop or recreate the DB-server projects. Provisioning or
upgrading an engine is a separate operation under `ops/database/`.

## Deployment procedure to implement

1. Select and record a reviewed Git commit or release; require a clean deployment checkout.
2. Provision production secrets and persistent storage independently of development.
3. Select the production environment, project, and Docker context explicitly.
4. Validate the assembled Compose configuration without publishing secret-bearing output.
5. Back up affected stateful services and verify the migration/recovery plan before upgrades.
6. Pull/build pinned images, run documented migrations, and start the selected modules.
7. Verify health, application read/write behavior, routing, and recovery readiness.

Production must not use source bind mounts, development hot reload, or destructive development resets. Rolling back application code does not automatically roll back database changes.

## Module operation

ERPNext and its private Redis/workers/site files form one module. The portal,
including its wiki and business features, forms another. Both connect to shared
MariaDB with separate databases/accounts. Operators must be able to stop an
application with explicitly named services while leaving the shared database
and other application running. The exact commands will be documented with the
implemented service names; do not invent commands before the Compose model exists.

Shared proxy/database outages affect their consumers, and daemon/host shutdown can affect every module. Separate module ownership is operational isolation, not host-level high availability.

## Recovery

Backup implementation belongs in `ops/backup/`, recovery implementation in `ops/restore/`. Store backup archives outside the checkout and retain an off-host copy. Verify database records and uploaded files through the application after a restore.

Back up ERPNext and portal databases with their corresponding site/upload files.
Test application-specific restores without overwriting the other database. Shared
MariaDB server upgrades and disaster recovery must cover every consumer; see
[database ownership](DATABASE.md).

The platform is not ready for real company data until these runtime and recovery procedures are implemented and tested.

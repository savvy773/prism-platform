# Deployment to Ubuntu

## Target

Ubuntu 24.04 LTS runs Docker Engine and Docker Compose. Deploy the same committed source used in WSL2, with independently provisioned production configuration and persistent data.

The current server checkout is `/home/suby/code/prism-platform`. Scripts must resolve the repository root instead of assuming a particular username or checkout path.

## Preparation available now

From the repository root:

```bash
git status
docker context show
docker compose version
cp -n environments/production/.env.example environments/production/.env
chmod 600 environments/production/.env
```

The example contains environment metadata only. Provision service credentials and storage when each module is implemented. No deployment has been performed by establishing this directory structure.

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

ERPNext and its private dependencies form one module. Wiki and its dependencies form another. Operators must be able to stop one module with explicitly named services while leaving others running. The exact commands will be documented with the implemented service names; do not invent commands before the Compose model exists.

Shared proxy/database outages affect their consumers, and daemon/host shutdown can affect every module. Separate module ownership is operational isolation, not host-level high availability.

## Recovery

Backup implementation belongs in `ops/backup/`, recovery implementation in `ops/restore/`. Store backup archives outside the checkout and retain an off-host copy. Verify database records and uploaded files through the application after a restore.

The platform is not ready for real company data until these runtime and recovery procedures are implemented and tested.

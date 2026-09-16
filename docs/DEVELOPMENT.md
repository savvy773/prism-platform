# Development on Windows through WSL2

## Workspace

Run Linux development commands in WSL2. Keep the checkout at a Linux path such as `~/code/prism-platform`; Microsoft recommends the WSL filesystem for Linux tooling performance ([filesystem guidance](https://learn.microsoft.com/en-us/windows/wsl/filesystems)). Use a WSL-connected editor when editing from Windows.

Use Git and Docker Compose from the same WSL environment. Confirm which Docker context is selected before any lifecycle command; a remote production context must never be used for development resets.

```bash
cd ~/code/prism-platform
git status
docker context show
docker compose version
cp -n environments/development/.env.example environments/development/.env
```

This prepares configuration only. The repository does not yet contain runnable services.

## Development conventions

- Keep Bash scripts and configuration in LF format; `.gitattributes` and `.editorconfig` establish this across hosts.
- Keep source, module Dockerfiles, configuration, migrations, and synthetic seeds in Git.
- Keep secrets in ignored environment files; keep database files and uploads in explicitly defined storage.
- Add the portal first under `apps/portal/`; dashboards are portal features initially.
- Put ERPNext and wiki runtime definitions only in their respective `services/` folders.
- Place reusable API adapters in `packages/integrations/` and business automation execution in `services/automation/`.
- Add package manifests and a pnpm lockfile when actual application code is introduced.

## Lifecycle contract to implement

`ops/scripts/` will provide explicit environment selection and start, stop, status, logs, and development reset operations. Keep ordinary stop separate from deleting data. Support module-level operation so ERPNext can stop while the wiki remains available.

A reset must validate the development project, Docker target, and selected storage. Never use host-wide cleanup or Docker data-directory deletion as a project reset.

For the first implemented service, verify: start → write synthetic data → recreate containers → verify retained data → reset development → recreate from seeds. Then test module independence as more services are added.

# Development on Windows through WSL2

## Workspace

Run Linux development commands in WSL2. Keep the checkout at a Linux path such as `~/code/prism-platform`; Microsoft recommends the WSL filesystem for Linux tooling performance ([filesystem guidance](https://learn.microsoft.com/en-us/windows/wsl/filesystems)). Use a WSL-connected editor when editing from Windows.

Use Git and Docker Compose from the same WSL environment. Confirm which Docker context is selected before any lifecycle command; a remote production context must never be used for development resets.

```bash
cd ~/code/prism-platform
git status
docker context show
docker compose version
make setup-dev
make up
make ps
```

Portal, ERPNext and independent MariaDB run in WSL. setup-dev generates local secrets and preserves existing values.
Prepare `environments/development/postgres/.env` from its example only when a
consumer requires PostgreSQL. Each engine has an independent Compose project;
application operations must leave its server and persistent volume intact.

## Daily commands

Use the root `Makefile` as the command entry point. Implement scripts under
`scripts/`, deployment operations under `ops/deploy/`, and application tests
under `tests/` or their owning module. Keep executable helpers in this single root scripts directory.
See the [command design](COMMANDS.md) for available commands and planned targets.

```bash
make                       # Available commands
make doctor                # Local tools and local Docker daemon
make doctor-remote         # Same checks through SSH to su
git status
git diff
./scripts/git-mgr.sh        # Stage all changes, auto-message commit, and push
# Equivalent: make git or make save
```

The script stages all changes, respecting `.gitignore` for untracked files,
commits with an automatic timestamp message, and pushes the current branch to
the same branch on `origin`, setting its upstream. It rejects detached HEAD and
never force-pushes. With no changes, it only pushes. After a failed push, resolve
the error and rerun: the local commit remains. It does not run tests or deploy.

Use `gh` directly for GitHub operations, for example `gh pr status` or
`gh pr create` when a feature branch is ready for review. GitHub Git transport
uses SSH; `gh` uses its own authenticated API connection.

The intended development loop is local run → test → review → commit/push →
deploy the tested commit to `su`. Add `make dev`, `make test`, and `make deploy`
when their real service implementations exist. A tool check is not an application
test or a deployment gate.

## Run and test

Use [access and ports](ACCESS.md), [daily commands](COMMANDS.md), and
[ERP technical handover](../html/erpnext-handover.html).

- `make up/down/ps`: full stack start / stop / status. Stop retains data.
- `make dev`: portal + independent MariaDB.
- `make erp-demo`: ERP and its dependencies; existing site retained.
- `make stop MODULE=erpnext`: stop ERP, keep portal and DB.
- `make rebuild MODULE=portal`: rebuild/recreate the portal, keep records.
- `make reset-dev MODULE=portal` or `MODULE=erpnext`: explicitly erase that app's practice data.
- `make test`: portal types/input validation and stack upgrade failure boundaries.
- `make check-updates` / `make update-stack`: compatible version check / application.

Source mounts provide hot reload. Browser URLs use `prismjuns` or the PC IP.
The portal is an unauthenticated demo. Ubuntu production deployment and
Cloudflare Tunnel remain planned; current lifecycle scripts reject production.

## Toolchain baseline

Both hosts were aligned on 2026-09-18. Node.js follows the latest LTS line;
the other development tools use stable releases. Runtime versions are recorded
in `.node-version` and `.python-version`; the files do not change shell versions
automatically. The package manager is pinned in package.json and dependencies in pnpm-lock.yaml.

| Tool | WSL and `su` |
| --- | --- |
| Ubuntu | 26.04.1 LTS |
| Git | 2.55.0 |
| GitHub CLI | 2.101.0 |
| Node.js | 24.21.0 LTS |
| npm | 12.0.2 |
| pnpm | 12.4.2 |
| uv | 0.12.16 |
| Development Python | 3.14.7 |
| Docker Engine | 29.8.1 |
| Docker Compose | 5.5.1 |

Git uses the upstream Git PPA; Docker uses its official apt repository. Node.js
is installed from checksum-verified official Linux archives under
`~/.local/share/prism-dev-tools/`, exposed through `~/.local/bin/`. npm and pnpm
are installed in that Node prefix. WSL's `gh` uses an official release archive;
`su` uses the GitHub CLI apt repository. uv manages development Python without
replacing `/usr/bin/python3`. Native build tools, Make, and ripgrep are installed
on both hosts.

Keep `~/.local/bin` first in the development shell's PATH. On `su`, this also
applies to non-interactive SSH commands. After updates, open a new terminal or
run `hash -r`, then use `make doctor` and `make doctor-remote` to inspect the tools
that actually run. Upgrade the baseline deliberately on both hosts together.

## Development conventions

- Keep Bash scripts and configuration in LF format; `.gitattributes` and `.editorconfig` establish this across hosts.
- Keep source, module Dockerfiles, configuration, migrations, and synthetic seeds in Git.
- Keep secrets in ignored environment files; keep database files and uploads in explicitly defined storage.
- Add the portal first under `apps/portal/`; dashboards are portal features initially.
- Put ERPNext runtime definitions in `apps/erpnext/`, common MariaDB in `infra/mariadb/`, and the owned wiki/business features inside `apps/portal/`.
- Place reusable API adapters in `packages/integrations/` and business automation execution in `apps/automation/`.
- Keep package versions and the pnpm lockfile synchronized.

## Implemented lifecycle contract

`scripts/` provides explicit environment selection and start, stop, status, logs, and development reset operations. Keep ordinary stop separate from deleting data. Support module-level operation so ERPNext can stop while the wiki remains available.

A reset must validate the development project, Docker target, and selected storage. Never use host-wide cleanup or Docker data-directory deletion as a project reset.

MariaDB is shared within each environment, with separate application databases
and accounts. Verify that a portal reset leaves ERPNext records intact, and vice
versa. Keep application schema migrations and seeds with their owning module.

For the first implemented service, verify: start → write synthetic data → recreate containers → verify retained data → reset development → recreate from seeds. Then test module independence as more services are added.

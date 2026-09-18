# Database Operations

Database-server lifecycle is independent from application lifecycle. Keep future
DB-specific scripts here; definitions belong in `infra/<engine>/`, and environment
configuration belongs in `environments/<environment>/<engine>/`. Supported design
targets are `mariadb` (current applications) and `postgres` (optional consumers).

Planned entry points (not implemented):

| Command | Scope |
| --- | --- |
| `make db-up ENV=development DB=mariadb` | Start the selected local DB stack and check health |
| `make db-status ENV=development DB=mariadb` | Inspect the selected DB stack |
| `make db-logs ENV=development DB=mariadb` | Read logs for the selected DB stack |
| `make db-stop ENV=development DB=mariadb` | Stop DB containers while retaining volume and network |

Require an explicit environment and engine; use `DB=postgres` for PostgreSQL.
Map these inputs to the fixed projects in `environments/README.md`. Production
variants additionally require an explicit SSH target and use the server's local
Docker socket. DB maintenance must not be hidden inside `make deploy` or app
stop/reset commands. Stopping DB interrupts every database consumer.

Future scripts must validate the environment/project mapping, exact Compose and
environment paths, Docker endpoint, and database network before mutations. An
environment variable alone is not sufficient validation. Do not use `down -v` or
global prune. Application reset remains a separate operation targeting an
explicit application database and private storage.

Backups and recovery belong in `ops/backup/` and `ops/restore/`, with distinct
MariaDB/PostgreSQL procedures. Pin and validate server upgrades against every
consumer with a tested backup/recovery plan.

See [command design](../../docs/md/COMMANDS.md), [database ownership](../../docs/md/DATABASE.md),
and [Compose boundaries](../compose/README.md).

# Database ownership

## Decision

Prism Platform uses MariaDB for ERPNext and the current portal. PostgreSQL is an
optional independent stack for an application that requires it. DB engines run
as separate Compose projects from the applications and from each other. This
supersedes the earlier PostgreSQL exclusion; it does not switch current app DBs.
The wiki remains an owned portal feature. MariaDB 11.8.9 now runs in WSL; PostgreSQL remains optional and unimplemented.

## One instance per environment, separate application databases

```text
WSL development
├── prism-dev-apps          # ERPNext, portal, app dependencies
├── prism-dev-mariadb       # ERPNext DB + portal DB, separate accounts
└── prism-dev-postgres      # Optional: actual consumer's DB/account

Ubuntu production
├── prism-prod-apps
├── prism-prod-mariadb      # Independent production databases and credentials
└── prism-prod-postgres     # Optional: separate production storage and accounts
```

Sharing an instance does not mean sharing ERPNext tables. `erpnext_db` and
`portal_db` are explanatory names; the actual ERPNext database name is part of
the site provisioning contract. Restrict runtime accounts to their owning
database. Provisioning privileges are a separate concern from runtime access.

Features within the portal share one portal database and common users/teams.
Separately deployed applications receive their own database/account unless an
explicitly documented ownership contract justifies shared application tables.
Additional databases can live on this MariaDB instance if their requirements
are compatible. Separate projects should own their own runtime, credentials,
storage, and lifecycle rather than silently using this instance.

## Repository ownership

| Owner | Responsibility |
| --- | --- |
| `infra/mariadb/`, `infra/postgres/` | Independent server definitions, health, storage, networks, provisioning |
| `environments/<environment>/<component>/` | Separate apps/MariaDB/PostgreSQL environment configuration |
| `ops/database/` | DB-server lifecycle, separate from app deployment |
| `apps/erpnext/` | Site configuration, ERPNext/Frappe schema migrations, private Redis/workers/site files |
| `apps/portal/` | Portal schema migrations, synthetic seeds, database access, wiki and business features |
| `packages/integrations/` | ERPNext API clients, webhooks, and explicit import/export contracts |
| `ops/backup/`, `ops/restore/` | Consistent database/file backup and recovery procedures |

Keep DB runtimes outside root app assembly and `apps/erpnext/`. Each DB stack
owns its data network; consumers attach as external. Use the fixed environment
and engine-specific names in [environment configuration](../../environments/README.md).
Apps must check DB readiness and retry connections. Do not require PostgreSQL
or its network for MariaDB-only apps. Do not expose DBs through the web proxy.
Loopback-only development SQL access can be added when needed.

Pin a MariaDB version supported by the chosen ERPNext release and portal
driver. Test upgrades against both applications. Do not assume the newest
MariaDB release is automatically compatible with every consumer.

PostgreSQL uses its own image version, accounts, volume, and native backup/restore
procedures. Select it based on actual application support. Migrating an existing
app between engines requires schema/query/data validation, not just a URL change.

## Integration and file storage

Use ERPNext APIs to integrate with ERP data instead of modifying its tables from
the portal. Identify the authoritative application for shared business records
such as employees and projects before introducing synchronization. Store external
record IDs and handle retries/duplicates when synchronization is implemented.

Portal document content and file metadata belong in its database. Uploaded file
bytes belong in persistent file storage with application access checks. Back up
the database and related files as a consistent application dataset.

## Lifecycle and reset contract

- Stopping ERPNext stops its application processes and private dependencies;
  keep MariaDB, the portal, and the proxy running.
- Stopping the portal keeps MariaDB and ERPNext running. Wiki is part of the
  portal, so stopping the portal also stops the wiki.
- App-project teardown stops apps but leaves the separate DB projects, external
  networks, and DB volumes intact. DB maintenance is an explicit separate operation.
- MariaDB restart, outage, resource exhaustion, or upgrade can affect all its
  consumers. Logical database separation does not provide availability isolation.
- A development module reset requires an explicit target such as `MODULE=portal`
  or `MODULE=erpnext`, the WSL host, local Docker socket, and development project.
  Reset only that module's database and private storage, then migrate and seed
  through the owning application. Keep other databases and accounts intact.
- Never implement a module reset by deleting the shared MariaDB volume or using
  whole-project `down -v`. Production is never a development reset target.

Development resets are implemented in `scripts/dev.py`; production deployment
remains planned. Reset verification must preserve a record in the other module.
Back up each application's database and files before migrations; restore into an
isolated target first. Shared-instance disaster recovery must account for every
application database and its access configuration.

Optional PostgreSQL follows the same lifecycle boundaries, with its own native
backup/restore. No ordinary app command removes either database-server volume.

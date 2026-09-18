# Infrastructure

Shared infrastructure used by Prism Platform.

Planned areas:
- `mariadb/` — one shared instance per environment; separate ERPNext and portal databases/accounts
- `postgres/` — optional PostgreSQL, independently operated for apps that require it
- `redis/` — shared cache/queue only where a Prism service explicitly needs it
- `proxy/` — internal reverse-proxy entry point
- `cloudflare/` — Cloudflare Tunnel configuration added later
- `docker/` — shared Docker/Compose fragments and network conventions

Infrastructure must remain reproducible from Git configuration. Runtime data, secrets, and Docker volumes are not committed.

Each database engine has its own Compose entry point and project, excluded from
root application assembly. Keep DB stacks independent of app stop/reset operations.
Their volumes may contain multiple application databases and must not be deleted
to reset one app. MariaDB is the default; PostgreSQL is optional. See
[database ownership](../docs/md/DATABASE.md).

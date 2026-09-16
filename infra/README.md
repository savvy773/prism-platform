# Infrastructure

Shared infrastructure used by Prism Platform.

Planned areas:
- `postgres/` — shared PostgreSQL for Prism-owned applications and data
- `redis/` — shared cache/queue only where a Prism service explicitly needs it
- `proxy/` — internal reverse-proxy entry point
- `cloudflare/` — Cloudflare Tunnel configuration added later
- `docker/` — shared Docker/Compose fragments and network conventions

Infrastructure must remain reproducible from Git configuration. Runtime data, secrets, and Docker volumes are not committed.

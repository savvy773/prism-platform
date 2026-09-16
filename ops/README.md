# Operations

Operational workflows for creating, destroying, resetting, deploying, backing up, restoring, and inspecting the platform.

Planned areas:
- `scripts/` — local lifecycle commands such as up/down/reset/logs
- `deploy/` — Ubuntu deployment procedures and later automation
- `backup/` — backup definitions and scripts
- `restore/` — restore procedures and verification
- `monitoring/` — health/observability configuration when needed

Development operations may be destructive. Production operations must be explicitly non-destructive unless a procedure clearly says otherwise.

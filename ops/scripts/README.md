# Lifecycle Scripts

Local and server lifecycle helpers live here.

Planned commands:
- `up.sh` — start development stack
- `down.sh` — stop stack without deleting persistent data
- `reset.sh` — destructive development reset and rebuild
- `logs.sh` — grouped service logs
- `status.sh` — container/service status

Scripts must fail safely and make destructive behavior obvious. `reset.sh` must never silently target production.

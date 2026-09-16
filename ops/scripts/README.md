# Lifecycle Scripts

Local and server lifecycle helpers live here.

Planned commands:
- `up.sh` — start development stack
- `down.sh` — stop stack without deleting persistent data
- `reset.sh` — destructive development reset and rebuild
- `logs.sh` — grouped service logs
- `status.sh` — container/service status

Scripts must fail safely and make destructive behavior obvious. `reset.sh` must never silently target production.


Implementation is pending. Scripts must resolve the repository root and explicitly select `environments/development/` or `environments/production/`, the Compose project, and Docker target. Validate the target before any reset; refuse production and avoid host-wide cleanup.

Support module-level start/stop using complete, explicit service lists. For example, stopping the ERPNext module must account for its workers and scheduler without stopping wiki, portal, proxy, or unrelated database services. Record actual service names when Compose definitions are implemented.

# Integrations

Reusable integration clients and adapters between Prism applications and external/internal systems.

Examples:
- ERPNext API clients
- import/export adapters
- contracts and helpers for synchronization jobs
- webhook payload validation

Keep integration boundaries explicit. Prefer APIs and documented data contracts over direct cross-application database coupling.

This is a source package, not a running service. HTTP webhook handlers belong in the consuming app; background job execution belongs in a worker such as `services/automation/`. Keep credentials in runtime configuration.

# Compose Assembly

The planned root `compose.yaml` assembles modules using Compose `include`. Runtime definitions belong to their owner, for example `services/erpnext/compose.yaml`, `services/wiki/compose.yaml`, and `apps/portal/compose.yaml`.

Environment overlays belong at `environments/development/compose.override.yaml` and `environments/production/compose.override.yaml`. These Compose files are not implemented yet. Add them with a working module, not empty service placeholders.

Use unique service names in the assembled model and project-scoped storage/networks. Preserve module boundaries: wiki and portal must not depend on ERPNext's private database or Redis. Keep database services off shared ingress networks unless there is a specific need.

Use profiles for optional tools, not required dependencies. Define module-level start/stop operations with explicit service lists so an ERP outage does not stop unrelated apps. Whole-project `down` removes the assembled project's containers and is not appropriate for stopping ERP alone.

Lifecycle scripts must explicitly select environment files, overlays, and the Docker target. Validate paths and merges with `docker compose config` when definitions exist; avoid emitting resolved secrets into logs.

A replacement should primarily affect the module directory, assembly, routing, and integration adapters. See [architecture](../../docs/ARCHITECTURE.md).

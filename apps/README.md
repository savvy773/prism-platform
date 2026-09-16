# Applications

Prism-owned deployable applications live here.

Initial application:
- `portal/` — internal entry point, dashboards, forms, and operational views

Keep dashboards inside the portal until a separate deployment is justified. ERPNext and wiki belong in `services/`; reusable API adapters belong in `packages/integrations/`.

Each app owns its source, tests, Dockerfile, and module Compose definition when implemented. Shared infrastructure belongs in `infra/`, operational procedures in `ops/`, and environment configuration in `environments/`.

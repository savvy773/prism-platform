# Shared Packages

Shared source packages used only by Prism-owned applications.

Current package locations:
- `ui/` — shared CSS tokens already consumed by the HTML plan; components and patterns later
- `integrations/` — reusable API clients, adapters, and integration contracts
- `config/` — shared TypeScript, linting and build configuration

The integration/configuration implementations are planned. Add these other
packages only when shared consumers exist:
- `types/` — shared domain-neutral TypeScript types/contracts
- `api-client/` — generated or handwritten API clients when stable contracts exist

Do not place vendor-service runtime configuration here. Shared packages are compile-time/source-level dependencies, not hidden runtime coupling.

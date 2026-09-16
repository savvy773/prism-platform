# Shared Packages

Shared source packages used only by Prism-owned applications.

Planned packages:
- `ui/` — design system components, patterns and styles
- `integrations/` — reusable API clients, adapters, and integration contracts
- `config/` — shared TypeScript, linting and build configuration
- `types/` — shared domain-neutral TypeScript types/contracts
- `api-client/` — generated or handwritten API clients when stable contracts exist

Do not place vendor-service runtime configuration here. Shared packages are compile-time/source-level dependencies, not hidden runtime coupling.

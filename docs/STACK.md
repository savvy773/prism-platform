# Prism Platform - Technology Stack

## Goals

The stack should optimize for:
- modular replacement of services
- Docker-first development and deployment
- low coupling between vendor products and Prism-owned code
- maintainability by a small team
- clear upgrade paths
- reusable design and application conventions

## Platform Stack

### Runtime and packaging
- Docker Engine
- Docker Compose v2
- Compose `include` for modular service composition
- Compose profiles for optional development/debug services

Each deployable module owns its own `compose.yaml` where practical. The root Compose model only assembles modules.

### Custom web application
- Next.js (App Router)
- React
- TypeScript
- Node.js current supported LTS compatible with the selected Next.js release
- pnpm workspaces
- Turborepo for monorepo task orchestration when the custom codebase grows

### UI / design system
- Tailwind CSS v4
- shadcn/ui as owned component source, not a black-box runtime dependency
- CSS variables/design tokens for color, spacing, radius, typography and theme
- Lucide icons unless a product-specific reason requires another set

Shared UI belongs in `packages/ui` and should be consumed by Prism-owned applications.

### Data
- PostgreSQL for Prism-owned application data
- ERPNext keeps its own application-specific database stack and must not depend on the shared Prism PostgreSQL instance
- Redis only when a service has an explicit cache/queue/session requirement

### Edge / routing
- Traefik as the preferred Docker-native reverse proxy
- routing declared close to services with Docker labels where practical
- Cloudflare Tunnel added later as an external ingress layer

Traefik is an implementation choice, not an application dependency. Applications should only assume normal HTTP routing.

## Application Boundaries

### Prism-owned code
Lives under `apps/` and `packages/`.

### Replaceable vendor services
Lives under `services/`.

Examples:
- ERPNext
- wiki / knowledge product

### Shared infrastructure
Lives under `infra/`.

Examples:
- PostgreSQL
- Redis
- Traefik
- Cloudflare Tunnel

## Integration Rule

Prefer stable interfaces:
- HTTP APIs
- OpenAPI contracts
- webhooks
- explicit import/export formats
- queues only when required

Avoid direct cross-application database coupling.

## Versioning Rule

Do not use floating container tags such as `latest` for production. Pin major/minor or immutable image versions according to each service's upgrade policy.

Development may move faster, but upgrades should still be deliberate and documented.

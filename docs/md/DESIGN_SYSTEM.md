# Prism Platform - Design System

## Purpose

Prism-owned web applications should look and behave like one platform even when the backend services are separate products.

## Foundation

- TypeScript
- React / Next.js
- Shared plain CSS tokens (Tailwind CSS is optional future work)
- Shared primitives when needed (shadcn/ui is not yet installed)
- CSS-variable design tokens
- Lucide icons

## Shared package

Reusable UI lives under `packages/ui`.

Suggested internal layout:

```text
packages/ui/
├── src/
│   ├── components/
│   ├── patterns/
│   ├── hooks/
│   ├── lib/
│   └── styles/
│       ├── globals.css
│       └── tokens.css
├── components.json
└── package.json
```

## Design tokens

Keep application branding in tokens rather than scattering literal values through components.

Token groups:
- color
- typography
- spacing
- radius
- shadows
- motion
- layer/z-index

This allows the visual design to evolve without rewriting every screen.

The initial shared `packages/ui/src/styles/tokens.css` now supplies tokens to the
portal and all HTML guides. Documentation-specific layout and interactions live in
`docs/html/assets/`. Product components reuse the shared tokens; do not
import documentation chart layouts into app UI. The portal currently implements the basic records UI.

Keep reusable compiler/lint/build defaults in `packages/config/`. Use current
stable versions and supported LTS runtimes, pin compatible versions, and validate
upgrades across consumers. A modern design also preserves responsive layouts,
readable typography, keyboard access, and consistent states across features.

## Component layers

1. `components/`: primitives such as Button, Input, Dialog, Table.
2. `patterns/`: business-neutral compositions such as DataTable, PageHeader, FilterBar, EmptyState, MetricCard.
3. Application-specific components remain inside each app.

## ERPNext and vendor UI

Do not attempt to force vendor applications to share the same component runtime. Integrate branding through supported theme/configuration mechanisms where practical and keep Prism's main portal visually consistent.

## Accessibility and maintainability

- preserve keyboard navigation
- use semantic HTML
- prefer accessible primitives
- avoid one-off component variants when a reusable pattern exists
- keep UI source owned in the repository so components can be modified or replaced later

## Readable Korean typography

Use local Pretendard Variable from `packages/ui/src/fonts/`, with its OFL license.
The shared token stylesheet loads it without an external font CDN. Body/detail
text uses readable sizes and contrast; diagrams retain a minimum fitting zoom
and horizontal scrolling instead of shrinking all text to fit a large tree.
ERPNext vendor UI changes require supported ERP theme/custom-app mechanisms.

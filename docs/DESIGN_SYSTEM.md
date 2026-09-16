# Prism Platform - Design System

## Purpose

Prism-owned web applications should look and behave like one platform even when the backend services are separate products.

## Foundation

- TypeScript
- React / Next.js
- Tailwind CSS v4
- shadcn/ui component source
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

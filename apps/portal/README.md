# Prism Portal

The Prism Portal is the owned internal web entry point for the platform.

Target stack:
- Next.js App Router
- React
- TypeScript
- shared `packages/ui` design system
- Tailwind CSS v4
- shadcn/ui source components

Responsibilities:
- unified navigation to ERP, wiki and internal tools
- dashboards and operational views
- Prism-owned forms/workflows
- presentation of selected data through stable APIs

Keep vendor integrations behind adapters. The portal must not query ERPNext or wiki database tables directly.

Start with Next.js server capabilities as the UI/BFF layer. Introduce a separate API service only when background jobs, integration complexity, independent scaling, or ownership boundaries justify it.

# Shared UI Package

Shared design-system source for Prism-owned web applications.

Target stack:
- React
- TypeScript
- Tailwind CSS v4
- shadcn/ui source components
- CSS-variable design tokens
- Lucide icons

Expected structure:

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

Keep primitive components generic. Business-specific UI stays in the consuming application.

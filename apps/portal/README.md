# Prism Portal

The Prism Portal is the owned internal web entry point for the platform.

Current stack:
- Next.js App Router
- React
- TypeScript
- shared `packages/ui` design system
- Shared plain CSS tokens and local Pretendard font

Tailwind/shadcn components are optional future choices.

Responsibilities:
- unified navigation to ERP and internal tools
- an owned Notion-style wiki with block editing and nested pages
- shared calendars and schedules
- weekly work reports, comments, and feedback
- project/task tracking and shared boards
- common users, teams, and access permissions
- dashboards and operational views
- Prism-owned forms/workflows
- presentation of selected data through stable APIs

## Current implementation

`src/app`, `src/server`, `src/features/workspace`, and `db/migrations` are
implemented. `db/manage.ts` owns schema/seed/reset. The current UI supports basic
records in five categories, search, create/edit/delete, and documentation links.
Authentication, file upload, rich blocks, nested pages and detailed business
workflows remain future work.

## Future feature split

The following is the target layout, not a list of already implemented features.

```text
src/
  app/                    # Routes and HTTP entry points
  features/
    auth/                 # Authentication and authorization
    teams/                # Users and teams
    wiki/                 # Pages, editor, history, comments, sharing
    calendar/             # Events, attendees, recurrence
    weekly-reports/       # Weekly work and plans
    projects/             # Projects and tasks
    board/                # Announcements and shared posts
  server/                 # Server-only database access and storage adapters
db/
  migrations/             # Portal-owned schema changes
  seeds/                  # Synthetic development data
```

The portal uses its own database/account on the shared MariaDB instance in
`infra/mariadb/`. Portal features share users, teams, and other deliberately
shared portal tables. A wiki page can link to a report or project without
introducing a separately deployed wiki product.

Store document content, metadata, revisions, and permissions in the portal
database. Store file bytes in separate persistent file storage, with metadata
and access control in the database. Start with block editing, nested pages,
sharing, search, and revision history; real-time collaboration and Notion-like
custom database views are later scope, not implemented capabilities.

Keep vendor integrations behind adapters. The portal must not query ERPNext
database tables directly. See [database ownership](../../docs/md/DATABASE.md).

Start with Next.js server capabilities as the UI/BFF layer. Introduce a separate API service only when background jobs, integration complexity, independent scaling, or ownership boundaries justify it.

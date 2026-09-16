# Automation Service

Shared browser-automation / RPA capability for Prism Platform.

## Purpose

Run browser-driven automation independently from application web containers.

Primary engine:
- Playwright + TypeScript

Typical jobs:
- vendor portal data entry
- repetitive back-office web tasks
- download/upload workflows
- scheduled browser jobs
- cross-system data synchronization when no API is available

## Architecture Rules

- Do not embed Playwright runtime into every application container.
- Applications submit automation jobs through a stable interface.
- Run browser automation in dedicated worker containers.
- Keep credentials outside source control and inject them at runtime.
- Persist job state, logs, screenshots, traces, and artifacts separately from application containers.
- Prefer official APIs over browser automation when a reliable API exists.
- Pin Playwright package and Docker image versions together.

## Suggested Internal Layout

```text
services/automation/
├── README.md
├── Dockerfile
├── package.json
├── src/
│   ├── runner/
│   ├── jobs/
│   ├── adapters/
│   └── observability/
└── flows/
    ├── erp/
    ├── vendor-portals/
    └── internal/
```

The service should be horizontally scalable later by adding worker replicas behind a queue.

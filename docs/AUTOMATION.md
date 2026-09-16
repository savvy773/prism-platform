# Automation and RPA Architecture

## Principle

Browser automation is a shared platform capability, not a dependency embedded into every application.

```text
Portal / Dashboard / ERP integration
              |
              v
      Automation interface
              |
        Queue / scheduler
              |
              v
   Playwright worker containers
              |
              v
 External and internal web systems
```

## Why isolate it

Browser automation is heavier and less predictable than normal API services. It requires browser processes, additional memory, operational artifacts, credentials, retries, and sometimes controlled concurrency. Keeping it isolated allows applications to remain lightweight and lets automation workers be rebuilt, scaled, or replaced independently.

## Runtime

Initial implementation:
- TypeScript
- Playwright
- dedicated Docker container
- Chromium first unless a workflow specifically requires another browser

Later additions when justified:
- Redis-backed job queue
- scheduler
- multiple workers
- retry/dead-letter handling
- job history in PostgreSQL
- screenshots / traces / downloaded artifacts
- automation console in the internal portal

## API-first rule

Prefer a documented, stable API when one exists. Use Playwright when a browser interaction is actually required or when an external system does not provide a practical API.

## App relationship

Applications should request automation through a contract instead of importing Playwright directly.

Example:

```text
Portal
  -> POST automation job
  -> job id
  -> automation worker executes
  -> status/result stored
  -> Portal displays result
```

App-specific automation flows can be grouped under `services/automation/flows/`, while the execution runtime remains shared.

## Testing

Playwright E2E tests live under `tests/e2e/` and are separate from business RPA flows. The same underlying technology may be used, but test automation and production automation have different lifecycle, credentials, data, and failure semantics.

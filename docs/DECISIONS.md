# Prism Platform - Architecture Decisions

This file records decisions that should survive individual ChatGPT or Codex sessions.

## ADR-001: Docker-first development

**Status:** Accepted

Use Docker / Docker Compose as the default execution model for the platform.

### Reason
- repeatable environments
- simple service isolation
- easy rebuilds
- good portability from WSL2 to Ubuntu 24.04
- easier experimentation during the early phase

## ADR-002: Disposable development environment

**Status:** Accepted

Development containers and development databases may be destroyed and recreated frequently.

### Reason
The project is still being shaped. Fast reset/rebuild cycles are more valuable than preserving experimental state.

### Constraint
Production data must never follow the same destructive reset policy.

## ADR-003: GitHub as source of truth

**Status:** Accepted

The GitHub repository stores source code, configuration, scripts, infrastructure definitions, and architecture documentation.

Persistent database data and secrets are excluded.

## ADR-004: WSL2 development, Ubuntu deployment

**Status:** Accepted

Develop primarily under Windows + WSL2 and deploy to Ubuntu 24.04 LTS.

Docker Compose should minimize environment-specific differences.

## ADR-005: Delay Cloudflare Tunnel until core services work

**Status:** Accepted

Do not make Cloudflare Tunnel a prerequisite for the first development iterations.

First stabilize:
- containers
- service networking
- database behavior
- internal HTTP access

Then add secure external routing.

## ADR-006: Delay CI/CD until manual deployment is understood

**Status:** Accepted

Initially deploy using explicit Git + Docker Compose operations.

After the deployment process is stable and understood, automate it with GitHub Actions or another CI/CD mechanism.

## ADR-007: Codex context lives in the repository

**Status:** Accepted

Use `AGENTS.md` for persistent Codex instructions and `docs/` for longer-lived project context and architecture decisions.

Chat conversations may guide decisions, but the repository documentation is the durable project memory.

## ADR-008: Shared browser automation service

**Status:** Accepted

Use Playwright-based browser automation as a shared platform service rather than embedding the Playwright runtime into every application.

### Direction
- run business RPA in dedicated worker containers
- expose automation through stable job/API contracts
- keep app-specific flows separate from the execution engine
- keep production RPA separate from Playwright E2E tests
- prefer documented APIs when available
- isolate automation credentials, logs, traces, screenshots, and downloaded artifacts
- keep ERPNext-internal Redis separate from platform automation queues

### Reason
Browser automation has different resource, security, retry, observability, and scaling characteristics from normal web applications. Isolation keeps application containers smaller and makes the automation engine independently replaceable and scalable.

# Replaceable Services

This directory contains deployable third-party or independently replaceable products.

Examples:
- `erpnext/` — ERPNext/Frappe application stack
- `wiki/` — selected knowledge/wiki product
- `automation/` — independently deployed Prism-owned Playwright worker, per ADR-008

A service should be removable or replaceable without forcing structural changes across Prism-owned applications.

Each service should eventually define:
- `compose.yaml`
- `.env.example` or documented environment contract
- persistent volumes
- health checks
- internal ports
- proxy routing labels/configuration
- backup and restore requirements
- upgrade notes

Integration with Prism-owned code should use APIs, webhooks, or explicit import/export contracts rather than cross-database queries.

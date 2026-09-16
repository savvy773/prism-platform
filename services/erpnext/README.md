# ERPNext Service

ERPNext/Frappe is treated as a replaceable application service with its own runtime dependencies and persistent data.

Principles:
- keep ERPNext-specific database/cache/queue dependencies inside this service boundary
- do not couple Prism-owned applications directly to ERPNext database tables
- integrate through ERPNext/Frappe APIs, webhooks, or explicit import/export flows
- make local teardown/rebuild easy
- keep production data persistent and independently backed up

This directory will later contain the tested ERPNext Docker/Compose configuration and Prism-specific integration notes.

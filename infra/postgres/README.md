# Shared PostgreSQL

Shared PostgreSQL is intended for Prism-owned applications and platform data where PostgreSQL is appropriate.

It is intentionally separated from ERPNext's application-specific database dependency.

Development requirements:
- easy reset/recreate
- health check
- explicit database/user initialization
- direct SQL access for verification during testing

Production requirements will later add persistent storage, backups, restore testing, access control, and migration procedures.

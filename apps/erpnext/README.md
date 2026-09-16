# ERPNext

ERPNext/Frappe lives here as an application stack.

Early-stage goals:
- easy local bring-up under WSL2
- easy teardown and rebuild
- explicit site/database initialization
- observable import and web-form-to-database testing
- portable deployment to Ubuntu 24.04

Keep ERPNext-specific runtime dependencies isolated from the shared Prism platform where practical. In particular, do not assume the shared PostgreSQL service is the ERPNext database. The ERPNext database choice will follow the tested Frappe/ERPNext Docker configuration used for this stack.

Do not store ERPNext site data, secrets, or production backups in Git.

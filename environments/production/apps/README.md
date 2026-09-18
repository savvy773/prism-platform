# Production applications

This folder owns Ubuntu application configuration for the future root
`compose.yaml`. The Compose project is `prism-prod-apps`.

Provision `.env` on the server from `.env.example`. Future `compose.override.yaml`
settings include built application images, restart/health policies, application
storage, and web routing. Source mounts and development hot reload do not belong
here. Give each app only its own database credentials.

Connect database consumers to the external `prism-prod-mariadb-data` network provided by
the independently managed database stack. A normal application deployment must
verify DB availability but must not upgrade, recreate, or stop the DB stack.
Application-owned schema migrations remain part of the reviewed deployment plan.
No application runtime is implemented yet.

See [deployment](../../../docs/md/DEPLOYMENT.md).

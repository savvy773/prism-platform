# Reverse Proxy

Shared HTTP entry point for Prism services. Traefik is the preferred implementation, as recorded in `docs/STACK.md`.

Introduce it after core services and their data flows work. Keep routing configuration close to each module. Attach only web-facing endpoints to the shared routing network; databases stay on the networks of their consumers.

Stopping ERPNext must not stop proxy routing to the wiki or portal. The proxy itself is shared infrastructure, so its outage affects all services accessed through it.

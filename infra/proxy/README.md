# Reverse Proxy

Central HTTP entry point for Prism services when multiple web applications need coordinated routing.

Initial development may expose services directly on local ports. Introduce the reverse proxy after core service and database flows are verified.

Possible implementation: Nginx or Traefik. The choice is not frozen yet.

# Wiki / Knowledge Service

The knowledge service is intentionally modeled as replaceable.

Selection criteria:
- Docker-friendly deployment
- export/backup support
- authentication integration path
- stable API or webhook surface when available
- straightforward upgrade path

Do not let Prism-owned applications depend on product-specific database tables. If the wiki product changes later, the replacement should primarily affect this directory, routing, and integration adapters.

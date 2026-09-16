# Redis

Shared Redis infrastructure for Prism-owned services when needed.

Do not automatically share ERPNext's Redis instances with unrelated services. ERPNext/Frappe may maintain its own cache/queue Redis services as part of its application stack.

Define each Redis use explicitly: cache, queue, session, or other purpose.

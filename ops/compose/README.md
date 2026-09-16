# Compose Assembly

Docker Compose is the platform assembly layer.

## Principle

Each replaceable module should own its runtime definition close to the module:

```text
services/erpnext/compose.yaml
services/wiki/compose.yaml
infra/postgres/compose.yaml
infra/redis/compose.yaml
infra/proxy/compose.yaml
apps/portal/compose.yaml
```

The root `compose.yaml` will use Compose `include` to assemble the enabled modules instead of duplicating every service in one giant file.

## Profiles

Use profiles for optional concerns such as:
- debug tools
- database admin UI
- local mail catcher
- observability tools
- optional wiki during focused ERP work

Do not use profiles to hide essential dependencies that should always start together.

## Environment overlays

Prefer a small number of explicit environment overlays:
- development defaults
- production-safe overrides

Avoid a large matrix of nearly identical Compose files.

## Replacement workflow

A replaceable service should be swappable by changing primarily:
1. its module directory
2. root Compose include/module selection
3. reverse-proxy routing
4. integration adapter/configuration

The rest of the platform should remain structurally unchanged.

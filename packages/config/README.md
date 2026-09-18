# Shared Development Configuration

Own reusable TypeScript, lint, formatter, test, and build configuration here when
the application toolchain is implemented. Applications extend shared defaults
and keep only justified application-specific overrides.

This is a source/configuration package, not a running service. No package manifest
or toolchain config is implemented yet; add executable configuration with the
first application and validate it there rather than adding empty presets.

Prefer current stable tooling and supported LTS runtimes. Pin versions and use
the workspace lockfile once introduced; coordinate upgrades across consumers.
Do not apply portal tool versions to ERPNext vendor internals without checking
their compatibility contract.

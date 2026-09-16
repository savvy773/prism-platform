# Deployment Operations

The operator guide is [docs/DEPLOYMENT.md](../../docs/DEPLOYMENT.md). Production configuration belongs in `environments/production/`; shared lifecycle helpers belong in `ops/scripts/`.

Place deployment-specific scripts here when the first manual deployment is validated. Resolve paths from the repository location and require an explicit production target. CI/CD will follow a proven manual procedure.

No deployment scripts are implemented yet.

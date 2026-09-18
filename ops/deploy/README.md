# Deployment Operations

The operator guide is [docs/md/DEPLOYMENT.md](../../docs/md/DEPLOYMENT.md). Production configuration belongs in `environments/production/`; shared lifecycle helpers belong in `scripts/`.

Place deployment-specific scripts here when the first manual deployment is validated. Resolve paths from the repository location and require an explicit production target. CI/CD will follow a proven manual procedure.

No deployment scripts are implemented yet.

The planned entry point is `make deploy REV=<commit>`, backed by `deploy.sh` in
this directory. The default SSH host is `su`. See the [command design](../../docs/md/COMMANDS.md)
for the local-test-to-server workflow. Implement it with the first runnable
service; do not add a placeholder that reports a successful deployment.

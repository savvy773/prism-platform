# Backup

Store backup procedures and scripts here, never backup archives or credentials.

For each stateful service, document the database-native backup command, uploaded files, required configuration/secrets, retention, and off-host destination. Record the application/image and schema versions needed to restore it.

Backups must be consistent across the database and related files. Do not assume copying a live database volume produces a usable backup. Verify recovery using `ops/restore/` before relying on the procedure.

## Code backup (implemented)

From the repository root, run:

```bash
python3 ops/backup/backup-code.py
```

This creates a timestamped `.tar.gz` archive and `.sha256` checksum in `/mnt/data/nas/backup/code`. It requires Python 3 and Git, and checks that `/mnt/data` is mounted before writing there. An alternate destination can be selected with `--destination /absolute/path`.

The archive contains:
- `prism-platform/source/`: current tracked and non-ignored new files, including uncommitted edits
- `prism-platform/git-history.bundle`: Git history reachable from repository refs

Local `.git` configuration and hooks are not copied. Ignored files, `.env` files (except `.env.example`), common private-key files, runtime data folders, and build/dependency artifacts are excluded from the working-tree snapshot. This is a filename policy, not secret detection: do not place secrets in ordinary source files. The history bundle contains committed history, including any secrets previously committed; source exclusions do not sanitize history.

The script verifies the bundle and reads the archive back before publishing it. Files are owner-readable/writable only. It creates new backups without deleting earlier ones. Run while source files are not being edited; the archive is not an atomic filesystem snapshot. Nested repositories/submodules require their own backup and cause this script to stop when detected. Untracked ignored files and unreachable/reflog-only commits are not included.

No schedule or retention cleanup is installed. Database and uploaded-file backup implementation is still pending. The destination currently resides on a local `/mnt/data` filesystem; an independent/off-host copy is not established by this script.

See [code restore steps](../restore/README.md#restore-a-code-backup).

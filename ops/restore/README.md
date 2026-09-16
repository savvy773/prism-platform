# Restore

Store recovery procedures and scripts here.

Restore to an isolated project and storage location first. Verify database records, uploaded files, application read-back, and required secrets before a production recovery. Record the tested backup timestamp and software versions.

Restoring an older image alone does not reverse a database migration. Every stateful upgrade must document its recovery path.

Database recovery implementation is pending; no automated database restore exists.

## Restore a code backup

Use a new, empty recovery directory. Replace the sample archive name with the exact name printed by the backup script.

1. In `/mnt/data/nas/backup/code`, verify the archive using `sha256sum -c <archive-name>.sha256`.
2. Extract that trusted archive into the empty recovery directory using `tar -xzf <absolute-archive-path> -C <recovery-directory>`.
3. For the exact working files, use the extracted `prism-platform/source/` directory. This snapshot includes uncommitted work, but has no `.git` directory.
4. To recover committed history separately, run `git clone <recovery-directory>/prism-platform/git-history.bundle <new-history-checkout>`.
5. To combine history with the exact working snapshot, move the cloned checkout's `.git` directory into `prism-platform/source/`, then run `git -C <recovery-directory>/prism-platform/source status` and inspect the restored differences. Keep these operations inside the recovery directory.
6. In the resulting checkout, set `origin` to `https://github.com/savvy773/prism-platform.git` before fetching or pushing; a bundle clone initially points at the bundle file.

The archive is a code backup, not a full service restore. Provision secrets separately and restore databases/uploads using their service-specific procedures.

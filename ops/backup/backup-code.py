#!/usr/bin/env python3
"""Back up the working tree and Git history without secrets or runtime data."""

import argparse
import hashlib
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile
from datetime import datetime, timezone


DEFAULT_DESTINATION = Path('/mnt/data/nas/backup/code')
EXCLUDED_DIRECTORIES = {
    '.git', '.docker', '.next', '.turbo', '.venv', 'venv', '__pycache__',
    'node_modules', 'dist', 'coverage', 'playwright-report', 'test-results',
    'data', 'backups', 'logs', '.idea', '.vscode',
}
EXCLUDED_SUFFIXES = {'.key', '.pem', '.p12', '.pfx', '.log', '.pyc', '.pyo', '.tsbuildinfo'}


def included(path):
    return (
        not any(part in EXCLUDED_DIRECTORIES for part in path.parts)
        and not any(
            part == '.env' or (part.startswith('.env.') and part != '.env.example')
            for part in path.parts
        )
        and path.suffix.lower() not in EXCLUDED_SUFFIXES
    )


def git(root, *arguments):
    return subprocess.run(
        ['git', '-C', str(root), *arguments], check=True,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    ).stdout


def backup(destination):
    root = Path(__file__).resolve().parents[2]
    actual_root = Path(os.fsdecode(git(root, 'rev-parse', '--show-toplevel')).strip())
    if actual_root.resolve() != root:
        raise RuntimeError('Run the script from its original ops/backup location in the repository.')

    destination = destination.expanduser().resolve()
    if destination == root or root in destination.parents:
        raise RuntimeError('Backup destination must be outside the repository.')
    if (destination == Path('/mnt/data') or Path('/mnt/data') in destination.parents) and not os.path.ismount('/mnt/data'):
        raise RuntimeError('/mnt/data is not mounted; refusing to write to the underlying system disk.')
    destination.mkdir(parents=True, exist_ok=True)

    # Include tracked files and non-ignored new files; omit deleted working files.
    paths = sorted(set(git(root, 'ls-files', '--cached', '--others', '--exclude-standard', '-z').split(b'\0')) - {b''})
    selected = []
    for raw in paths:
        relative = Path(os.fsdecode(raw))
        if relative.is_absolute() or '..' in relative.parts:
            raise RuntimeError('Unexpected path in Git file listing.')
        if not included(relative):
            continue
        source = root / relative
        # Do not follow directory symlinks into files outside this checkout.
        if any(parent.is_symlink() for parent in source.parents if parent != root and root in parent.parents):
            raise RuntimeError(f'Symlink parent in working tree: {relative}')
        if source.is_symlink() or source.is_file():
            selected.append(relative)
        elif source.is_dir():
            raise RuntimeError(f'Nested repository/submodule needs a separate backup: {relative}')

    head = git(root, 'rev-parse', '--short=12', 'HEAD').decode().strip()
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')
    filename = f'prism-platform-{stamp}-{head}.tar.gz'
    final = destination / filename
    checksum_final = destination / f'{filename}.sha256'
    if final.exists() or checksum_final.exists():
        raise RuntimeError('Backup name already exists; refusing to overwrite.')

    with tempfile.TemporaryDirectory(prefix='.prism-backup-', dir=destination) as temporary:
        staging = Path(temporary)
        bundle = staging / 'git-history.bundle'
        git(root, 'bundle', 'create', str(bundle), '--all')
        git(root, 'bundle', 'verify', str(bundle))
        archive = staging / filename
        with tarfile.open(archive, 'w:gz', dereference=False) as output:
            for relative in selected:
                output.add(root / relative, arcname=f'prism-platform/source/{relative.as_posix()}', recursive=False)
            output.add(bundle, arcname='prism-platform/git-history.bundle')

        # Read every archived regular file back to detect unreadable/truncated output.
        with tarfile.open(archive, 'r:gz') as check:
            for member in check:
                if member.isfile():
                    with check.extractfile(member) as contents:
                        while contents.read(1024 * 1024):
                            pass
        digest = hashlib.sha256()
        with archive.open('rb') as contents:
            for chunk in iter(lambda: contents.read(1024 * 1024), b''):
                digest.update(chunk)
        checksum = staging / f'{filename}.sha256'
        checksum.write_text(f'{digest.hexdigest()}  {filename}\n')
        archive.chmod(0o600)
        checksum.chmod(0o600)
        archive.rename(final)
        checksum.rename(checksum_final)

    print(f'Backup: {final}')
    print(f'Checksum: {checksum_final}')
    print(f'Included {len(selected)} working-tree files and verified Git history.')
    print('Code backup only: runtime data and local secrets require separate backups.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--destination', type=Path, default=DEFAULT_DESTINATION)
    arguments = parser.parse_args()
    try:
        backup(arguments.destination)
    except (OSError, RuntimeError, subprocess.CalledProcessError, tarfile.TarError) as error:
        parser.exit(1, f'Backup failed: {error}\n')


if __name__ == '__main__':
    main()

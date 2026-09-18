"""Exercise update failure boundaries without touching Docker or real data."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from types import SimpleNamespace

spec=importlib.util.spec_from_file_location('updater',Path(__file__).resolve().parents[2]/'scripts/update-stack.py')
u=importlib.util.module_from_spec(spec)
spec.loader.exec_module(u)

class UpdateBoundaryTests(unittest.TestCase):
    def exercise(self, backup_fails=False, migrate_fails=False, site=True):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)/'repo'; root.mkdir()
            files=['package.json','apps/portal/package.json','pnpm-lock.yaml','pnpm-workspace.yaml','.node-version','apps/portal/Dockerfile','apps/erpnext/compose.yaml','infra/mariadb/compose.yaml','infra/proxy/compose.yaml']
            for name in files:
                p=root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('old')
            events=[]
            def apply(*args):
                events.append('versions');(root/'infra/mariadb/compose.yaml').write_text('new')
            def db_up():events.append('db-'+(root/'infra/mariadb/compose.yaml').read_text())
            def compose(stack,*args,**kwargs):
                if 'migrate' in args:
                    events.append('migrate')
                    if migrate_fails:raise RuntimeError('Migration failed')
                if 'ps' in args:return SimpleNamespace(stdout='container-id')
                if 'python' in args:return SimpleNamespace(stdout='1' if site else '0')
                return SimpleNamespace(stdout='')
            def backup(target,old):
                events.append('backup')
                if backup_fails:raise RuntimeError('Backup failed')
                target.mkdir(parents=True)
            with patch.object(u,'ROOT',root),patch.object(Path,'home',return_value=Path(temp)),patch.object(u,'apply_versions',side_effect=apply),patch.object(u,'backup',side_effect=backup),patch.multiple(u.dev,guard=lambda:None,setup=lambda:None,db_up=db_up,compose=compose,run=lambda *a,**k:None,portal_up=lambda:events.append('portal'),erp_up=lambda:events.append('erp')):
                if backup_fails or migrate_fails:
                    with self.assertRaises(RuntimeError):u.execute({'ERPNext':('16.1.0','16.2.0')},{},{})
                else:u.execute({'ERPNext':('16.1.0','16.2.0')},{},{})
            return events,(root/'infra/mariadb/compose.yaml').read_text()
    def test_backup_precedes_new_db_and_missing_site_skips_migration(self):
        events,version=self.exercise(site=False)
        self.assertLess(events.index('db-old'),events.index('versions'))
        self.assertLess(events.index('backup'),events.index('db-new'))
        self.assertNotIn('migrate',events)
        self.assertEqual(events[-2:],['portal','erp'])
    def test_failed_backup_never_starts_new_db_and_restores_versions(self):
        events,version=self.exercise(backup_fails=True)
        self.assertNotIn('db-new',events)
        self.assertEqual(version,'old')
    def test_failed_migration_never_automatically_downgrades_db(self):
        events,version=self.exercise(migrate_fails=True)
        self.assertEqual(events.count('db-old'),1)
        self.assertEqual(version,'new')
        self.assertNotIn('portal',events)

if __name__=='__main__':unittest.main()

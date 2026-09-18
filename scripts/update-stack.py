#!/usr/bin/env python3
"""Check/update the compatible WSL application stack; never updates the Ubuntu host."""
import argparse
import fcntl
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from datetime import datetime, timezone
from urllib.request import Request, urlopen

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("prism_dev",ROOT/"scripts/dev.py")
dev=importlib.util.module_from_spec(spec)
spec.loader.exec_module(dev)
UA={"User-Agent":"Prism-stack-updater"}

def fetch(url):
    with urlopen(Request(url,headers=UA),timeout=30) as response:
        return response.read().decode()

def data(url): return json.loads(fetch(url))
def version(value): return tuple(int(x) for x in value.lstrip("v").split("."))
def stable(value): return bool(re.fullmatch(r"\d+\.\d+\.\d+",value))
def npm(name): return data("https://registry.npmjs.org/"+name+"/latest")["version"]
def latest_major(name,major):
    releases=data("https://registry.npmjs.org/"+name)["versions"]
    return max((v for v in releases if stable(v) and v.startswith(str(major)+".")),key=version)
def github(repo):
    release=data("https://api.github.com/repos/"+repo+"/releases/latest")
    if release["prerelease"] or release["draft"]: raise RuntimeError("Stable release required: "+repo)
    return release["tag_name"].lstrip("v")
def image_version(name,line):
    source=fetch("https://raw.githubusercontent.com/docker-library/official-images/master/library/"+name)
    tags=[tag.strip() for row in source.splitlines() if row.startswith("Tags:") for tag in row[5:].split(",")]
    return max((tag for tag in tags if stable(tag) and tag.startswith(line+".")),key=version)

def plan():
    portal=json.loads((ROOT/"apps/portal/package.json").read_text())
    root=json.loads((ROOT/"package.json").read_text())
    updates={}
    for group in ("dependencies","devDependencies"):
        for name,current in portal[group].items():
            if current.startswith("workspace:"): continue
            candidate=latest_major(name,24) if name=="@types/node" else npm(name)
            if not stable(candidate): raise RuntimeError("Non-stable npm release: "+name)
            updates[name]=(current,candidate)
    node_releases=data("https://nodejs.org/dist/index.json")
    # Node 24 LTS is the tested contract with Frappe v16 and this project.
    node=max((r["version"].lstrip("v") for r in node_releases if r.get("lts") and r["version"].startswith("v24.")),key=version)
    erp=github("frappe/erpnext")
    if version(erp)[0]!=16:
        raise RuntimeError("A new ERPNext major needs a reviewed DB/Node/Redis compatibility policy before automatic upgrade.")
    def current(file,pattern): return re.search(pattern,(ROOT/file).read_text())[1]
    updates.update({
        "node":((ROOT/".node-version").read_text().strip(),node),
        "pnpm":(root["packageManager"].split("@")[1],latest_major("pnpm",12)),
        "ERPNext":(current("apps/erpnext/compose.yaml",r"frappe/erpnext:v(\d+\.\d+\.\d+)"),erp),
        "MariaDB":(current("infra/mariadb/compose.yaml",r"mariadb:(\d+\.\d+\.\d+)"),image_version("mariadb","11.8")),
        "Redis":(current("apps/erpnext/compose.yaml",r"redis:(\d+\.\d+\.\d+)"),image_version("redis","8")),
        "Traefik":(current("infra/proxy/compose.yaml",r"traefik:v(\d+\.\d+\.\d+)"),github("traefik/traefik")),
    })
    if version(updates["Traefik"][1])[0]!=3: raise RuntimeError("Review the new Traefik major before automatic upgrade.")
    for name,(old,new) in updates.items():
        if version(new)<version(old): raise RuntimeError("Refusing automatic downgrade: "+name)
    return updates,portal,root

def apply_versions(updates,portal,root):
    for group in ("dependencies","devDependencies"):
        for name in portal[group]:
            if name in updates: portal[group][name]=updates[name][1]
    root["packageManager"]="pnpm@"+updates["pnpm"][1]
    (ROOT/"apps/portal/package.json").write_text(json.dumps(portal,indent=2)+"\n")
    (ROOT/"package.json").write_text(json.dumps(root,indent=2)+"\n")
    (ROOT/".node-version").write_text(updates["node"][1]+"\n")
    replacements={
      "apps/portal/Dockerfile":[("node:"+updates["node"][0]+"-","node:"+updates["node"][1]+"-"),("pnpm@"+updates["pnpm"][0],"pnpm@"+updates["pnpm"][1])],
      "apps/erpnext/compose.yaml":[("frappe/erpnext:v"+updates["ERPNext"][0],"frappe/erpnext:v"+updates["ERPNext"][1]),("redis:"+updates["Redis"][0],"redis:"+updates["Redis"][1])],
      "infra/mariadb/compose.yaml":[("mariadb:"+updates["MariaDB"][0],"mariadb:"+updates["MariaDB"][1])],
      "infra/proxy/compose.yaml":[("traefik:v"+updates["Traefik"][0],"traefik:v"+updates["Traefik"][1])],
    }
    for file,pairs in replacements.items():
        path=ROOT/file;text=path.read_text()
        for old,new in pairs:text=text.replace(old,new)
        path.write_text(text)

def backup(target,old_erp):
    target.mkdir(parents=True,mode=0o700)
    target.chmod(0o700)
    def stream(file,command):
        fd=os.open(target/file,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
        with os.fdopen(fd,"wb") as out:
            subprocess.run(command,cwd=ROOT,env=dev.CLEAN_ENV,stdout=out,check=True)
        if not (target/file).stat().st_size: raise RuntimeError("Empty backup: "+file)
    stream("mariadb-all.sql",dev.DOCKER+["exec","prism-dev-mariadb-mariadb-1","sh","-c",
        'MYSQL_PWD="$MARIADB_ROOT_PASSWORD" exec mariadb-dump -uroot --all-databases --single-transaction --routines --events --triggers'])
    volume=dev.run(dev.DOCKER+["volume","ls","--filter","name=^prism-dev-apps_erp-sites$","--format","{{.Name}}"],capture=True).stdout.strip()
    if volume:
        stream("erp-sites.tar.gz",dev.DOCKER+["run","--rm","--network","none","-v",volume+":/snapshot:ro",
            "--entrypoint","tar","frappe/erpnext:v"+old_erp,"-czf","-","-C","/snapshot","."])
    print("Data backup: "+str(target))

def execute(updates,portal,root):
    dev.guard()
    with open(ROOT/".dev.lock","w") as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        dev.setup()
        files=["package.json","apps/portal/package.json","pnpm-lock.yaml","pnpm-workspace.yaml",".node-version","apps/portal/Dockerfile","apps/erpnext/compose.yaml","infra/mariadb/compose.yaml","infra/proxy/compose.yaml"]
        original={name:(ROOT/name).read_text() for name in files}
        stamp=datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        target=Path.home()/".local/state/prism/stack-backups"/stamp
        mutation_started=False
        # Start the old DB definition before changing any image versions.
        dev.db_up()
        try:
            apply_versions(updates,portal,root)
            # The host pnpm launch uses the project's pinned packageManager version.
            dev.run(["pnpm","install"])
            dev.run(["pnpm","typecheck"])
            dev.compose("app","build","portal-web")
            dev.compose("app","run","--rm","--no-deps","portal-web","pnpm","build")
            dev.compose("app","run","--rm","--no-deps","portal-web","pnpm","--filter","@prism/portal","exec","tsx","--test","src/features/workspace/model.test.ts")
            # Quiesce all writers before the logical database + site-file backup.
            dev.compose("app","stop","portal-web","web-proxy",*dev.erp_services())
            if not dev.compose("db","ps","--status","running","--quiet",capture=True).stdout.strip():
                raise RuntimeError("Database stopped before backup; refusing upgrade.")
            backup(target,updates["ERPNext"][0])
            (target/"source-versions.json").write_text(json.dumps(original,indent=2))
            (target/"update-plan.json").write_text(json.dumps(updates,indent=2))
            mutation_started=True
            dev.db_up()
            dev.compose("app","--profile","erpnext","up","-d","--wait","erpnext-cache","erpnext-queue")
            dev.compose("app","--profile","erpnext","run","--rm","erpnext-configurator")
            # Upgrade the existing site before serving requests with the new image.
            site_exists=dev.compose("app","--profile","erpnext","run","--rm","--no-deps","erpnext-backend",
                "python","-c","from pathlib import Path; print(int(Path('sites/erp.localhost/site_config.json').is_file()))",capture=True).stdout.strip()=="1"
            if site_exists:
                dev.compose("app","--profile","erpnext","run","--rm","--no-deps","erpnext-backend","bench","--site","erp.localhost","migrate")
            dev.portal_up()
            dev.erp_up()
            print("Updated and health-checked. Review git diff and commit when ready. No push/deploy performed.")
        except Exception:
            if not mutation_started:
                for name,text in original.items():(ROOT/name).write_text(text)
                print("Restored version files. If apps were stopped, use make up.",file=sys.stderr)
            else:
                print("Upgrade stopped; no automatic DB downgrade. Recovery snapshot: "+str(target),file=sys.stderr)
            raise

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply",action="store_true")
    args=parser.parse_args()
    updates,portal,root=plan()
    print("Compatible policy: ERPNext 16 / MariaDB 11.8 / Node 24 LTS / Redis 8 / Traefik 3")
    for name,(old,new) in updates.items():print(f"{name:24} {old:12} -> {new}")
    if not any(old!=new for old,new in updates.values()):
        print("Already current within the compatible policy. No files/services changed.")
    elif args.apply: execute(updates,portal,root)
    else: print("Check only. Apply with: make update-stack")

if __name__=="__main__":
    try:main()
    except (RuntimeError,OSError,ValueError,subprocess.CalledProcessError) as error:
        print("Stack update failed: "+str(error),file=sys.stderr);sys.exit(1)

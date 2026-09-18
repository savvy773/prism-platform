#!/usr/bin/env python3
"""WSL-only development lifecycle. Production deployment is deliberately separate."""
import fcntl
import json
import os
from pathlib import Path
import secrets
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
APP_ENV = ROOT / "environments/development/apps/.env"
DB_ENV = ROOT / "environments/development/mariadb/.env"
DOCKER = ["docker", "--host", "unix:///var/run/docker.sock"]
CLEAN_ENV = {k: v for k, v in os.environ.items() if not k.startswith(("DOCKER_", "COMPOSE_", "PRISM_", "MARIADB_", "PORTAL_", "ERP_"))}
CLEAN_ENV["COMPOSE_ANSI"] = "never"

def run(args, capture=False, env=None, **kwargs):
    return subprocess.run(args, cwd=ROOT, env=env or CLEAN_ENV, check=True, text=True,
                          stdout=subprocess.PIPE if capture else None, **kwargs)

def fail(message):
    raise RuntimeError(message)

def guard():
    if "microsoft" not in Path("/proc/sys/kernel/osrelease").read_text().lower():
        fail("Development commands require the WSL host.")
    if os.environ.get("ENV", "development") != "development":
        fail("Only ENV=development is implemented; production is refused.")
    if os.environ.get("DOCKER_HOST") not in (None, "", "unix:///var/run/docker.sock"):
        fail("Remote DOCKER_HOST refused.")
    if os.environ.get("DOCKER_CONTEXT") not in (None, "", "default"):
        fail("Non-local DOCKER_CONTEXT refused.")
    info = json.loads(run(DOCKER + ["info", "--format", "{{json .}}"], capture=True).stdout)
    if info["Name"] != os.uname().nodename:
        fail("Docker daemon must belong to this WSL host.")

def read_env(path):
    values = {}
    if path.exists():
        for line in path.read_text().splitlines():
            if line.strip() and not line.lstrip().startswith("#"):
                key, sep, value = line.partition("=")
                if not sep or not key.replace("_", "").isalnum():
                    fail("Invalid environment file: " + str(path))
                values[key] = value
    return values

def write_env(path, values):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as file:
        file.write("# Generated local development configuration. Do not commit.\n")
        file.writelines(key+"="+value+"\n" for key,value in values.items())
    path.chmod(0o600)

def setup():
    app, db = read_env(APP_ENV), read_env(DB_ENV)
    defaults = {"PRISM_ENV":"development", "COMPOSE_PROJECT_NAME":"prism-dev-apps",
                "PRISM_MARIADB_NETWORK":"prism-dev-mariadb-data", "TZ":"Asia/Seoul"}
    dbdefaults = {"PRISM_ENV":"development", "COMPOSE_PROJECT_NAME":"prism-dev-mariadb",
                  "PRISM_DB_NETWORK":"prism-dev-mariadb-data", "TZ":"Asia/Seoul"}
    for values, fixed in [(app, defaults), (db, dbdefaults)]:
        for key,value in fixed.items():
            if key in values and values[key] != value: fail("Unexpected environment target: "+key)
            values[key]=value
    password = app.get("PORTAL_DB_PASSWORD") or db.get("PORTAL_DB_PASSWORD") or secrets.token_hex(24)
    if app.get("PORTAL_DB_PASSWORD") and db.get("PORTAL_DB_PASSWORD") and app["PORTAL_DB_PASSWORD"] != db["PORTAL_DB_PASSWORD"]:
        fail("Portal credentials differ between app and DB configuration.")
    app["PORTAL_DB_PASSWORD"] = db["PORTAL_DB_PASSWORD"] = password
    db.setdefault("MARIADB_ROOT_PASSWORD", secrets.token_hex(24))
    app.setdefault("ERP_ADMIN_PASSWORD", secrets.token_urlsafe(18))
    # Idempotent: never rotate existing credentials during setup/restart.
    write_env(APP_ENV, app)
    write_env(DB_ENV, db)

def compose(stack, *args, capture=False, extra=None):
    env = dict(CLEAN_ENV)
    if extra: env.update(extra)
    if stack == "db":
        values = read_env(DB_ENV)
        if values.get("COMPOSE_PROJECT_NAME") != "prism-dev-mariadb" or values.get("PRISM_DB_NETWORK") != "prism-dev-mariadb-data":
            fail("Database target validation failed.")
        prefix=["--env-file",str(DB_ENV),"-p","prism-dev-mariadb","-f",str(ROOT/"infra/mariadb/compose.yaml")]
    else:
        values=read_env(APP_ENV)
        if values.get("COMPOSE_PROJECT_NAME") != "prism-dev-apps" or values.get("PRISM_MARIADB_NETWORK") != "prism-dev-mariadb-data":
            fail("App target validation failed.")
        prefix=["--env-file",str(APP_ENV),"-p","prism-dev-apps","-f",str(ROOT/"compose.yaml"),"-f",str(ROOT/"environments/development/apps/compose.override.yaml")]
    return run(DOCKER+["compose"]+prefix+list(args), capture=capture, env=env)

def db_up():
    compose("db","up","-d","--wait","--wait-timeout","180")

def portal_up(rebuild=False):
    db_up()
    compose("app","build","portal-web")
    compose("app","run","--rm","--no-deps","portal-web","pnpm","--filter","@prism/portal","db","seed")
    args=["up","-d","--wait","--wait-timeout","180"]
    if rebuild: args+=["--force-recreate"]
    compose("app",*args,"portal-web","web-proxy")
    print("Portal: http://prismjuns (or PC LAN IP); local direct: http://localhost:3000")

def erp_services():
    return ["erpnext-frontend","erpnext-backend","erpnext-websocket","erpnext-worker","erpnext-scheduler","erpnext-cache","erpnext-queue"]

def erp_up():
    db_up()
    compose("app","--profile","erpnext","up","-d","--wait","erpnext-cache","erpnext-queue")
    compose("app","--profile","erpnext","run","--rm","erpnext-configurator")
    compose("app","--profile","erpnext","run","--rm","erpnext-create-site",
            extra={"PRISM_SETUP_DB_PASSWORD":read_env(DB_ENV)["MARIADB_ROOT_PASSWORD"]})
    erp_seed()
    compose("app","--profile","erpnext","up","-d","--wait","--wait-timeout","180",*erp_services())
    print("ERPNext: http://prismjuns:8080 (Administrator; password in environments/development/apps/.env)")

def erp_seed():
    year=time.localtime().tm_year
    args={"language":"English","country":"Korea, Republic of","timezone":"Asia/Seoul",
          "currency":"KRW","company_name":"Prism Practice","company_abbr":"PP",
          "chart_of_accounts":"Standard","fy_start_date":f"{year}-01-01",
          "fy_end_date":f"{year}-12-31","setup_demo":1,"enable_telemetry":0}
    compose("app","--profile","erpnext","run","--rm","--no-deps","erpnext-backend",
            "bench","--site","erp.localhost","execute",
            "frappe.desk.page.setup_wizard.setup_wizard.setup_complete",
            "--kwargs",json.dumps({"args":args}))

def reset_portal():
    # The SQL connection has privileges only on portal_db; no shared volume deletion.
    compose("app","stop","portal-web")
    compose("app","run","--rm","--no-deps","-e","PRISM_RESET_ALLOWED=portal_db",
            "portal-web","pnpm","--filter","@prism/portal","db","reset")
    compose("app","up","-d","--wait","--wait-timeout","180","portal-web")

def reset_erp():
    compose("app","stop",*erp_services())
    compose("app","--profile","erpnext","up","-d","--wait","erpnext-cache","erpnext-queue")
    for service in ("erpnext-cache","erpnext-queue"):
        compose("app","exec","-T",service,"redis-cli","FLUSHALL")
    compose("app","--profile","erpnext","run","--rm","--no-deps",
            "-e","PRISM_RESET_ALLOWED=erpnext_demo","erpnext-reset",
            extra={"PRISM_SETUP_DB_PASSWORD":read_env(DB_ENV)["MARIADB_ROOT_PASSWORD"]})
    erp_seed()
    compose("app","--profile","erpnext","up","-d","--wait","--wait-timeout","180",*erp_services())

def main():
    action=sys.argv[1] if len(sys.argv)>1 else "help"
    actions={"setup-dev","up","down","restart","urls","dev","stop","ps","logs","rebuild","reset-dev","db-up","db-stop","db-status","db-logs","erp-demo","test"}
    if action not in actions: fail("Unknown development command.")
    guard()
    module=os.environ.get("MODULE","")
    if module not in ("","portal","erpnext"): fail("MODULE must be portal or erpnext.")
    if action=="reset-dev" and not module: fail("Choose the reset target explicitly: MODULE=portal or MODULE=erpnext.")
    if action.startswith("db-") and (os.environ.get("DB")!="mariadb" or os.environ.get("ENV")!="development"):
        fail("Specify ENV=development DB=mariadb. PostgreSQL is not implemented.")
    # Serialize lifecycle mutations and reset. Logs/status must not hold this lock.
    lock = open(ROOT/".dev.lock","w")
    if action not in ("logs","db-logs","ps","db-status"):
        try: fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        except BlockingIOError: fail("Another development operation is running.")
    setup()
    if action=="setup-dev": print("Local configuration ready (credentials preserved).")
    elif action in ("up","restart"):
        if action=="restart":
            compose("app","stop",*(erp_services() if module=="erpnext" else ["portal-web"] if module=="portal" else ["portal-web","web-proxy",*erp_services()]))
        if module!="erpnext": portal_up()
        if module!="portal": erp_up()
    elif action=="down":
        if module:
            compose("app","stop",*(erp_services() if module=="erpnext" else ["portal-web"]))
        else:
            compose("app","stop","portal-web","web-proxy",*erp_services())
            compose("db","stop")
        print("Stopped. Databases, site files and volumes retained.")
    elif action=="urls":
        print("Portal: http://prismjuns:3000 or http://192.168.123.66:3000; also TCP 80")
        print("ERPNext: http://prismjuns:8080 or http://192.168.123.66:8080")
        print("Access guide: http://prismjuns/reference/docs/html/access-guide.html")
        print("MariaDB: internal TCP 3306 only; no published DB port.")
    elif action in ("dev","rebuild"):
        if module=="erpnext": erp_up()
        else: portal_up(action=="rebuild")
    elif action=="erp-demo": erp_up()
    elif action=="stop":
        compose("app","stop",*(erp_services() if module=="erpnext" else ["portal-web"]))
    elif action=="ps":
        compose("app","--profile","erpnext","ps");compose("db","ps")
    elif action=="logs": compose("app","logs","--tail","100","--follow","erpnext-backend" if module=="erpnext" else "portal-web")
    elif action=="reset-dev":
        if module=="portal": reset_portal()
        else: reset_erp()
    elif action=="db-up": db_up()
    elif action=="db-stop": compose("db","stop")
    elif action=="db-status": compose("db","ps")
    elif action=="db-logs": compose("db","logs","--tail","100","--follow")
    elif action=="test":
        compose("app","exec","-T","portal-web","pnpm","typecheck")
        compose("app","exec","-T","portal-web","pnpm","--filter","@prism/portal","exec","tsx","--test","src/features/workspace/model.test.ts")
        run([sys.executable,"tests/integration/test_stack_update.py"])

if __name__=="__main__":
    try: main()
    except (RuntimeError, subprocess.CalledProcessError, OSError) as error:
        print("Failed: "+str(error),file=sys.stderr);sys.exit(1)

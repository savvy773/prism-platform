.DEFAULT_GOAL := help

.PHONY: check-updates update-stack
check-updates:
	@python3 scripts/update-stack.py

update-stack:
	@python3 scripts/update-stack.py --apply

# Pass values through the environment, never interpolate them as shell code.
override MODULE := $(value MODULE)
export MODULE
export ENV ?= development
export DB
export DEPLOY_HOST ?= su

.PHONY: up down restart urls help save doctor doctor-remote git setup-dev dev stop ps logs rebuild reset-dev db-up db-stop db-status db-logs erp-demo test

help:
	@printf '%s\n' \
	  'make git / make save        Stage all changes, auto-message commit, then push' \
	  'make check-updates          Check latest compatible stack versions' \
	  'make update-stack           Back up, test, and apply compatible updates' \
	  'make doctor                 Check local development tools' \
	  'make doctor-remote          Check tools on DEPLOY_HOST (default: su)' \
	  '' \
	  'make up / make down         Start / stop everything; retain data' \
	  'make restart / make ps      Restart / check all services' \
	  'make urls                   Show browser addresses and ports' \
	  'make dev                    Start portal + independent MariaDB in WSL' \
	  'make erp-demo               Start the ERPNext practice site' \
	  'make stop [MODULE=erpnext]  Stop only the selected app (default: portal)' \
	  'make rebuild MODULE=portal Rebuild/recreate; retain data' \
	  'make reset-dev MODULE=portal  Reset only portal development data' \
	  'make ps / make logs         Containers / portal logs' \
	  'make db-up ENV=development DB=mariadb  Start independent DB' \
	  'make test                   Type and validation checks in portal container'

git save:
	@bash scripts/git-mgr.sh

up down restart urls setup-dev dev stop ps logs rebuild reset-dev db-up db-stop db-status db-logs erp-demo test:
	@python3 scripts/dev.py $@

doctor:
	@bash scripts/doctor.sh

doctor-remote:
	@ssh -o BatchMode=yes -o ConnectTimeout=10 -- "$$DEPLOY_HOST" bash -s < scripts/doctor.sh

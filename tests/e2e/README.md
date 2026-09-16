# End-to-End Tests

Playwright is also used for application E2E testing, but E2E tests are intentionally separated from production RPA automation.

## Separation of Concerns

`tests/e2e/`
- validates Prism applications
- runs against development / test environments
- may run in CI
- disposable test data

`services/automation/`
- performs business automation / RPA
- may run on schedules or queues
- uses production credentials only through runtime secret injection
- must produce operational logs and job history

Do not mix business RPA flows with test specifications.

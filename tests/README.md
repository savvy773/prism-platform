# Tests

- Unit tests live next to the application/package code they exercise.
- `integration/` verifies service contracts and database behavior.
- `e2e/` verifies user workflows through the browser.
- `fixtures/` contains synthetic, reproducible input data.

Use isolated test databases and credentials. Include a lifecycle check when Compose is implemented: initialize, write a record, recreate containers, verify persistence, reset development, and reinitialize from fixtures.

These directories currently describe test ownership; no test runner is configured.

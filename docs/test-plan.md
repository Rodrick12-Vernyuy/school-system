# Test Plan

## Strategy

Each of the four Node.js services (`api-gateway`, `academic-service`,
`finance-service`, `hr-service`) has its own Jest + Supertest suite, run
independently (`npm test` inside that service's directory, or via the CI
matrix in `.github/workflows/ci.yml`). PostgreSQL and RabbitMQ are mocked
with manual Jest mocks (`src/config/__mocks__/db.js`,
`src/config/__mocks__/rabbitmq.js`) so the suites are fast, deterministic,
and require no live infrastructure to run - this also means CI does not need
to stand up Postgres/RabbitMQ containers just to run unit/integration tests.

## What is covered (all verified passing as of this build)

| Service | Test files | What they prove |
|---|---|---|
| academic-service | `authService.test.js`, `authController.test.js`, `riskService.test.js`, `enrollment.test.js` | Password hashing never stores plaintext; JWTs round-trip; **self-registration links a `students` row in one transaction**; at-risk logic (attendance < 75% OR two consecutive fails) in isolation; **the mandatory enrollment workflow publishes `student.enrolled` to RabbitMQ with the correct payload**, rejects over-capacity enrollment, and rejects unauthenticated requests |
| finance-service | `invoiceService.test.js`, `paymentController.test.js`, `mockPaymentGateway.test.js`, `campaignController.test.js` | **Invoice creation from the `student.enrolled` event is idempotent** (a redelivered message does not double-bill) and transactional (rollback on failure); the simulated payment workflow pays an invoice in full, rejects over-payment, and records a declined charge; conversion rate / ROI math |
| hr-service | `payrollService.test.js`, `leaveAndAttendance.test.js` | Payroll math is driven entirely by the *configurable* CNPS/PAYE rate parameters (not hard-coded); leave submission validates date ranges and role permissions; QR check-in accepts a valid token, rejects an unknown token, and rejects a duplicate same-day check-in |
| api-gateway | `gateway.test.js` | Health endpoint; unauthenticated/invalid-token requests are rejected with 401 **before** reaching a downstream service; a valid token is let through (proxy then fails with 502 only because no real upstream is running in the unit test - proving the JWT check itself passed) |

Running each suite's totals at the time of writing:

```
academic-service : 19 tests passing
finance-service  : 10 tests passing
hr-service       : 10 tests passing
api-gateway      :  5 tests passing
-------------------------------------
Total            : 44 tests passing
```

Coverage is collected via `--coverage` (see each `package.json`'s
`collectCoverageFrom`, scoped to `services/`, `controllers/`, and
`middleware/` - i.e. the business-logic layers, not thin route-wiring
files) and uploaded as a CI artifact per service/matrix job.

## What is intentionally NOT covered by automated tests in this build

- End-to-end tests against real PostgreSQL/RabbitMQ/Docker containers (the
  sandbox this project was built in has no Docker daemon available - the
  `docker-compose.yml` and Dockerfiles are written and reviewed, but a live
  `docker compose up` run has not been executed here; do this before your
  live demonstration).
- Frontend component/UI tests (React Testing Library) - the frontend is
  covered by a production build check only (`vite build` succeeds with no
  errors), not automated UI test cases.
- PDF export, since PDF export itself is not implemented (see
  "Known simplifications" in `docs/architecture.md`).

## How to run

```bash
cd services/academic-service && npm install && npm test
cd services/finance-service  && npm install && npm test
cd services/hr-service       && npm install && npm test
cd api-gateway                && npm install && npm test
cd frontend                   && npm install && npm run build
```

Or let CI run all of the above on every push to `main` / every pull request
(see `.github/workflows/ci.yml`).

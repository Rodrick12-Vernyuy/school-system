# Tests

Per the microservices "independently deployable and testable" principle,
each backend service owns and runs its own Jest + Supertest suite rather
than sharing one root-level test runner:

- `api-gateway/tests/`
- `services/academic-service/tests/`
- `services/finance-service/tests/`
- `services/hr-service/tests/`

See [docs/test-plan.md](../docs/test-plan.md) for what each suite covers and
how to run them (also wired into `.github/workflows/ci.yml`).

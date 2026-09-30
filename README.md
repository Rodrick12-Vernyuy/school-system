# EduERP

**Academic, Finance, Marketing, Administration & Human Resource ERP** - a
university-level microservices project built for a Software Engineering
assessment. Four independently deployable Node.js/Express services behind a
single API Gateway, a React frontend, PostgreSQL (database-per-service), and
RabbitMQ for the mandatory asynchronous enrollment-to-invoice workflow.

> This project previously had a Python/FastAPI scaffold. It was deliberately
> rebuilt in Node.js/Express + React per the assignment's technology
> requirements; nothing here depends on that earlier version.

## 1. Project overview

| Module | Service | Responsibilities |
|---|---|---|
| Identity/Auth | `services/academic-service` | Login, registration, JWT issuance/refresh, account lockout, role enforcement |
| Academic | `services/academic-service` | Students, courses, prerequisites, enrollment, grades, GPA, attendance, at-risk detection, examination scheduling, grade appeals |
| Finance & Marketing | `services/finance-service` | Tuition invoices (auto-generated), simulated mobile-money payments, digital receipts, expenses, financial reports, marketing campaigns |
| Administration & HR | `services/hr-service` | Employees, recruitment, configurable-rate payroll, QR-code attendance, leave management, performance reviews, asset tracking |
| Gateway | `api-gateway` | Single public entry point, request routing, rate limiting, API versioning (`/api/v1`) |
| UI | `frontend` | React + Vite dashboard, role-based routing (Super Admin, Admin, Staff, Student) |

See [docs/architecture.md](docs/architecture.md) for the deployment diagram
and design rationale, and [docs/uml/](docs/uml/) /
[docs/erd/](docs/erd/) for the full UML set (use case, class, two sequence
diagrams, and per-service ERDs).

## 2. Architecture

```
Browser -> frontend (React/Vite, served by nginx in Docker)
        -> api-gateway (Express, :4000)
             -> academic-service (Express, :4001) -> academic-db (Postgres)
             -> finance-service  (Express, :4002) -> finance-db  (Postgres)
             -> hr-service       (Express, :4003) -> hr-db       (Postgres)

academic-service --publish student.enrolled--> RabbitMQ --consume--> finance-service
                                                                       (creates tuition invoice)
```

The frontend only ever calls the API Gateway. The gateway only ever proxies
to the three backend services. Each backend service independently verifies
the JWT on every request (not just the gateway), so every service remains
safe to call directly - this is intentional defense in depth, not
duplication for its own sake.

## 3. Technologies

- **Frontend**: React 18, Vite, plain JavaScript (no TypeScript), React Router, Axios, Bootstrap 5
- **Backend**: Node.js 20, Express, plain JavaScript, `pg` (raw parameterized SQL, no ORM)
- **Database**: PostgreSQL 16, one database per service (`academic_db`, `finance_db`, `hr_db`)
- **Auth**: JWT (short-lived access + rotated, hashed refresh tokens), bcrypt password hashing
- **Messaging**: RabbitMQ (topic exchange `eduerp.events`)
- **Docs**: Swagger/OpenAPI (`swagger-jsdoc` + `swagger-ui-express`) per service
- **Testing**: Jest + Supertest, DB/RabbitMQ mocked so suites run without live infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`)

## 4. Installation

Prerequisites: Node.js 20+, npm, and either Docker Desktop (recommended) or
local PostgreSQL 16 + RabbitMQ installations.

```bash
git clone <this repo>
cd school
cp .env.example .env   # edit JWT secrets etc. before any real deployment
```

## 5. Environment variables

All variables are documented in [.env.example](.env.example) at the repo
root (used by `docker compose`). Key ones:

| Variable | Used by | Purpose |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | all 3 Postgres containers + services | DB credentials |
| `RABBITMQ_URL` | academic-service, finance-service | AMQP connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | every backend service | Must match across all services; **replace with long random values outside of local dev** |
| `MAX_FAILED_LOGIN_ATTEMPTS` / `LOCKOUT_DURATION_MINUTES` | academic-service | Account lockout policy |
| `PER_CREDIT_TUITION_FCFA` | finance-service | Simplified tuition pricing (see docs/architecture.md) |
| `FRONTEND_ORIGIN` | gateway + all services | CORS allow-list |

**Never commit a real `.env` file** - it is gitignored. No secrets are
committed anywhere in this repository.

## 6. Running locally (without Docker)

Open five terminals:

```bash
# 1. Infrastructure - if you don't have local Postgres/RabbitMQ, run only these via Docker.
#    Each Postgres container also publishes its port to the host (5433/5434/5435)
#    specifically so the services below can run locally with `npm run dev`.
docker compose up rabbitmq academic-db finance-db hr-db

# 2. Academic Service (DATABASE_URL points at the academic-db container's published port)
cd services/academic-service && npm install \
  && DATABASE_URL=postgresql://erp:erp_dev_password@localhost:5433/academic_db npm run migrate \
  && DATABASE_URL=postgresql://erp:erp_dev_password@localhost:5433/academic_db npm run seed \
  && DATABASE_URL=postgresql://erp:erp_dev_password@localhost:5433/academic_db npm run dev

# 3. Finance Service
cd services/finance-service && npm install \
  && DATABASE_URL=postgresql://erp:erp_dev_password@localhost:5434/finance_db npm run migrate \
  && DATABASE_URL=postgresql://erp:erp_dev_password@localhost:5434/finance_db npm run dev

# 4. HR Service
cd services/hr-service && npm install \
  && DATABASE_URL=postgresql://erp:erp_dev_password@localhost:5435/hr_db npm run migrate \
  && DATABASE_URL=postgresql://erp:erp_dev_password@localhost:5435/hr_db npm run dev

# 5. API Gateway
cd api-gateway && npm install && npm run dev

# 6. Frontend
cd frontend && npm install && npm run dev
```

(On Windows PowerShell, set each variable first, e.g. `$env:DATABASE_URL = "postgresql://..."`,
then run the npm command on its own line, instead of the `VAR=value cmd` inline syntax above.)

Frontend: http://localhost:5173 · Gateway: http://localhost:4000 ·
Academic docs: http://localhost:4001/docs · Finance docs: http://localhost:4002/docs ·
HR docs: http://localhost:4003/docs · RabbitMQ management UI: http://localhost:15672

## 7. Running with Docker

```bash
docker compose up --build
```

This builds and starts every container: 3 PostgreSQL databases, RabbitMQ,
the three backend services (each runs its migration and, for
academic-service, its dev-account seed, automatically on startup), the API
Gateway, and the frontend (served by nginx). Open **http://localhost:5173**.

> Note: this Docker build was authored and reviewed carefully, but the
> sandbox this project was developed in has no Docker daemon available, so
> `docker compose up --build` itself has not been executed here. Please run
> it once before a live demonstration and report back if anything needs
> adjusting - see docs/test-plan.md for exactly what *has* been verified
> (44 passing automated tests across all four backend services, plus a
> clean production `vite build` of the frontend).

## 8. Running tests

```bash
cd services/academic-service && npm install && npm test
cd services/finance-service  && npm install && npm test
cd services/hr-service       && npm install && npm test
cd api-gateway                && npm install && npm test
```

Each command runs Jest with coverage (`--coverage`), scoped to the
`services/`, `controllers/`, and `middleware/` layers. See
[docs/test-plan.md](docs/test-plan.md) for what each suite proves,
including the mandatory enrollment -> RabbitMQ -> invoice workflow test.

## 9. API documentation

Each backend service publishes its own Swagger/OpenAPI UI:

- Academic Service: `http://localhost:4001/docs`
- Finance Service: `http://localhost:4002/docs`
- HR Service: `http://localhost:4003/docs`
- API Gateway (routing table only): `http://localhost:4000/docs`

All public routes are versioned under `/api/v1/{auth|academic|finance|hr}`
when called through the gateway.

## 10. Default development accounts

Running `npm run seed` in `services/academic-service` (done automatically by
`docker compose up --build`) creates four **development-only** accounts, all
with the password `EduERP#2026`:

| Email | Role |
|---|---|
| `superadmin@eduerp.test` | super_admin |
| `admin@eduerp.test` | admin |
| `staff@eduerp.test` | staff |
| `student@eduerp.test` | student |

**Change or remove these before any non-local deployment.** They exist only
so the system can be demonstrated immediately without a manual signup step.

## 11. Microservice communication

- **Synchronous**: frontend -> gateway -> service, over plain HTTP with a
  JWT bearer token. The gateway proxies with `http-proxy-middleware`,
  rewriting `/api/v1/<service>/*` to that service's root-mounted routes.
- **Asynchronous**: academic-service publishes `student.enrolled` to the
  `eduerp.events` topic exchange on enrollment; finance-service consumes it
  from a durable queue and idempotently creates a tuition invoice (a
  redelivered message will not double-bill a student - see
  `services/finance-service/src/services/invoiceService.js`). This is the
  one required async, cross-service workflow per the assignment brief; see
  [docs/uml/sequence-enrollment-to-invoice.md](docs/uml/sequence-enrollment-to-invoice.md).

## 12. What is simulated / known limitations

Declared explicitly per the assignment's honesty requirement - see the
"Known simplifications" section of [docs/architecture.md](docs/architecture.md#known-simplifications-declared-per-the-assignments-honesty-requirement):
mobile-money payments are simulated, CNPS/PAYE payroll rates are
configurable placeholders (not verified legal rates), tuition pricing is a
flat per-credit rate, PDF export is not implemented, and the RabbitMQ
publish on enrollment is fire-and-forget rather than a transactional outbox.

## 13. Project structure

```
school/
├── frontend/                    React + Vite dashboard
├── api-gateway/                 Single public entry point
├── services/
│   ├── academic-service/        Identity/auth + academic domain
│   ├── finance-service/         Invoices, payments, expenses, marketing
│   └── hr-service/               Employees, payroll, leave, assets
├── docs/
│   ├── architecture.md           Deployment diagram + design rationale
│   ├── test-plan.md
│   ├── uml/                      Use case, class, sequence diagrams
│   ├── erd/                      Per-service ERDs
│   └── srs/                      Software Requirements Specification
├── .github/workflows/ci.yml     GitHub Actions pipeline
├── docker-compose.yml
└── .env.example
```

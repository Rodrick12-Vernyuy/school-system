# Software Requirements Specification - EduERP

## 1. Purpose

EduERP is an academic ERP covering Academic, Finance & Marketing, and
Administration & HR operations for a university, built as a set of
independently deployable Node.js microservices behind a single API Gateway,
with a React frontend. This document summarizes functional and non-functional
requirements as implemented; see [architecture.md](../architecture.md) for
the system design and the root [README.md](../../README.md) for setup.

## 2. Actors / Roles

| Role | Description |
|---|---|
| Super Admin | Full system access, including user-account management |
| Admin | Manages academic, finance, and HR operations (not user accounts beyond staff) |
| Staff | Day-to-day academic operations (students, courses, grades, attendance, exams, appeals) plus their own leave/QR attendance |
| Student | Self-service: enroll, view grades/attendance/GPA, pay invoices, submit grade appeals |

Enforced with JWT + role claims, checked both at the API Gateway (edge) and
independently inside each microservice (defense in depth). See
[services/academic-service/src/middleware/auth.js](../../services/academic-service/src/middleware/auth.js).

## 3. Functional Requirements (implemented)

### 3.1 Identity & Access (Academic Service)
- FR-1 Register (student self-service) / Register staff (admin-only)
- FR-2 Login with account lockout after N failed attempts (configurable)
- FR-3 Short-lived access token + rotated, hashed refresh token
- FR-4 Logout revokes the refresh token
- FR-5 Role-based authorization on every protected route

### 3.2 Academic
- FR-6 Student CRUD + search + deactivate
- FR-7 Course CRUD + prerequisite assignment
- FR-8 Enrollment with prerequisite and capacity checks; publishes `student.enrolled`
- FR-9 Grade entry/update; GPA calculation
- FR-10 Attendance recording; attendance percentage calculation
- FR-11 At-risk flag: attendance < 75% OR two consecutive failing grades
- FR-12 Examination scheduling with room/time conflict detection
- FR-13 Grade appeal submission and staff review (approve/reject)

### 3.3 Finance & Marketing
- FR-14 Automatic tuition invoice creation from `student.enrolled` (idempotent)
- FR-15 Simulated MTN MoMo / Orange Money payment, invoice status update, digital receipt
- FR-16 Expense CRUD with categorization
- FR-17 Daily/monthly financial summary, outstanding-fees report (FCFA)
- FR-18 Marketing campaign CRUD with conversion rate and ROI calculation

### 3.4 Administration & HR
- FR-19 Employee CRUD + deactivate; auto-generated QR attendance token
- FR-20 Recruitment pipeline (applied -> interview -> selected/rejected)
- FR-21 Configurable-rate payroll run (CNPS/PAYE), net salary in FCFA
- FR-22 QR-code check-in, daily attendance listing
- FR-23 Leave request submission and approval/rejection
- FR-24 Performance review recording
- FR-25 Asset tracking with employee assignment
- FR-26 HR dashboard summary (headcount, present-today, pending leave, payroll, performance, assets)

## 4. Non-Functional Requirements

- NFR-1 Passwords hashed with bcrypt (cost factor 12); never logged or returned by any API.
- NFR-2 All monetary values expressed in FCFA.
- NFR-3 Each service exposes `GET /health`; the gateway aggregates them at `GET /api/v1/health/services`.
- NFR-4 Structured request logging (method, url, status, latency, user id) with no secrets logged.
- NFR-5 Input validation (`express-validator`) on every write endpoint.
- NFR-6 Rate limiting at the gateway (general + a stricter limiter on `/auth/login`) and per-service.
- NFR-7 Security headers via `helmet`; CORS restricted to the configured frontend origin.
- NFR-8 Secrets only via environment variables (`.env`, gitignored); `.env.example` documents required variables.
- NFR-9 Automated tests (Jest + Supertest) per service, DB/RabbitMQ mocked so suites need no live infrastructure.

## 5. Out of Scope / Explicitly Simulated

See "Known simplifications" in [architecture.md](../architecture.md#known-simplifications-declared-per-the-assignments-honesty-requirement).

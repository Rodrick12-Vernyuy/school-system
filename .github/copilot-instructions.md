# EduERP Development Notes

- Backend language: JavaScript (Node.js 20), no TypeScript.
- Services use Express, the `pg` driver (raw SQL, no ORM), PostgreSQL, and RabbitMQ (`amqplib`).
- Four independently deployable services: `api-gateway`, `services/academic-service`,
  `services/finance-service`, `services/hr-service`. The Academic Service owns identity
  (`users`, `refresh_tokens` tables) because every role is fundamentally an academic
  institution member; the other services verify JWTs independently using the same
  `JWT_ACCESS_SECRET` rather than storing credentials themselves.
- Frontend: React + Vite + Bootstrap, plain JavaScript, calling only the API Gateway
  (never a microservice directly) via relative `/api/v1/...` paths.
- Use `/api/v1/<auth|academic|finance|hr>` for all public APIs; document routes with
  Swagger/OpenAPI (`swagger-jsdoc` + `swagger-ui-express`) on each service's own `/docs`.
- Passwords are hashed with bcrypt; JWTs are short-lived access tokens + rotated,
  hashed-at-rest refresh tokens. Never store plaintext passwords or commit secrets -
  copy `.env.example` to `.env` and keep `.env` out of git.
- The mandatory async workflow: enrolling a student (Academic Service) publishes
  `student.enrolled` on the shared RabbitMQ topic exchange (`eduerp.events`); the
  Finance Service consumes it idempotently and creates a tuition invoice.
- Run `docker compose up --build` for the full local platform (frontend on :5173,
  gateway on :4000, services on :4001-4003, RabbitMQ management UI on :15672).
- Tests: Jest + Supertest per service, DB/RabbitMQ mocked via manual `__mocks__` so
  suites run without any real infrastructure. Run `npm test` inside each service dir.

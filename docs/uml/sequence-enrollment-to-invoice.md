# Sequence Diagram - Enrollment -> RabbitMQ -> Finance Invoice (mandatory workflow)

This is the required asynchronous, cross-service workflow for the project.
It is implemented in
[services/academic-service/src/controllers/enrollmentController.js](../../services/academic-service/src/controllers/enrollmentController.js)
(publisher) and
[services/finance-service/src/services/invoiceService.js](../../services/finance-service/src/services/invoiceService.js)
(consumer), and is covered by automated tests in both services
(`tests/enrollment.test.js` and `tests/invoiceService.test.js`).

```mermaid
sequenceDiagram
  participant AC as Academic Service
  participant MQ as RabbitMQ (topic exchange "eduerp.events")
  participant FS as Finance Service
  participant FDB as Finance DB

  Note over AC: Enrollment row already committed (see sequence-enrollment.md)
  AC->>MQ: publish "student.enrolled"\n{ enrollmentId, studentId, courseId, credits, ... }
  Note over AC,MQ: Publish failure is logged but does NOT fail\nthe enrollment request itself (see code comment:\nknown gap - no outbox pattern in this academic build)

  MQ->>FS: deliver message (durable queue "finance.student-enrolled")
  activate FS
  FS->>FDB: BEGIN
  FS->>FDB: SELECT 1 FROM processed_events WHERE event_key = ...
  alt event already processed (redelivery)
    FS->>FDB: ROLLBACK
    FS->>MQ: ack (idempotent no-op)
  else new event
    FS->>FDB: SELECT COUNT(*) for invoice number sequence
    FS->>FDB: INSERT INTO invoices (amount = credits * per-credit rate, currency = FCFA)
    FS->>FDB: INSERT INTO processed_events
    FS->>FDB: COMMIT
    FS->>MQ: ack
  end
  deactivate FS

  Note over FS: Student can now see the new invoice under\n"My Invoices & Payments" and pay it via the\nsimulated MTN MoMo / Orange Money gateway.
```

## Why this design

- **Topic exchange, durable queue**: survives a Finance Service restart -
  RabbitMQ holds the message until it is acknowledged.
- **Idempotency via `processed_events`**: RabbitMQ's at-least-once delivery
  means the same message can arrive twice (e.g. consumer crashes after
  processing, before acking). Without this guard a student could be billed
  twice for one enrollment.
- **Enrollment does not block on the publish**: a RabbitMQ outage should not
  prevent a student from enrolling. This is a deliberate trade-off - the
  known gap (an enrollment could be "lost" from Finance's perspective if the
  publish silently fails) is documented in code rather than hidden, and
  would be closed with a transactional outbox pattern in a production system.

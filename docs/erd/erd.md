# Entity-Relationship Diagrams (per service database)

Database-per-service: `academic_db`, `finance_db`, `hr_db` are three
separate PostgreSQL databases with no cross-database foreign keys. All three
are normalized to at least 3NF; indexes are noted where added in each
service's `src/db/schema.sql`.

## academic_db

```mermaid
erDiagram
  USERS ||--o| STUDENTS : "user_id (0..1)"
  STUDENTS ||--o{ ENROLLMENTS : has
  COURSES ||--o{ ENROLLMENTS : has
  ENROLLMENTS ||--o| GRADES : has
  STUDENTS ||--o{ ATTENDANCE : has
  COURSES ||--o{ ATTENDANCE : has
  COURSES ||--o{ EXAMINATIONS : has
  COURSES ||--o{ COURSE_PREREQUISITES : "course_id"
  COURSES ||--o{ COURSE_PREREQUISITES : "prerequisite_course_id"
  GRADES ||--o{ GRADE_APPEALS : has
  USERS ||--o{ REFRESH_TOKENS : has

  USERS {
    uuid id PK
    varchar email UK
    varchar password_hash
    varchar role
    boolean is_active
    int failed_login_attempts
    timestamptz locked_until
  }
  STUDENTS {
    uuid id PK
    uuid user_id FK
    varchar student_number UK
    varchar full_name
    varchar email UK
    varchar status
  }
  COURSES {
    uuid id PK
    varchar code UK
    varchar title
    int credits
    int capacity
  }
  ENROLLMENTS {
    uuid id PK
    uuid student_id FK
    uuid course_id FK
    varchar status
  }
  GRADES {
    uuid id PK
    uuid enrollment_id FK
    numeric score
    varchar letter_grade
    boolean is_passing
  }
  ATTENDANCE {
    uuid id PK
    uuid student_id FK
    uuid course_id FK
    date session_date
    varchar status
  }
  EXAMINATIONS {
    uuid id PK
    uuid course_id FK
    date exam_date
    time start_time
    time end_time
    varchar room
  }
  GRADE_APPEALS {
    uuid id PK
    uuid grade_id FK
    uuid student_id FK
    varchar status
  }
```

## finance_db

```mermaid
erDiagram
  INVOICES ||--o{ PAYMENTS : has
  PAYMENTS ||--|| RECEIPTS : produces
  INVOICES ||--o{ RECEIPTS : "invoice_id"

  INVOICES {
    uuid id PK
    varchar invoice_number UK
    uuid student_id "copied from event, no FK"
    numeric amount
    numeric amount_paid
    varchar status
    uuid source_enrollment_id
  }
  PAYMENTS {
    uuid id PK
    uuid invoice_id FK
    numeric amount
    varchar method
    varchar transaction_reference UK
    varchar status
  }
  RECEIPTS {
    uuid id PK
    varchar receipt_number UK
    uuid payment_id FK
    uuid invoice_id FK
  }
  EXPENSES {
    uuid id PK
    varchar category
    numeric amount
    date expense_date
  }
  CAMPAIGNS {
    uuid id PK
    varchar name
    numeric budget
    int leads
    int conversions
    numeric revenue
  }
  PROCESSED_EVENTS {
    varchar event_key PK
    timestamptz processed_at
  }
```

## hr_db

```mermaid
erDiagram
  EMPLOYEES ||--o{ PAYROLL_RUNS : has
  EMPLOYEES ||--o{ HR_ATTENDANCE : has
  EMPLOYEES ||--o{ LEAVE_REQUESTS : has
  EMPLOYEES ||--o{ PERFORMANCE_REVIEWS : has
  EMPLOYEES ||--o{ ASSETS : "assigned_employee_id"

  EMPLOYEES {
    uuid id PK
    varchar employee_number UK
    varchar department
    varchar position
    numeric salary
    varchar qr_code_token UK
    varchar status
  }
  PAYROLL_RUNS {
    uuid id PK
    uuid employee_id FK
    varchar pay_period
    numeric gross_salary
    numeric cnps_deduction
    numeric paye_deduction
    numeric net_salary
  }
  PAYROLL_CONFIG {
    int id PK "singleton row, id=1"
    numeric cnps_rate
    numeric paye_rate
  }
  HR_ATTENDANCE {
    uuid id PK
    uuid employee_id FK
    date attendance_date
    timestamptz check_in_time
  }
  LEAVE_REQUESTS {
    uuid id PK
    uuid employee_id FK
    date start_date
    date end_date
    varchar status
  }
  PERFORMANCE_REVIEWS {
    uuid id PK
    uuid employee_id FK
    numeric score
    date review_date
  }
  ASSETS {
    uuid id PK
    varchar name
    varchar category
    uuid assigned_employee_id FK
    numeric value
    varchar status
  }
  RECRUITMENT {
    uuid id PK
    varchar candidate_name
    varchar position
    varchar status
  }
```

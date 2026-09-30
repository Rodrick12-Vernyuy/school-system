# Use Case Diagram

```mermaid
graph LR
  SuperAdmin((Super Admin))
  Admin((Admin))
  Staff((Staff))
  Student((Student))

  subgraph Academic
    UC1[Manage Students]
    UC2[Manage Courses]
    UC3[Enroll in Course]
    UC4[Enter / View Grades]
    UC5[Record / View Attendance]
    UC6[Schedule Examinations]
    UC7[Submit / Review Grade Appeal]
    UC8[View At-Risk Status]
  end

  subgraph Finance
    UC9[View / Pay Invoice]
    UC10[Record Expense]
    UC11[View Financial Reports]
    UC12[Manage Marketing Campaign]
  end

  subgraph HR
    UC13[Manage Employees]
    UC14[Track Recruitment]
    UC15[Run Payroll]
    UC16[QR Check-In]
    UC17[Request / Approve Leave]
    UC18[Record Performance Review]
    UC19[Manage Assets]
  end

  UC20[Manage User Accounts]

  Student --> UC3
  Student --> UC4
  Student --> UC5
  Student --> UC7
  Student --> UC8
  Student --> UC9

  Staff --> UC1
  Staff --> UC2
  Staff --> UC4
  Staff --> UC5
  Staff --> UC6
  Staff --> UC7
  Staff --> UC16
  Staff --> UC17

  Admin --> UC1
  Admin --> UC2
  Admin --> UC9
  Admin --> UC10
  Admin --> UC11
  Admin --> UC12
  Admin --> UC13
  Admin --> UC14
  Admin --> UC15
  Admin --> UC17
  Admin --> UC18
  Admin --> UC19

  SuperAdmin --> UC20
  SuperAdmin -.inherits all Admin use cases.-> Admin
```

## Notes

- Enrolling in a course (UC3) is the trigger for the mandatory asynchronous
  workflow described in [sequence-enrollment-to-invoice.md](./sequence-enrollment-to-invoice.md):
  it always results in an automatically generated tuition invoice.
- `Manage User Accounts` (creating Admin/Staff/Super Admin logins) is restricted
  to Super Admin (and Admin, for Staff-level accounts only) - see
  `POST /api/v1/auth/register-staff` in the Academic Service.

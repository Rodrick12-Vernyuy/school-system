# Class / Domain Model Diagram

Each service owns its own tables; there are no cross-service foreign keys or
joins (database-per-service). Cross-service references (e.g. an invoice's
`student_id`) are plain UUIDs copied from the event payload, not enforced
foreign keys - a deliberate microservices trade-off, documented here rather
than hidden.

```mermaid
classDiagram
  namespace AcademicService {
    class User {
      +UUID id
      +string email
      +string passwordHash
      +Role role
      +string fullName
      +boolean isActive
      +int failedLoginAttempts
      +DateTime lockedUntil
    }
    class Student {
      +UUID id
      +UUID userId
      +string studentNumber
      +string fullName
      +string program
      +string level
      +string status
    }
    class Course {
      +UUID id
      +string code
      +string title
      +int credits
      +int capacity
    }
    class Enrollment {
      +UUID id
      +UUID studentId
      +UUID courseId
      +string status
    }
    class Grade {
      +UUID id
      +UUID enrollmentId
      +decimal score
      +string letterGrade
      +boolean isPassing
    }
    class Attendance {
      +UUID id
      +UUID studentId
      +UUID courseId
      +Date sessionDate
      +string status
    }
    class Examination {
      +UUID id
      +UUID courseId
      +Date examDate
      +Time startTime
      +Time endTime
      +string room
    }
    class GradeAppeal {
      +UUID id
      +UUID gradeId
      +UUID studentId
      +string reason
      +string status
    }
    User "1" --> "0..1" Student : links to
    Student "1" --> "many" Enrollment
    Course "1" --> "many" Enrollment
    Enrollment "1" --> "0..1" Grade
    Student "1" --> "many" Attendance
    Course "1" --> "many" Attendance
    Course "1" --> "many" Examination
    Grade "1" --> "many" GradeAppeal
  }

  namespace FinanceService {
    class Invoice {
      +UUID id
      +string invoiceNumber
      +UUID studentId
      +decimal amount
      +decimal amountPaid
      +string currency = FCFA
      +string status
      +UUID sourceEnrollmentId
    }
    class Payment {
      +UUID id
      +UUID invoiceId
      +decimal amount
      +string method
      +string transactionReference
      +string status
    }
    class Receipt {
      +UUID id
      +string receiptNumber
      +UUID paymentId
      +UUID invoiceId
    }
    class Expense {
      +UUID id
      +string category
      +decimal amount
      +Date expenseDate
    }
    class Campaign {
      +UUID id
      +string name
      +decimal budget
      +int leads
      +int conversions
      +decimal revenue
    }
    Invoice "1" --> "many" Payment
    Payment "1" --> "1" Receipt
  }

  namespace HRService {
    class Employee {
      +UUID id
      +string employeeNumber
      +string department
      +string position
      +decimal salary
      +string qrCodeToken
      +string status
    }
    class PayrollRun {
      +UUID id
      +UUID employeeId
      +string payPeriod
      +decimal grossSalary
      +decimal cnpsDeduction
      +decimal payeDeduction
      +decimal netSalary
    }
    class LeaveRequest {
      +UUID id
      +UUID employeeId
      +Date startDate
      +Date endDate
      +string status
    }
    class PerformanceReview {
      +UUID id
      +UUID employeeId
      +decimal score
      +Date reviewDate
    }
    class Asset {
      +UUID id
      +string name
      +string category
      +UUID assignedEmployeeId
      +decimal value
    }
    Employee "1" --> "many" PayrollRun
    Employee "1" --> "many" LeaveRequest
    Employee "1" --> "many" PerformanceReview
    Employee "1" --> "many" Asset : assigned
  }
```

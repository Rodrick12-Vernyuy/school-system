-- Administration & HR Service schema (hr_db)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(30),
  department VARCHAR(120) NOT NULL,
  position VARCHAR(120) NOT NULL,
  salary NUMERIC(12,2) NOT NULL CHECK (salary >= 0),
  employment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  qr_code_token VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(full_name);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

CREATE TABLE IF NOT EXISTS recruitment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255),
  position VARCHAR(120) NOT NULL,
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'interview', 'selected', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recruitment_status ON recruitment(status);

-- Statutory deduction rates are configurable (not hard-coded) so they can be
-- updated by an administrator without touching payroll code. Rates are
-- documented placeholders for demonstration purposes - see README for the
-- explicit disclaimer that these are NOT verified legal CNPS/PAYE rates.
CREATE TABLE IF NOT EXISTS payroll_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- singleton row
  cnps_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0420,   -- 4.20% placeholder employee CNPS contribution
  paye_rate NUMERIC(5,4) NOT NULL DEFAULT 0.1000,   -- 10.00% placeholder flat PAYE rate
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO payroll_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pay_period VARCHAR(7) NOT NULL, -- 'YYYY-MM'
  basic_salary NUMERIC(12,2) NOT NULL,
  allowances NUMERIC(12,2) NOT NULL DEFAULT 0,
  gross_salary NUMERIC(12,2) NOT NULL,
  cnps_deduction NUMERIC(12,2) NOT NULL,
  paye_deduction NUMERIC(12,2) NOT NULL,
  other_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(12,2) NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, pay_period)
);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll_runs(pay_period);

CREATE TABLE IF NOT EXISTS hr_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  method VARCHAR(20) NOT NULL DEFAULT 'qr_code',
  UNIQUE (employee_id, attendance_date)
);
CREATE INDEX IF NOT EXISTS idx_hr_attendance_date ON hr_attendance(attendance_date);

CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL DEFAULT 'annual',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);

CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  score NUMERIC(4,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  comments TEXT,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_performance_employee ON performance_reviews(employee_id);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  category VARCHAR(60) NOT NULL,
  assigned_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  purchase_date DATE,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'in_use' CHECK (status IN ('in_use', 'in_storage', 'under_repair', 'disposed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_employee ON assets(assigned_employee_id);

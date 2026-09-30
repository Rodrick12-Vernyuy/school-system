// Role -> navigation items shown in the sidebar. This mirrors (but does not
// replace) the backend's own role checks - see ProtectedRoute.jsx and each
// service's requireRole() middleware for the real enforcement.
import {
  FiGrid, FiUsers, FiBookOpen, FiCalendar, FiFileText, FiDollarSign,
  FiTrendingUp, FiUserCheck, FiClock, FiBriefcase, FiCreditCard, FiAward,
} from 'react-icons/fi';

export const NAV_BY_ROLE = {
  super_admin: [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/students', label: 'Students', icon: FiUsers },
    { to: '/courses', label: 'Courses & Enrollment', icon: FiBookOpen },
    { to: '/exams', label: 'Examinations', icon: FiCalendar },
    { to: '/appeals', label: 'Grade Appeals', icon: FiFileText },
    { to: '/invoices', label: 'Invoices', icon: FiDollarSign },
    { to: '/expenses', label: 'Expenses', icon: FiCreditCard },
    { to: '/reports', label: 'Financial Reports', icon: FiTrendingUp },
    { to: '/campaigns', label: 'Marketing Campaigns', icon: FiAward },
    { to: '/employees', label: 'Employees', icon: FiBriefcase },
    { to: '/recruitment', label: 'Recruitment', icon: FiUserCheck },
    { to: '/payroll', label: 'Payroll', icon: FiDollarSign },
    { to: '/leave', label: 'Leave Management', icon: FiClock },
    { to: '/attendance-qr', label: 'QR Attendance', icon: FiCalendar },
    { to: '/assets', label: 'Assets', icon: FiBriefcase },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/students', label: 'Students', icon: FiUsers },
    { to: '/courses', label: 'Courses & Enrollment', icon: FiBookOpen },
    { to: '/exams', label: 'Examinations', icon: FiCalendar },
    { to: '/appeals', label: 'Grade Appeals', icon: FiFileText },
    { to: '/invoices', label: 'Invoices', icon: FiDollarSign },
    { to: '/expenses', label: 'Expenses', icon: FiCreditCard },
    { to: '/reports', label: 'Financial Reports', icon: FiTrendingUp },
    { to: '/employees', label: 'Employees', icon: FiBriefcase },
    { to: '/recruitment', label: 'Recruitment', icon: FiUserCheck },
    { to: '/payroll', label: 'Payroll', icon: FiDollarSign },
    { to: '/leave', label: 'Leave Management', icon: FiClock },
  ],
  staff: [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/students', label: 'Students', icon: FiUsers },
    { to: '/courses', label: 'Courses & Enrollment', icon: FiBookOpen },
    { to: '/exams', label: 'Examinations', icon: FiCalendar },
    { to: '/appeals', label: 'Grade Appeals', icon: FiFileText },
    { to: '/attendance-qr', label: 'QR Attendance', icon: FiCalendar },
    { to: '/leave', label: 'Leave Management', icon: FiClock },
  ],
  student: [
    { to: '/dashboard', label: 'My Dashboard', icon: FiGrid },
    { to: '/my-courses', label: 'My Courses', icon: FiBookOpen },
    { to: '/my-invoices', label: 'My Invoices & Payments', icon: FiDollarSign },
    { to: '/appeals', label: 'Grade Appeals', icon: FiFileText },
  ],
};

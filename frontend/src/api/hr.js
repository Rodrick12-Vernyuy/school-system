import client from './client';

const base = '/hr';

export const hrApi = {
  listEmployees: (params) => client.get(`${base}/employees`, { params }).then((r) => r.data),
  createEmployee: (payload) => client.post(`${base}/employees`, payload).then((r) => r.data),
  updateEmployee: (id, payload) => client.put(`${base}/employees/${id}`, payload).then((r) => r.data),
  deactivateEmployee: (id) => client.delete(`${base}/employees/${id}`).then((r) => r.data),

  listRecruitment: (params) => client.get(`${base}/recruitment`, { params }).then((r) => r.data),
  createCandidate: (payload) => client.post(`${base}/recruitment`, payload).then((r) => r.data),
  updateCandidateStatus: (id, status) => client.patch(`${base}/recruitment/${id}/status`, { status }).then((r) => r.data),

  getPayrollConfig: () => client.get(`${base}/payroll/config`).then((r) => r.data),
  updatePayrollConfig: (payload) => client.put(`${base}/payroll/config`, payload).then((r) => r.data),
  runPayroll: (payload) => client.post(`${base}/payroll/run`, payload).then((r) => r.data),
  listPayrollForEmployee: (employeeId) => client.get(`${base}/payroll/employee/${employeeId}`).then((r) => r.data),

  checkInQr: (qrToken) => client.post(`${base}/attendance/check-in`, { qrToken }).then((r) => r.data),
  listAttendanceForDate: (date) => client.get(`${base}/attendance`, { params: { date } }).then((r) => r.data),

  submitLeave: (payload) => client.post(`${base}/leave`, payload).then((r) => r.data),
  listPendingLeave: () => client.get(`${base}/leave/pending`).then((r) => r.data),
  listLeaveForEmployee: (employeeId) => client.get(`${base}/leave/employee/${employeeId}`).then((r) => r.data),
  reviewLeave: (id, decision) => client.patch(`${base}/leave/${id}`, { decision }).then((r) => r.data),

  recordPerformance: (payload) => client.post(`${base}/performance`, payload).then((r) => r.data),
  listPerformanceForEmployee: (employeeId) => client.get(`${base}/performance/employee/${employeeId}`).then((r) => r.data),

  listAssets: (params) => client.get(`${base}/assets`, { params }).then((r) => r.data),
  createAsset: (payload) => client.post(`${base}/assets`, payload).then((r) => r.data),

  dashboardSummary: () => client.get(`${base}/dashboard/summary`).then((r) => r.data),
};

export const gatewayApi = {
  serviceHealth: () => client.get('/health/services').then((r) => r.data),
};

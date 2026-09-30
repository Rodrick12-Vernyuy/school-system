import client from './client';

const base = '/finance';

export const financeApi = {
  listInvoices: (params) => client.get(`${base}/invoices`, { params }).then((r) => r.data),
  listInvoicesForStudent: (studentId) => client.get(`${base}/invoices/student/${studentId}`).then((r) => r.data),

  pay: (payload) => client.post(`${base}/payments`, payload).then((r) => r.data),

  listReceiptsForInvoice: (invoiceId) => client.get(`${base}/receipts/invoice/${invoiceId}`).then((r) => r.data),

  listExpenses: (params) => client.get(`${base}/expenses`, { params }).then((r) => r.data),
  createExpense: (payload) => client.post(`${base}/expenses`, payload).then((r) => r.data),

  dailySummary: (date) => client.get(`${base}/reports/daily-summary`, { params: { date } }).then((r) => r.data),
  monthlySummary: (month) => client.get(`${base}/reports/monthly-summary`, { params: { month } }).then((r) => r.data),
  outstandingFees: () => client.get(`${base}/reports/outstanding-fees`).then((r) => r.data),

  listCampaigns: () => client.get(`${base}/campaigns`).then((r) => r.data),
  createCampaign: (payload) => client.post(`${base}/campaigns`, payload).then((r) => r.data),
  updateCampaign: (id, payload) => client.put(`${base}/campaigns/${id}`, payload).then((r) => r.data),
};

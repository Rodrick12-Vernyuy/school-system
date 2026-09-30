import client from './client';

const base = '/academic';

export const academicApi = {
  listStudents: (params) => client.get(`${base}/students`, { params }).then((r) => r.data),
  getMyStudentProfile: () => client.get(`${base}/students/me`).then((r) => r.data),
  getStudent: (id) => client.get(`${base}/students/${id}`).then((r) => r.data),
  createStudent: (payload) => client.post(`${base}/students`, payload).then((r) => r.data),
  updateStudent: (id, payload) => client.put(`${base}/students/${id}`, payload).then((r) => r.data),
  deactivateStudent: (id) => client.delete(`${base}/students/${id}`).then((r) => r.data),
  riskStatus: (id) => client.get(`${base}/students/${id}/risk-status`).then((r) => r.data),

  listCourses: () => client.get(`${base}/courses`).then((r) => r.data),
  createCourse: (payload) => client.post(`${base}/courses`, payload).then((r) => r.data),
  addPrerequisite: (courseId, prerequisiteCourseId) =>
    client.post(`${base}/courses/${courseId}/prerequisites`, { prerequisiteCourseId }).then((r) => r.data),

  enroll: (studentId, courseId) => client.post(`${base}/enrollments`, { studentId, courseId }).then((r) => r.data),
  listEnrollmentsForStudent: (studentId) => client.get(`${base}/enrollments/student/${studentId}`).then((r) => r.data),

  enterGrade: (payload) => client.post(`${base}/grades`, payload).then((r) => r.data),
  listGradesForStudent: (studentId) => client.get(`${base}/grades/student/${studentId}`).then((r) => r.data),

  recordAttendance: (payload) => client.post(`${base}/attendance`, payload).then((r) => r.data),
  listAttendanceForStudent: (studentId) => client.get(`${base}/attendance/student/${studentId}`).then((r) => r.data),

  scheduleExam: (payload) => client.post(`${base}/exams`, payload).then((r) => r.data),
  listExams: () => client.get(`${base}/exams`).then((r) => r.data),

  submitAppeal: (payload) => client.post(`${base}/appeals`, payload).then((r) => r.data),
  reviewAppeal: (id, decision) => client.patch(`${base}/appeals/${id}/review`, { decision }).then((r) => r.data),
  listAppeals: () => client.get(`${base}/appeals`).then((r) => r.data),
};

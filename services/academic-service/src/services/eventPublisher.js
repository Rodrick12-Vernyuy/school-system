// Publishes domain events onto the shared RabbitMQ topic exchange.
// STUDENT_ENROLLED is the mandatory cross-service workflow: the Finance
// Service consumes it and automatically creates a tuition invoice.
const { publishEvent } = require('../config/rabbitmq');

const ROUTING_KEYS = {
  STUDENT_ENROLLED: 'student.enrolled',
};

async function publishStudentEnrolled({ enrollmentId, studentId, studentName, studentEmail, courseId, courseCode, courseTitle, credits }) {
  await publishEvent(ROUTING_KEYS.STUDENT_ENROLLED, {
    eventType: 'STUDENT_ENROLLED',
    enrollmentId,
    studentId,
    studentName,
    studentEmail,
    courseId,
    courseCode,
    courseTitle,
    credits,
    occurredAt: new Date().toISOString(),
  });
}

module.exports = { ROUTING_KEYS, publishStudentEnrolled };

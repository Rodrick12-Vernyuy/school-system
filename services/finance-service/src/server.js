const app = require('./app');
const { consumeStudentEnrolled } = require('./config/rabbitmq');
const { createInvoiceFromEnrollmentEvent } = require('./services/invoiceService');

const PORT = process.env.FINANCE_PORT || process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`[finance-service] listening on port ${PORT}`);
});

// Start the async consumer that implements the mandatory workflow:
// STUDENT_ENROLLED (RabbitMQ) -> automatic tuition invoice creation.
// Retries the connection so a slow-starting RabbitMQ container (common in
// `docker compose up`) does not crash this service on boot.
async function startConsumerWithRetry(retriesLeft = 10) {
  try {
    await consumeStudentEnrolled(createInvoiceFromEnrollmentEvent);
  } catch (err) {
    if (retriesLeft <= 0) {
      console.error('[finance-service] giving up connecting to RabbitMQ:', err.message);
      return;
    }
    console.warn(`[finance-service] RabbitMQ not ready (${err.message}), retrying in 5s...`);
    setTimeout(() => startConsumerWithRetry(retriesLeft - 1), 5000);
  }
}

startConsumerWithRetry();

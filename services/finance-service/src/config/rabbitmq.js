// RabbitMQ helper for finance-service. Unlike academic-service (which only
// publishes), this service both consumes (student.enrolled) and could
// publish its own events in the future (e.g. invoice.paid). The exchange
// name and topology must match academic-service exactly for the binding
// to work.
const amqp = require('amqplib');

const EXCHANGE = 'eduerp.events';
const QUEUE = 'finance.student-enrolled';
const ROUTING_KEY = 'student.enrolled';

let connection = null;
let channel = null;

async function getChannel() {
  if (channel) return channel;
  const url = process.env.RABBITMQ_URL || 'amqp://erp:erp_dev_password@localhost:5672';
  connection = await amqp.connect(url);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  connection.on('close', () => {
    console.warn('[finance-service] RabbitMQ connection closed');
    channel = null;
    connection = null;
  });
  return channel;
}

// Subscribes `handler(payload, ackFn, nackFn)` to the student.enrolled
// routing key via a durable queue bound to the shared topic exchange.
async function consumeStudentEnrolled(handler) {
  const ch = await getChannel();
  await ch.assertQueue(QUEUE, { durable: true });
  await ch.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
  ch.prefetch(1);
  await ch.consume(QUEUE, async (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      await handler(payload);
      ch.ack(msg);
    } catch (err) {
      console.error('[finance-service] failed to process student.enrolled message', err.message);
      // requeue=false avoids an infinite poison-message loop; a real system
      // would route this to a dead-letter queue for inspection.
      ch.nack(msg, false, false);
    }
  });
  console.log(`[finance-service] consuming queue "${QUEUE}" bound to "${ROUTING_KEY}"`);
}

module.exports = { getChannel, consumeStudentEnrolled, EXCHANGE, QUEUE };

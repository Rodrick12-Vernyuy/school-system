// RabbitMQ connection helper. Kept intentionally small: one connection,
// one channel, reused across the app's lifetime. If RabbitMQ is briefly
// unavailable, publish() will retry a connection on the next call rather
// than crash the whole service (student enrollment itself must still work
// even if the async invoice-creation side effect is temporarily delayed).
const amqp = require('amqplib');

const EXCHANGE = 'eduerp.events';
let connection = null;
let channel = null;

async function getChannel() {
  if (channel) return channel;
  const url = process.env.RABBITMQ_URL || 'amqp://erp:erp_dev_password@localhost:5672';
  connection = await amqp.connect(url);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  connection.on('close', () => {
    console.warn('[academic-service] RabbitMQ connection closed');
    channel = null;
    connection = null;
  });
  return channel;
}

async function publishEvent(routingKey, payload) {
  const ch = await getChannel();
  const buffer = Buffer.from(JSON.stringify(payload));
  ch.publish(EXCHANGE, routingKey, buffer, { persistent: true, contentType: 'application/json' });
  console.log(`[academic-service] published event ${routingKey}`, payload);
}

module.exports = { getChannel, publishEvent, EXCHANGE };

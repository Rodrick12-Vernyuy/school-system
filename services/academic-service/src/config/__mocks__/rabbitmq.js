// Manual Jest mock for the RabbitMQ helper - lets tests assert that an event
// was published without needing a real broker running.
module.exports = {
  getChannel: jest.fn(),
  publishEvent: jest.fn().mockResolvedValue(undefined),
  EXCHANGE: 'eduerp.events',
};

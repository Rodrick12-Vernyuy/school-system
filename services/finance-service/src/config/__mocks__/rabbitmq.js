module.exports = {
  getChannel: jest.fn(),
  consumeStudentEnrolled: jest.fn().mockResolvedValue(undefined),
  EXCHANGE: 'eduerp.events',
  QUEUE: 'finance.student-enrolled',
};

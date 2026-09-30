// Manual mock supporting both pool.query() (used by most controllers) and
// pool.connect() -> client.query()/release() (used by authController's
// register(), which runs users+students inserts in one transaction).
const mockClient = { query: jest.fn(), release: jest.fn() };
module.exports = {
  query: jest.fn(),
  connect: jest.fn().mockResolvedValue(mockClient),
  __mockClient: mockClient,
};

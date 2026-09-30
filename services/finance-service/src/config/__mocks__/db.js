// Manual mock: supports both pool.query() and the pool.connect() ->
// client.query()/release() transaction pattern used by invoiceService and
// paymentController.
const mockClient = { query: jest.fn(), release: jest.fn() };
module.exports = {
  query: jest.fn(),
  connect: jest.fn().mockResolvedValue(mockClient),
  __mockClient: mockClient,
};

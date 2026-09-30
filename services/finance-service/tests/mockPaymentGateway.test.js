const { simulateMobileMoneyCharge } = require('../src/services/mockPaymentGateway');

describe('simulateMobileMoneyCharge (simulated MTN MoMo / Orange Money)', () => {
  test('approves a well-formed phone number', () => {
    const result = simulateMobileMoneyCharge({ method: 'mtn_momo', phoneNumber: '671234567' });
    expect(result.success).toBe(true);
    expect(result.transactionReference).toMatch(/^SIM-MTN_MOMO-/);
  });

  test('declines a phone number ending in 0000 (simulation rule)', () => {
    const result = simulateMobileMoneyCharge({ method: 'orange_money', phoneNumber: '690000000' });
    expect(result.success).toBe(false);
  });
});

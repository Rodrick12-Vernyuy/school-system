const { withMetrics } = require('../src/controllers/campaignController');

describe('campaign conversion rate and ROI calculation', () => {
  test('computes conversion rate and ROI correctly', () => {
    const campaign = { leads: 200, conversions: 40, budget: 500000, revenue: 900000 };
    const result = withMetrics(campaign);
    expect(result.conversionRate).toBe(20); // 40/200
    expect(result.roi).toBe(80); // (900000-500000)/500000 * 100
  });

  test('handles zero leads/budget without dividing by zero', () => {
    const result = withMetrics({ leads: 0, conversions: 0, budget: 0, revenue: 0 });
    expect(result.conversionRate).toBe(0);
    expect(result.roi).toBe(0);
  });
});

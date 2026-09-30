// Aggregates each downstream service's own /health endpoint so the frontend
// (Super Admin dashboard: "Service health") can show system-wide status
// with a single request instead of three.
const express = require('express');
const axios = require('axios');

const router = express.Router();

const SERVICES = {
  'academic-service': process.env.ACADEMIC_SERVICE_URL || 'http://localhost:4001',
  'finance-service': process.env.FINANCE_SERVICE_URL || 'http://localhost:4002',
  'hr-service': process.env.HR_SERVICE_URL || 'http://localhost:4003',
};

router.get('/services', async (req, res) => {
  const results = await Promise.all(
    Object.entries(SERVICES).map(async ([name, url]) => {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 3000 });
        return [name, { status: response.data.status || 'ok', reachable: true }];
      } catch (err) {
        return [name, { status: 'unreachable', reachable: false, error: err.message }];
      }
    })
  );
  const services = Object.fromEntries(results);
  const allHealthy = Object.values(services).every((s) => s.reachable);
  res.json({ gateway: 'ok', allHealthy, services });
});

module.exports = router;

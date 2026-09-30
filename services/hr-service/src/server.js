const app = require('./app');

const PORT = process.env.HR_PORT || process.env.PORT || 4003;

app.listen(PORT, () => {
  console.log(`[hr-service] listening on port ${PORT}`);
});

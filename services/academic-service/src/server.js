const app = require('./app');

const PORT = process.env.ACADEMIC_PORT || process.env.PORT || 4001;

app.listen(PORT, () => {
  console.log(`[academic-service] listening on port ${PORT}`);
});

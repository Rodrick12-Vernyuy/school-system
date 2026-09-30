require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const examRoutes = require('./routes/examRoutes');
const appealRoutes = require('./routes/appealRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Security headers (helmet) - mitigates several OWASP risks (clickjacking,
// MIME sniffing, etc.) with one line.
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Request logging: method, url, status, response time - visible per request
// for tracing which service/user/error occurred (no secrets are logged).
morgan.token('user', (req) => (req.user ? req.user.id : 'anonymous'));
app.use(morgan(':date[iso] :method :url :status :response-time ms user=:user'));

// Basic in-service rate limiting as a second layer beneath the gateway's own
// limiter (defense in depth - this service is also safe if called directly).
app.use(rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'academic-service', timestamp: new Date().toISOString() }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/students', studentRoutes);
app.use('/courses', courseRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/grades', gradeRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/exams', examRoutes);
app.use('/appeals', appealRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

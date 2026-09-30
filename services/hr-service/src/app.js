require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./swagger');
const employeeRoutes = require('./routes/employeeRoutes');
const recruitmentRoutes = require('./routes/recruitmentRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const assetRoutes = require('./routes/assetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

morgan.token('user', (req) => (req.user ? req.user.id : 'anonymous'));
app.use(morgan(':date[iso] :method :url :status :response-time ms user=:user'));

app.use(rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'hr-service', timestamp: new Date().toISOString() }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/employees', employeeRoutes);
app.use('/recruitment', recruitmentRoutes);
app.use('/payroll', payrollRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/leave', leaveRoutes);
app.use('/performance', performanceRoutes);
app.use('/assets', assetRoutes);
app.use('/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

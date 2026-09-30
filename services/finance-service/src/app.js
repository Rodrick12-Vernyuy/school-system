require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./swagger');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

morgan.token('user', (req) => (req.user ? req.user.id : 'anonymous'));
app.use(morgan(':date[iso] :method :url :status :response-time ms user=:user'));

app.use(rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'finance-service', timestamp: new Date().toISOString() }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/invoices', invoiceRoutes);
app.use('/payments', paymentRoutes);
app.use('/receipts', receiptRoutes);
app.use('/expenses', expenseRoutes);
app.use('/reports', reportRoutes);
app.use('/campaigns', campaignRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

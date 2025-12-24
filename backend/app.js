const express = require('express');
const cors = require('cors');
// const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const voucherRoutes = require('./routes/vouchers.routes');
const reportRoutes = require('./routes/reports.routes');
const supplierRoutes = require('./routes/suppliers.routes');
const userRoutes = require('./routes/users.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// app.use(helmet({
//    contentSecurityPolicy: false,
// }));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', require('./routes/branches.routes'));
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/company', require('./routes/company.routes'));

// Catch-all for frontend (Single Page Application behavior if needed, or just redirect)
app.get('*', (req, res) => {
    // API 404
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ message: 'Resource not found' });
    }
    // Serve index.html for any other route to handle frontend routing (hash based or history API)
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error Handler
app.use(errorHandler);

module.exports = app;

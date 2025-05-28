const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

// Load env vars
dotenv.config({ path: './.env' });

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workOrderRoutes = require('./routes/workOrderRoutes');
const teamRoutes = require('./routes/teamRoutes');
const vendorTypeRoutes = require('./routes/vendorTypeRoutes');
const vendorRoutes = require('./routes/vendorRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workorders', workOrderRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/vendor-types', vendorTypeRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/buildings', require('./routes/buildingRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/customer-types', require('./routes/customerTypeRoutes'));
app.use('/api/parts', require('./routes/partsRoutes'));


// Base route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CMMS API is running'
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = app;
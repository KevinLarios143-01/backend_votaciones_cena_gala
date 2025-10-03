const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const participantRoutes = require('./routes/participants');
const nominationRoutes = require('./routes/nominations');
const voteRoutes = require('./routes/votes');
const adminRoutes = require('./routes/admin');
const superAdminRoutes = require('./routes/superadmin');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'https://frontendcenagala-production.up.railway.app', 'http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID']
}));
app.use(express.json());



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth-simple', require('./routes/auth-simple'));
app.use('/api/categories', categoryRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/nominations', nominationRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sistema de Votaciones API' });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ 
      status: 'OK', 
      message: 'Database connected', 
      userCount 
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
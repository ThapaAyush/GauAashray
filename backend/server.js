require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Initialize Realtime Socket.IO
initSocket(server);

// Security & Utility Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false // Allows serving uploaded images to frontend
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // requests per window
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root handler - backend service status
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>GauAashray - Backend API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAF6ED; color: #372A1C; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: white; border-radius: 18px; padding: 36px; box-shadow: 0 10px 30px rgba(89, 55, 19, 0.08); max-width: 480px; width: 100%; border: 1px solid #EADBCE; text-align: center; }
          .logo { font-size: 28px; font-weight: 800; color: #80501D; margin-bottom: 6px; }
          .tagline { color: #8F7253; font-size: 14px; margin-bottom: 24px; }
          .badge { display: inline-flex; align-items: center; gap: 8px; background: #E8F4E6; color: #35632A; font-weight: 700; font-size: 13px; padding: 6px 16px; border-radius: 9999px; margin-bottom: 16px; }
          .badge::before { content: ""; width: 8px; height: 8px; background: #419634; border-radius: 50%; display: inline-block; }
          .info { margin-top: 16px; font-size: 12px; color: #9B8167; line-height: 1.6; border-top: 1px solid #F0E6D8; pt: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">GauAashray गौआश्रय</div>
          <div class="tagline">Backend API & Platform Services</div>
          <div class="badge">API Status: Running & Connected to MongoDB Atlas</div>
          <div class="info">
            Backend Port: 5000 &bull; Database: MongoDB Atlas (Connected)
          </div>
        </div>
      </body>
      </html>
    `);
  }

  res.status(200).json({
    status: 'ONLINE',
    service: 'GauAashray Backend API',
    database: 'Connected',
    port: process.env.PORT || 5000,
    health: '/api/health'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'GauAashray Backend API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gaushalas', require('./routes/gaushalaRoutes'));
app.use('/api/rescue', require('./routes/rescueRoutes'));
app.use('/api/medical', require('./routes/medicalRoutes'));
app.use('/api/surrender', require('./routes/surrenderRoutes'));
app.use('/api/cows', require('./routes/cowRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  GauAashray Server Running on Port ${PORT}    `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'} `);
  console.log(`===============================================`);
});

module.exports = { app, server };


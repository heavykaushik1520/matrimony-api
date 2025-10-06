const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/db');
const models = require('./models');

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userAuthRoutes = require('./routes/userAuthRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const basicPreferenceRoutes = require('./routes/basicPreferenceRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Centralized Middleware Configuration
const allowedOrigins = [
  
  'http://localhost:8081',
  'https://artiststation.co.in'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static image files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user/auth', userAuthRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/user/preferences', basicPreferenceRoutes);

app.get('/', (req, res) => {
  res.send('HridaySparshi');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

async function startServer() {
  try {
    await testConnection();
    // await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}.`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1); 
  }
}

startServer();

module.exports = app;

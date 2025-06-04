const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const logger = require('./utils/logger/logger');
const connectDB = require('./config/db');

const app = express();
dotenv.config();

// Connect to MongoDB
connectDB();
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
} catch (err) {
  console.error('✗ Error in authRoutes:', err.message);
}

try {
  const urlRoutes = require('./routes/urlRoutes');
  app.use('/api/url', urlRoutes);
 
} catch (err) {
  console.error('✗ Error in urlRoutes:', err.message);
}

try {
  const urlController = require('./controllers/urlController');
  app.get('/url/:shortUrl', (req, res) => {
    return urlController.redirectUrl(req, res);
  });
} catch (err) {
  console.error('✗ Error loading URL controller:', err.message);
}


// app.use(express.static(path.join(__dirname, 'client/dist')));
// app.use((req, res) => {
//   res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
// });

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  console.log(`Server started successfully on port ${PORT}!`);
});

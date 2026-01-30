require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const logger = require('./utils/logger');
const { sequelize } = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/video');
const paymentRoutes = require('./routes/payment');
const webhookRoutes = require('./routes/webhook');

// Services
const { initTelegramBot } = require('./services/telegramBot');
const { startCleanupJob } = require('./utils/cleanup');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.SITE_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы (собранный frontend)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/webhook', webhookRoutes);

// Health check для Bothost
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Отдача фронтенда для всех остальных маршрутов
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Инициализация
async function start() {
  try {
    // Подключение к БД
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    logger.info('Database connected');

    // Запуск Telegram бота
    initTelegramBot();
    logger.info('Telegram bot initialized');

    // Запуск очистки временных файлов
    startCleanupJob();
    logger.info('Cleanup job started');

    // Запуск сервера
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
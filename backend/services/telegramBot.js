const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');
const videoProcessor = require('./videoProcessor');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

let bot;

function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    logger.warn('Telegram bot token not provided. Bot disabled.');
    return;
  }

  // Для Bothost используем webhook вместо polling
  if (process.env.NODE_ENV === 'production') {
    bot = new TelegramBot(token);
    bot.setWebHook(`${process.env.SITE_URL}/api/webhook/telegram`);
  } else {
    bot = new TelegramBot(token, { polling: true });
  }

  // Команда /start
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🎬 *Добро пожаловать в TikTok HQ Master!*

Я помогу вам улучшить качество видео для TikTok.

📌 *Доступные команды:*
/process - Обработать видео
/balance - Проверить баланс
/buy - Купить подписку
/history - История обработок
/help - Помощь

🚀 Просто отправьте мне видео, и я его обработаю!
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  });

  // Команда /balance
  bot.onText(/\/balance/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
      const user = await User.findOne({ where: { telegramId } });
      
      if (!user) {
        bot.sendMessage(chatId, '❌ Аккаунт не найден. Используйте /start для регистрации.');
        return;
      }

      const message = `
💰 *Ваш баланс*

Тариф: ${user.subscription || 'Бесплатный'}
Видео доступно: ${user.videosLeft || 'Неограниченно'}
Действует до: ${user.subscriptionExpires || 'N/A'}
      `;

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      logger.error('Balance command error:', error);
      bot.sendMessage(chatId, '❌ Ошибка при получении баланса');
    }
  });

  // Обработка видео
  bot.on('video', async (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.video.file_id;
    const telegramId = msg.from.id;

    try {
      // Проверка пользователя
      let user = await User.findOne({ where: { telegramId } });
      
      if (!user) {
        user = await User.create({
          telegramId,
          username: msg.from.username,
          subscription: 'free',
          videosLeft: 1
        });
      }

      // Проверка лимитов
      if (user.videosLeft <= 0 && user.subscription === 'free') {
        bot.sendMessage(chatId, '❌ Лимит видео исчерпан. Купите подписку: /buy');
        return;
      }

      bot.sendMessage(chatId, '⏳ Начинаю обработку видео...');

      // Скачивание видео
      const file = await bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      const inputPath = path.join(process.env.UPLOAD_PATH, `input_${fileId}.mp4`);
      
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(inputPath, Buffer.from(buffer));

      // Обработка
      const addWatermark = user.subscription === 'free';
      const result = await videoProcessor.processVideo(inputPath, user.id, addWatermark);

      // Отправка результата
      await bot.sendVideo(chatId, result.path, {
        caption: '✅ Видео обработано!\n\nСкачать также можно на сайте: ' + process.env.SITE_URL
      });

      // Обновление лимитов
      if (user.subscription === 'free') {
        user.videosLeft -= 1;
        await user.save();
      }

      // Удаление временных файлов
      fs.unlinkSync(inputPath);
      setTimeout(() => fs.unlinkSync(result.path), 60000); // Удалить через минуту

    } catch (error) {
      logger.error('Video processing error:', error);
      bot.sendMessage(chatId, '❌ Ошибка при обработке видео. Попробуйте позже.');
    }
  });

  logger.info('Telegram bot initialized successfully');
}

function getBot() {
  return bot;
}

module.exports = { initTelegramBot, getBot };
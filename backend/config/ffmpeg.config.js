// Оптимальные настройки для TikTok 2026
module.exports = {
  tiktokPreset: {
    videoCodec: 'libx264',
    audioCodec: 'aac',
    videoBitrate: '8000k',
    audioBitrate: '192k',
    fps: 30,
    size: '1080x1920', // Вертикальный формат
    aspect: '9:16',
    preset: 'slow', // Лучшее качество
    crf: 18, // Константа качества (18-22 оптимально)
    profile: 'high',
    level: '4.2',
    pixelFormat: 'yuv420p',
    additionalParams: [
      '-movflags', '+faststart', // Быстрый старт воспроизведения
      '-pix_fmt', 'yuv420p',
      '-color_primaries', 'bt709',
      '-color_trc', 'bt709',
      '-colorspace', 'bt709'
    ]
  },
  
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  maxDuration: 600, // 10 минут
  
  watermark: {
    text: 'TikTok HQ Master',
    position: 'bottom-right',
    fontSize: 24,
    color: 'white@0.5'
  }
};
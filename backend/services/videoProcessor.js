const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const config = require('../config/ffmpeg.config');

class VideoProcessor {
  constructor() {
    // Установка пути к FFmpeg для Bothost
    if (process.env.FFMPEG_PATH) {
      ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
    }
  }

  async processVideo(inputPath, userId, addWatermark = false) {
    const outputFilename = `${uuidv4()}.mp4`;
    const outputPath = path.join(process.env.UPLOAD_PATH, outputFilename);

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath)
        .videoCodec(config.tiktokPreset.videoCodec)
        .audioCodec(config.tiktokPreset.audioCodec)
        .videoBitrate(config.tiktokPreset.videoBitrate)
        .audioBitrate(config.tiktokPreset.audioBitrate)
        .fps(config.tiktokPreset.fps)
        .size(config.tiktokPreset.size)
        .aspect(config.tiktokPreset.aspect)
        .outputOptions([
          `-preset ${config.tiktokPreset.preset}`,
          `-crf ${config.tiktokPreset.crf}`,
          `-profile:v ${config.tiktokPreset.profile}`,
          `-level ${config.tiktokPreset.level}`,
          ...config.tiktokPreset.additionalParams
        ]);

      // Добавление водяного знака для бесплатных пользователей
      if (addWatermark) {
        command = command.videoFilters([
          {
            filter: 'drawtext',
            options: {
              text: config.watermark.text,
              fontsize: config.watermark.fontSize,
              fontcolor: config.watermark.color,
              x: '(w-tw-20)',
              y: '(h-th-20)'
            }
          }
        ]);
      }

      command
        .on('start', (commandLine) => {
          logger.info(`FFmpeg process started: ${commandLine}`);
        })
        .on('progress', (progress) => {
          logger.debug(`Processing: ${progress.percent}% done`);
          // Здесь можно отправлять прогресс через WebSocket
        })
        .on('end', () => {
          logger.info(`Video processed successfully: ${outputFilename}`);
          resolve({
            filename: outputFilename,
            path: outputPath
          });
        })
        .on('error', (err) => {
          logger.error(`FFmpeg error: ${err.message}`);
          reject(err);
        })
        .save(outputPath);
    });
  }

  async getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }

  async validateVideo(filePath) {
    try {
      const metadata = await this.getVideoMetadata(filePath);
      const duration = metadata.format.duration;
      const size = metadata.format.size;

      if (duration > config.maxDuration) {
        throw new Error(`Video too long. Max duration: ${config.maxDuration}s`);
      }

      if (size > config.maxFileSize) {
        throw new Error(`File too large. Max size: ${config.maxFileSize} bytes`);
      }

      return { valid: true, metadata };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new VideoProcessor();
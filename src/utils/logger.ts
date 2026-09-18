/**
 * Winston Logger Configuration for Google Search Console MCP Server
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Determine log level from environment
const logLevel = process.env.LOG_LEVEL || 'info';

// Create logs directory path
const logsDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

// Define log format
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Custom format for console output
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`;
  })
);

// Create the logger
export const logger = winston.createLogger({
  level: logLevel,
  format: jsonFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: customFormat,
    }),

    // Daily rotate file transport for all logs
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'google-search-console-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      format: jsonFormat,
    }),

    // Daily rotate file transport for errors only
    new DailyRotateFile({
      level: 'error',
      dirname: logsDir,
      filename: 'google-search-console-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      format: jsonFormat,
    }),
  ],
});

// Export convenience methods
export const logInfo = (message: string, meta?: Record<string, unknown>) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: unknown, meta?: Record<string, unknown>) => {
  logger.error(message, { error, ...meta });
};

export const logWarn = (message: string, meta?: Record<string, unknown>) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, unknown>) => {
  logger.debug(message, meta);
};

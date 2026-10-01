/**
 * Winston Logger Configuration for Google Search Console MCP Server
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Determine log level from environment
const logLevel = process.env.LOG_LEVEL || 'info';

// File logs are opt-in. Set LOG_DIR to write daily-rotated JSON logs there (kept 30 days).
// Unset (the default), the server writes nothing to disk.
const logsDir = process.env.LOG_DIR;

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

// Every level goes to stderr. stdout belongs to the MCP protocol: a single log line there is
// interleaved with JSON-RPC and can break a strict client.
export const STDERR_LEVELS = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];

const transports: winston.transport[] = [
  new winston.transports.Console({ format: customFormat, stderrLevels: STDERR_LEVELS }),
];

if (logsDir) {
  transports.push(
    new DailyRotateFile({
      dirname: logsDir,
      filename: 'google-search-console-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      format: jsonFormat,
    }),
    new DailyRotateFile({
      level: 'error',
      dirname: logsDir,
      filename: 'google-search-console-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      format: jsonFormat,
    })
  );
}

// Create the logger
export const logger = winston.createLogger({
  level: logLevel,
  format: jsonFormat,
  transports,
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

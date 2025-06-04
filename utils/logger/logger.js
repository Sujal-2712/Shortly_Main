const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, context }) => {
      let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      if (context) {
        logMessage += ` | Context: ${JSON.stringify(context)}`;
      }
      return logMessage;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = {
  info: (message, context) => logger.info(message, { context }),
  warn: (message, context) => logger.warn(message, { context }),
  error: (message, context) => logger.error(message, { context }),
};

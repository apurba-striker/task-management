// backend/src/utils/logger.js
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

const logger = {
  info: (message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [INFO]: ${message} ${args.length ? JSON.stringify(args) : ''}`;
    console.log(logMessage);
    fs.appendFileSync(logFile, logMessage + '\n');
  },
  
  error: (message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [ERROR]: ${message} ${args.length ? JSON.stringify(args) : ''}`;
    console.error(logMessage);
    fs.appendFileSync(logFile, logMessage + '\n');
  },
  
  warn: (message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [WARN]: ${message} ${args.length ? JSON.stringify(args) : ''}`;
    console.warn(logMessage);
    fs.appendFileSync(logFile, logMessage + '\n');
  },
  
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const logMessage = `${timestamp} [DEBUG]: ${message} ${args.length ? JSON.stringify(args) : ''}`;
      console.log(logMessage);
      fs.appendFileSync(logFile, logMessage + '\n');
    }
  }
};

module.exports = logger;

import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;
const myFormat = printf(
  info => `${info.timestamp} ${info.level} : ${info.message}`
);

const logger = createLogger({
  level: process.env.LEVEL || 'info',
  format: combine(timestamp(), myFormat),
  transports: [new transports.Console()],
});

export default logger;

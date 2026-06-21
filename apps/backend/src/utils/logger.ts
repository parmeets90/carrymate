import winston from 'winston';
import { env, isProd } from '../config/env';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} ${level}: ${stack ?? message}${rest}`;
});

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd
    ? combine(timestamp(), errors({ stack: true }), json())
    : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), devFormat),
  defaultMeta: { service: env.APP_NAME },
  transports: [new winston.transports.Console()],
});

import express from 'express';
import accountsRouter from './routes/accounts.js';
import { promises as fs } from 'fs';
import winston from 'winston';

global.fileName = 'accounts.json';
const { readFile, writeFile } = fs;
const app = express();
const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transport.File({ filename: 'my-bank-api.log' }),
  ],
  format: combine(label({ label: 'my-bank-api' }), timestamp(), myFormat),
});

app.use(express.json());

app.use('/account', accountsRouter);

app.listen(3000, async () => {
  try {
    await readFile(global.fileName);
    logger.info('api started');
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };
    writeFile(global.fileName, JSON.stringify(initialJson))
      .then(() => {
        logger.info('api started and file created');
      })
      .catch((err) => {
        logger.error(err);
      });
  }
});

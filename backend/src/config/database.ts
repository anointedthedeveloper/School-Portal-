import mongoose from 'mongoose';
import { env } from './environment';
import { logger } from '../utils/logger';

mongoose.set('strictQuery', true);
// Neutralise query operators smuggled in through user input (e.g. { email: { $ne: null } }).
// Operators built by server code must be wrapped with `trusted()` from mongoose.
mongoose.set('sanitizeFilter', true);

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  logger.info(`MongoDB connected (${mongoose.connection.name})`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}

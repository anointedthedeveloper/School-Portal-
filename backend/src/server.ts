import http from 'node:http';
import { env } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import { schoolConfigService } from './services/schoolConfig.service';
import { createApp } from './app';
import { logger } from './utils/logger';

async function main() {
  await connectDatabase();
  await schoolConfigService.getOrCreate();

  const server = http.createServer(createApp());
  server.listen(env.PORT, () => logger.info(`API listening on http://localhost:${env.PORT}/api (${env.NODE_ENV})`));

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});

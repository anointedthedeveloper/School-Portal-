/**
 * Vercel serverless entry point. Exports the same Express app used by `src/server.ts`;
 * the long-running `listen()` server is not used on Vercel.
 *
 * Environment variables are validated when `../src/app` is first imported, so the import
 * is deferred and guarded: a misconfigured deployment answers with a clear JSON error
 * (details go to the function logs only) instead of a bare FUNCTION_INVOCATION_FAILED.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

// Cached across warm invocations so we connect to MongoDB once per instance.
let ready: Promise<Handler> | null = null;

async function init(): Promise<Handler> {
  const [{ createApp }, { connectDatabase }, { schoolConfigService }] = await Promise.all([
    import('../src/app'),
    import('../src/config/database'),
    import('../src/services/schoolConfig.service'),
  ]);
  await connectDatabase();
  await schoolConfigService.getOrCreate();
  return createApp();
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    ready ??= init();
    const app = await ready;
    app(req, res);
  } catch (err) {
    ready = null; // retry on the next request instead of caching the failure
    console.error('Startup failed:', err);
    res.statusCode = 503;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        success: false,
        message: 'Service is not configured correctly or the database is unreachable. Check the function logs.',
        code: 'STARTUP_FAILED',
      }),
    );
  }
}

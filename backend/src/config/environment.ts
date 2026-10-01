import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CBT_API_KEY: z.string().optional(),
  SEED_PASSWORD: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
});

// A blank value in .env (e.g. `SEED_PASSWORD=`) means "not set", so defaults and `.optional()` apply.
const source = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined && v.trim() !== ''));
const parsed = schema.safeParse(source);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  // Throw rather than exit so a serverless host can report the failure instead of dying silently.
  // Logger is not available yet (it depends on this config), so the message carries the detail.
  throw new Error(`Invalid environment configuration:\n${issues}\nSee backend/.env.example`);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProduction: raw.NODE_ENV === 'production',
  clientOrigins: raw.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean),
} as const;

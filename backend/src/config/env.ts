import { z } from 'zod';
import { config } from 'dotenv';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  ELASTICSEARCH_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(44), // base64 of 32 bytes
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  SLACK_CLIENT_ID: z.string().optional(),
  SLACK_CLIENT_SECRET: z.string().optional(),
  SLACK_REDIRECT_URI: z.string().url().optional(),
  ADMIN_USER: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  WORKER_CONCURRENCY: z.coerce.number().min(1).default(5),
  RUN_WORKER_IN_API: z.string().transform(v => v === 'true').default('false'),
  MIN_DELAY_BETWEEN_EMAILS_MS: z.coerce.number().min(0).default(2000),
  MAX_EMAILS_PER_HOUR_PER_SENDER: z.coerce.number().min(1).default(200),
  DEFAULT_HOURLY_LIMIT: z.coerce.number().min(1).default(200),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().min(1000).default(3600000),
  MAX_RECIPIENTS_PER_REQUEST: z.coerce.number().min(1).default(5000),
  MAX_ATTACHMENT_MB: z.coerce.number().min(1).default(5),
  MAX_ATTACHMENTS: z.coerce.number().min(1).default(5),
  UPLOAD_DIR: z.string().default('./uploads'),
  JOB_ATTEMPTS: z.coerce.number().min(1).default(3),
  JOB_BACKOFF_MS: z.coerce.number().min(100).default(5000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;

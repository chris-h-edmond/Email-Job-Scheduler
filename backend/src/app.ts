import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import sendersRoutes from './routes/senders.js';
import emailsRoutes from './routes/emails.js';

const app = express();

app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Session
const redisClient = createClient({ url: env.REDIS_URL });
if (env.NODE_ENV !== 'test') {
  redisClient.connect().catch((error: unknown) => {
    console.error('Session Redis connection failed', error);
  });
}
const redisStore = new RedisStore({
  client: redisClient as any,
  prefix: 'sess:',
});

app.use(session({
  store: env.NODE_ENV === 'test' ? undefined : redisStore,
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/senders', sendersRoutes);
app.use('/api/emails', emailsRoutes);

app.use(errorHandler);

export default app;

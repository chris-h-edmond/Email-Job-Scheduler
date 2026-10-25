import Redis from 'ioredis';
import { env } from '../config/env.js';

const redisOptions = {
  maxRetriesPerRequest: null,
};

export function createRedisConnection() {
  return new Redis(env.REDIS_URL, redisOptions);
}

export const redis = createRedisConnection();
export const redisQueue = createRedisConnection();
export const redisWorker = createRedisConnection();
export const redisSubscriber = createRedisConnection();

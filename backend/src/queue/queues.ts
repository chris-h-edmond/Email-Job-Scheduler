import { Queue } from 'bullmq';
import { redisQueue } from '../lib/redis.js';

export const emailQueue = new Queue('email-send', {
  connection: redisQueue,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 86400,
      count: 5000,
    },
    removeOnFail: {
      age: 7 * 86400,
    },
  },
});

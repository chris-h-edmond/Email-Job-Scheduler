import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { redis } from '../lib/redis.js';
import { Client } from '@elastic/elasticsearch';
import { env } from '../config/env.js';

const router = Router();
const esClient = new Client({ node: env.ELASTICSEARCH_URL });

router.get('/', async (req, res) => {
  const health = {
    ok: true,
    db: false,
    redis: false,
    elasticsearch: false,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.db = true;
  } catch (e) {
    health.ok = false;
  }

  try {
    await redis.ping();
    health.redis = true;
  } catch (e) {
    health.ok = false;
  }

  try {
    await esClient.ping();
    health.elasticsearch = true;
  } catch (e) {
    health.ok = false;
  }

  res.json(health);
});

export default router;

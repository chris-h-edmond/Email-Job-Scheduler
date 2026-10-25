import { Worker, DelayedError } from 'bullmq';
import { redisWorker } from './lib/redis.js';
import { logger } from './lib/logger.js';
import { prisma } from './db/prisma.js';
import { redis } from './lib/redis.js';
import nodemailer from 'nodemailer';
import { decrypt } from './lib/crypto.js';
import { env } from './config/env.js';

const worker = new Worker('email-send', async (job) => {
  const { emailId } = job.data;
  logger.info({ jobId, emailId }, 'Processing email job');

  const email = await prisma.email.findUnique({
    where: { id: emailId },
    include: { sender: true },
  });

  if (!email || email.status === 'sent' || email.status === 'cancelled' || email.deletedAt) {
    return;
  }

  // Simple claim
  const claimed = await prisma.email.updateMany({
    where: { id: emailId, status: 'scheduled' },
    data: { status: 'processing', processingStartedAt: new Date(), attempts: { increment: 1 } },
  });

  if (claimed.count === 0) {
    return;
  }

  try {
    const smtpPass = decrypt(email.sender.smtpPassEnc);
    const transporter = nodemailer.createTransport({
      host: email.sender.smtpHost,
      port: email.sender.smtpPort,
      secure: false,
      auth: {
        user: email.sender.smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `${email.sender.fromName} <${email.sender.fromEmail}>`,
      to: email.toEmail,
      subject: email.subject,
      html: email.bodyHtml,
      text: email.bodyText,
      headers: {
        'Message-ID': `<${emailId}@reachinbox.local>`,
      },
    });

    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info) || null,
      },
    });

    logger.info({ emailId, to: email.toEmail }, 'Email sent');
  } catch (error: any) {
    logger.error({ emailId, error: error.message }, 'Email send failed');
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: 'scheduled',
        lastError: error.message,
      },
    });
    throw error;
  }
}, {
  connection: redisWorker,
  concurrency: env.WORKER_CONCURRENCY,
  lockDuration: 60000,
  stalledInterval: 30000,
  maxStalledCount: 1,
});

worker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Job failed');
});

logger.info('Worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker');
  await worker.close();
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing worker');
  await worker.close();
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { prisma } from '../db/prisma.js';
import { emailQueue } from '../queue/queues.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(requireAuth);

router.get('/counts', async (req, res) => {
  const userId = (req as any).userId;
  const [scheduled, sent] = await Promise.all([
    prisma.email.count({ where: { userId, status: { in: ['scheduled', 'processing'] }, archived: false, deletedAt: null } }),
    prisma.email.count({ where: { userId, status: { in: ['sent', 'failed'] }, archived: false, deletedAt: null } }),
  ]);
  res.json({ scheduled, sent });
});

router.get('/', async (req, res) => {
  const userId = (req as any).userId;
  const { tab = 'scheduled' } = req.query;
  
  const where: any = {
    userId,
    archived: false,
    deletedAt: null,
  };
  
  if (tab === 'scheduled') {
    where.status = { in: ['scheduled', 'processing'] };
  } else {
    where.status = { in: ['sent', 'failed'] };
  }
  
  const emails = await prisma.email.findMany({
    where,
    orderBy: tab === 'scheduled' ? { scheduledAt: 'asc' } : { sentAt: 'desc' },
    take: 50,
  });
  
  res.json({ items: emails, total: emails.length });
});

router.get('/:id', async (req, res) => {
  const userId = (req as any).userId;
  const email = await prisma.email.findFirst({
    where: { id: req.params.id, userId },
    include: { sender: true, attachments: true },
  });
  
  if (!email) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Email not found' } });
  }
  
  res.json(email);
});

router.post('/schedule', async (req, res) => {
  const userId = (req as any).userId;
  const { senderId, recipients, subject, bodyHtml, startTime, delaySeconds, hourlyLimit } = req.body;
  
  const batchId = uuidv4();
  const start = startTime ? new Date(startTime) : new Date();
  const delay = delaySeconds || 0;
  const limit = hourlyLimit || 200;
  
  const sender = await prisma.sender.findFirst({ where: { id: senderId, userId } });
  if (!sender) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sender not found' } });
  }
  
  const batch = await prisma.$transaction(async (tx: any) => {
    const b = await tx.batch.create({
      data: {
        id: batchId,
        userId,
        senderId,
        idempotencyKey: (req.headers['idempotency-key'] as string) || uuidv4(),
        subject,
        bodyHtml,
        bodyText: bodyHtml.replace(/<[^>]*>/g, ''),
        startTime: start,
        delaySeconds: delay,
        hourlyLimit: limit,
        total: recipients.length,
      },
    });
    
    const emails = [];
    for (let i = 0; i < recipients.length; i++) {
      const emailId = uuidv4();
      emails.push({
        id: emailId,
        userId,
        batchId,
        senderId,
        toEmail: recipients[i].toLowerCase(),
        subject,
        bodyHtml,
        bodyText: bodyHtml.replace(/<[^>]*>/g, ''),
        preview: bodyHtml.replace(/<[^>]*>/g, '').substring(0, 120),
        status: 'scheduled' as const,
        scheduledAt: new Date(start.getTime() + i * delay * 1000),
        originalScheduledAt: new Date(start.getTime() + i * delay * 1000),
        hourlyLimit: limit,
        minDelayMs: 2000,
      });
    }
    
    await tx.email.createMany({ data: emails });
    return b;
  });
  
  // Enqueue jobs
  for (let i = 0; i < recipients.length; i++) {
    const emailRecord = await prisma.email.findFirst({ where: { batchId, toEmail: recipients[i].toLowerCase() } });
    if (emailRecord) {
      await emailQueue.add('send-email', { emailId: emailRecord.id }, {
        jobId: emailRecord.id,
        delay: Math.max(0, new Date(start.getTime() + i * delay * 1000).getTime() - Date.now()),
      });
    }
  }
  
  res.status(201).json({
    batchId: batch.id,
    total: batch.total,
    firstSendAt: batch.startTime,
    estimatedLastSendAt: new Date(batch.startTime.getTime() + (batch.total - 1) * batch.delaySeconds * 1000),
  });
});

export default router;

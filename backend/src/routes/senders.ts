import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { prisma } from '../db/prisma.js';
import nodemailer from 'nodemailer';
import { encrypt } from '../lib/crypto.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const senders = await prisma.sender.findMany({
    where: { userId: (req as any).userId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(senders);
});

router.post('/', async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  const testAccount = await nodemailer.createTestAccount();
  const sender = await prisma.sender.create({
    data: {
      userId,
      label: `Sender ${Date.now()}`,
      fromName: user!.name,
      fromEmail: user!.email,
      smtpHost: 'smtp.ethereal.email',
      smtpPort: 587,
      smtpUser: testAccount.user,
      smtpPassEnc: encrypt(testAccount.pass),
      isDefault: false,
    },
  });
  
  res.status(201).json(sender);
});

export default router;

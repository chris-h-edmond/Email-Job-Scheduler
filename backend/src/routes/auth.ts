import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { encrypt } from '../lib/crypto.js';
import { AppError } from '../lib/errors.js';
import nodemailer from 'nodemailer';
import { randomBytes } from 'node:crypto';
import { logger } from '../lib/logger.js';

const router = Router();
const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);

router.get('/google', (req, res) => {
  const state = randomBytes(32).toString('hex');
  req.session.state = state;
  
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    state,
  });
  
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (typeof code !== 'string' || typeof state !== 'string' || state !== req.session.state) {
      throw new AppError('INVALID_STATE', 'Invalid state parameter', 400);
    }
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    if (!tokens.id_token) {
      throw new AppError('INVALID_TOKEN', 'Google did not return an ID token', 400);
    }
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new AppError('INVALID_TOKEN', 'Invalid token', 400);
    }
    
    const { sub, email, name, picture } = payload;
    if (!sub || !email) {
      throw new AppError('INVALID_TOKEN', 'Google account has no verified identity', 400);
    }

    let user = await prisma.user.findUnique({
      where: { googleSub: sub },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleSub: sub,
          email,
          name: name ?? email,
          avatarUrl: picture,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { email, name: name ?? email, avatarUrl: picture },
      });
    }

    const defaultSender = await prisma.sender.findFirst({ where: { userId: user.id } });
    if (!defaultSender) {
      const testAccount = await nodemailer.createTestAccount();
      await prisma.sender.create({
        data: {
          userId: user.id,
          label: 'Default',
          fromName: name ?? email,
          fromEmail: email,
          smtpHost: 'smtp.ethereal.email',
          smtpPort: 587,
          smtpUser: testAccount.user,
          smtpPassEnc: encrypt(testAccount.pass),
          isDefault: true,
        },
      });
    }

    req.session.regenerate((sessionError) => {
      if (sessionError) {
        logger.error({ err: sessionError }, 'OAuth session regeneration failed');
        res.redirect(`${env.FRONTEND_URL}/login?error=session_failed`);
        return;
      }
      req.session.userId = user.id;
      req.session.save((saveError) => {
        if (saveError) {
          logger.error({ err: saveError }, 'OAuth session save failed');
          res.redirect(`${env.FRONTEND_URL}/login?error=session_failed`);
          return;
        }
        res.redirect(env.FRONTEND_URL);
      });
    });
  } catch (error) {
    logger.warn({ err: error instanceof Error ? error.message : 'unknown' }, 'Google OAuth callback failed');
    res.redirect(`${env.FRONTEND_URL}/login?error=auth_failed`);
  }
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });
  
  if (!user) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found' } });
  }
  
  res.json(user);
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Logout failed' } });
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

export default router;

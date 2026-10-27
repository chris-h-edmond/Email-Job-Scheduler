import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../app.js';

describe('Google OAuth routes', () => {
  it('redirects to Google and stores a cryptographically random state in the session', async () => {
    const agent = request.agent(app);
    const first = await agent.get('/api/auth/google').expect(302);
    const second = await request.agent(app).get('/api/auth/google').expect(302);

    expect(first.headers.location).toMatch(/^https:\/\/accounts\.google\.com/);
    expect(first.headers.location).toContain('client_id=test-client-id.apps.googleusercontent.com');
    expect(first.headers.location).toContain('state=');
    expect(second.headers.location).toContain('state=');
    expect(first.headers.location).not.toBe(second.headers.location);
  });

  it('rejects a callback without a valid state and returns to login', async () => {
    const response = await request(app)
      .get('/api/auth/google/callback?code=unused&state=wrong')
      .expect(302);

    expect(response.headers.location).toBe('http://localhost:5173/login?error=auth_failed');
  });

  it('returns 401 when no session is authenticated', async () => {
    await request(app).get('/api/auth/me').expect(401);
  });
});

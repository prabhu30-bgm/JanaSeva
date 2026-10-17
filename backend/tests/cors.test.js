const request = require('supertest');
const { createApp } = require('../src/app');

describe('CORS Middleware', () => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  const testConfig = {
    cors: { allowedOrigins },
    rateLimit: { windowMs: 60000, max: 100 }
  };
  const app = createApp(testConfig);

  it('should allow requests from permitted origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:3000');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('should allow requests from secondary permitted origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:3002');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3002');
  });

  it('should reject requests from disallowed origin with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://malicious-attacker-site.com');

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'CORS_NOT_ALLOWED');
    expect(res.body.error.message).toContain('not permitted by CORS policy');
  });

  it('should allow requests without Origin header (e.g., mobile apps, server-to-server)', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('should handle preflight OPTIONS requests for allowed origin', async () => {
    const res = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');

    expect([200, 204]).toContain(res.status);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
  });
});

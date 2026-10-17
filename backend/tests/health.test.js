const request = require('supertest');
const { app } = require('../src/app');
const database = require('../src/config/database');

describe('Health and Readiness Endpoints', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  describe('GET /api/health (Process Liveness)', () => {
    it('should return 200 OK with process status and uptime', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('status', 'ok');
      expect(res.body.data).toHaveProperty('uptime');
      expect(typeof res.body.data.uptime).toBe('number');
      expect(res.body.data).toHaveProperty('timestamp');
      expect(new Date(res.body.data.timestamp).toString()).not.toBe('Invalid Date');
    });
  });

  describe('GET /api/health/ready (Database Readiness)', () => {
    it('should return 200 OK when database is connected', async () => {
      jest.spyOn(database, 'getConnectionState').mockReturnValue({
        isConnected: true,
        state: 'connected',
        readyState: 1
      });

      const res = await request(app).get('/api/health/ready');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('ready', true);
      expect(res.body.data.database).toHaveProperty('status', 'connected');
    });

    it('should return 503 Service Unavailable when database is disconnected', async () => {
      jest.spyOn(database, 'getConnectionState').mockReturnValue({
        isConnected: false,
        state: 'disconnected',
        readyState: 0
      });

      const res = await request(app).get('/api/health/ready');

      expect(res.status).toBe(503);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'SERVICE_UNAVAILABLE');
      expect(res.body.data).toHaveProperty('ready', false);
      expect(res.body.data.database).toHaveProperty('status', 'disconnected');
    });
  });
});

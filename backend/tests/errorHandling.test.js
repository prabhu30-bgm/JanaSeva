const request = require('supertest');
const express = require('express');
const { createApp } = require('../src/app');
const ApiError = require('../src/shared/utils/apiError');
const notFoundHandler = require('../src/middleware/notFoundHandler');
const errorHandler = require('../src/middleware/errorHandler');

describe('Error Handling Middleware', () => {
  const app = createApp();

  describe('Unknown Route Handling (404)', () => {
    it('should return 404 with structured JSON for non-existent route', async () => {
      const res = await request(app).get('/api/this-route-does-not-exist');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: expect.stringContaining('Endpoint not found')
        }
      });
    });

    it('should return 404 for POST to non-existent route', async () => {
      const res = await request(app).post('/api/unknown').send({ test: 1 });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Malformed Request Handling', () => {
    it('should return 400 Bad Request with MALFORMED_JSON code on invalid JSON syntax', async () => {
      const res = await request(app)
        .post('/api/health')
        .set('Content-Type', 'application/json')
        .send('{ "invalidJson": unquotedString, }');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        error: {
          code: 'MALFORMED_JSON',
          message: 'Malformed JSON payload in request body.'
        }
      });
    });
  });

  describe('Centralized Error Handling with Custom App Routes', () => {
    let testApp;

    beforeEach(() => {
      testApp = express();
      testApp.use(express.json());

      // Route that throws custom ApiError
      testApp.get('/test/operational-error', (req, res, next) => {
        next(ApiError.badRequest('Custom validation failure', [{ field: 'email', reason: 'invalid' }]));
      });

      // Route that throws unhandled Error
      testApp.get('/test/unhandled-error', (req, res, next) => {
        next(new Error('Unexpected system error'));
      });

      testApp.use(notFoundHandler);
      testApp.use(errorHandler);
    });

    it('should format ApiError with custom status code, code, and details', async () => {
      const res = await request(testApp).get('/test/operational-error');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Custom validation failure',
        details: [{ field: 'email', reason: 'invalid' }]
      });
    });

    it('should format unexpected errors with 500 status and INTERNAL_SERVER_ERROR code', async () => {
      const res = await request(testApp).get('/test/unhandled-error');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});

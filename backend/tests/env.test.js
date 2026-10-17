const { validateEnv } = require('../src/config/env');

describe('Environment Configuration Validation', () => {
  const baseValidEnv = {
    NODE_ENV: 'test',
    PORT: '5000',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/janaseva_test',
    JWT_SECRET: 'super_secret_test_key_at_least_32_characters_long',
    ALLOWED_ORIGINS: 'http://localhost:3000,http://localhost:3001'
  };

  it('should successfully validate and normalize correct configuration', () => {
    const config = validateEnv(baseValidEnv);

    expect(config.env).toBe('test');
    expect(config.port).toBe(5000);
    expect(config.database.uri).toBe('mongodb://127.0.0.1:27017/janaseva_test');
    expect(config.cors.allowedOrigins).toEqual(['http://localhost:3000', 'http://localhost:3001']);
  });

  it('should throw CONFIG_ERROR if PORT is invalid', () => {
    expect(() => {
      validateEnv({
        ...baseValidEnv,
        PORT: 'not-a-number'
      });
    }).toThrow(/PORT must be a valid port number/);
  });

  it('should throw CONFIG_ERROR if PORT is out of range', () => {
    expect(() => {
      validateEnv({
        ...baseValidEnv,
        PORT: '999999'
      });
    }).toThrow(/PORT must be a valid port number/);
  });

  it('should throw CONFIG_ERROR if MONGODB_URI is empty', () => {
    expect(() => {
      validateEnv({
        ...baseValidEnv,
        MONGODB_URI: ''
      });
    }).toThrow(/MONGODB_URI is required/);
  });

  it('should throw CONFIG_ERROR if MONGODB_URI is not a mongodb protocol', () => {
    expect(() => {
      validateEnv({
        ...baseValidEnv,
        MONGODB_URI: 'http://localhost:27017/mydb'
      });
    }).toThrow(/must be a valid MongoDB connection string/);
  });

  it('should throw CONFIG_ERROR if JWT_SECRET is empty', () => {
    expect(() => {
      validateEnv({
        ...baseValidEnv,
        JWT_SECRET: ''
      });
    }).toThrow(/JWT_SECRET is required/);
  });

  it('should require at least 32 characters for JWT_SECRET in production', () => {
    expect(() => {
      validateEnv({
        ...baseValidEnv,
        NODE_ENV: 'production',
        JWT_SECRET: 'short_secret'
      });
    }).toThrow(/In production, JWT_SECRET must be at least 32 characters long/);
  });
});

/**
 * Unit tests for error utilities
 */

import {
  GoogleSearchConsoleError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ValidationError,
  NetworkError,
  APIError,
  parseGoogleSearchConsoleError,
} from '../../../src/utils/errors.js';

describe('Error Classes', () => {
  describe('GoogleSearchConsoleError', () => {
    it('should create error with message', () => {
      const error = new GoogleSearchConsoleError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('GoogleSearchConsoleError');
    });

    it('should include status code', () => {
      const error = new GoogleSearchConsoleError('Test error', 500);
      expect(error.statusCode).toBe(500);
    });
  });

  describe('AuthenticationError', () => {
    it('should have 401 status code', () => {
      const error = new AuthenticationError('Auth failed');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('AuthorizationError', () => {
    it('should have 403 status code', () => {
      const error = new AuthorizationError('Permission denied');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });
  });

  describe('RateLimitError', () => {
    it('should have 429 status code', () => {
      const error = new RateLimitError('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });

    it('should include retry after value', () => {
      const error = new RateLimitError('Rate limit exceeded', 120);
      expect(error.retryAfter).toBe(120);
    });
  });

  describe('ValidationError', () => {
    it('should have 400 status code', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should include validation errors', () => {
      const errors = [{ field: 'name', message: 'Required' }];
      const error = new ValidationError('Validation failed', errors);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('NetworkError', () => {
    it('should have 503 status code', () => {
      const error = new NetworkError('Network timeout');
      expect(error.statusCode).toBe(503);
      expect(error.name).toBe('NetworkError');
    });
  });

  describe('APIError', () => {
    it('should create generic API error', () => {
      const error = new APIError('API error', 500);
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('APIError');
    });
  });
});

describe('parseGoogleSearchConsoleError', () => {
  it('should return error if already GoogleSearchConsoleError', () => {
    const original = new AuthenticationError('Auth failed');
    const parsed = parseGoogleSearchConsoleError(original);
    expect(parsed).toBe(original);
  });

  it('should parse 401 errors as AuthenticationError', () => {
    const error = { message: 'Unauthorized', code: 401 };
    const parsed = parseGoogleSearchConsoleError(error);
    expect(parsed).toBeInstanceOf(AuthenticationError);
  });

  it('should parse 403 errors as AuthorizationError', () => {
    const error = { message: 'Forbidden', code: 403 };
    const parsed = parseGoogleSearchConsoleError(error);
    expect(parsed).toBeInstanceOf(AuthorizationError);
  });

  it('should parse 429 errors as RateLimitError', () => {
    const error = { message: 'Too many requests', code: 429 };
    const parsed = parseGoogleSearchConsoleError(error);
    expect(parsed).toBeInstanceOf(RateLimitError);
  });

  it('should parse 400 errors as ValidationError', () => {
    const error = { message: 'Bad request', code: 400 };
    const parsed = parseGoogleSearchConsoleError(error);
    expect(parsed).toBeInstanceOf(ValidationError);
  });

  it('should parse network errors', () => {
    const error = { message: 'Network timeout' };
    const parsed = parseGoogleSearchConsoleError(error);
    expect(parsed).toBeInstanceOf(NetworkError);
  });

  it('should default to APIError for unknown errors', () => {
    const error = { message: 'Unknown error', code: 500 };
    const parsed = parseGoogleSearchConsoleError(error);
    expect(parsed).toBeInstanceOf(APIError);
  });
});

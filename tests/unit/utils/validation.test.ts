/**
 * Unit tests for validation utilities
 */

import { validate, validateSafe, isValidSiteUrl, normalizeSiteUrl, isValidDate, formatDate } from '../../../src/utils/validation.js';
import { z } from 'zod';
import { ValidationError } from '../../../src/utils/errors.js';

describe('Validation Utilities', () => {
  describe('validate', () => {
    it('should validate valid data', () => {
      const schema = z.object({ name: z.string() });
      const result = validate(schema, { name: 'test' });
      expect(result).toEqual({ name: 'test' });
    });

    it('should throw ValidationError on invalid data', () => {
      const schema = z.object({ name: z.string() });
      expect(() => validate(schema, { name: 123 })).toThrow(ValidationError);
    });
  });

  describe('validateSafe', () => {
    it('should return success for valid data', () => {
      const schema = z.object({ name: z.string() });
      const result = validateSafe(schema, { name: 'test' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'test' });
      }
    });

    it('should return errors for invalid data', () => {
      const schema = z.object({ name: z.string() });
      const result = validateSafe(schema, { name: 123 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('isValidSiteUrl', () => {
    it('should validate correct site URLs', () => {
      expect(isValidSiteUrl('https://example.com/')).toBe(true);
      expect(isValidSiteUrl('http://example.com/')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidSiteUrl('not-a-url')).toBe(false);
      expect(isValidSiteUrl('')).toBe(false);
    });
  });

  describe('normalizeSiteUrl', () => {
    it('should add trailing slash if missing', () => {
      expect(normalizeSiteUrl('https://example.com')).toBe('https://example.com/');
    });

    it('should preserve trailing slash', () => {
      expect(normalizeSiteUrl('https://example.com/')).toBe('https://example.com/');
    });

    it('should handle invalid URLs gracefully', () => {
      expect(normalizeSiteUrl('not-a-url')).toBe('not-a-url');
    });
  });

  describe('isValidDate', () => {
    it('should validate correct date format', () => {
      expect(isValidDate('2024-01-01')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(isValidDate('2024-1-1')).toBe(false);
      expect(isValidDate('01-01-2024')).toBe(false);
      expect(isValidDate('not-a-date')).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });
  });
});

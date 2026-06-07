import { z } from 'zod';

/**
 * Escapes characters that could form HTML tags to protect against XSS injection.
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Recursively scans and sanitizes string values in objects or arrays.
 */
export function sanitizeInputs(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return escapeHTML(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeInputs(item));
  }
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, val] of Object.entries(obj)) {
      sanitized[key] = sanitizeInputs(val);
    }
    return sanitized;
  }
  return obj;
}

/**
 * Express middleware to sanitize body, query, and path params recursively.
 */
export function sanitizeRequestMiddleware(req, res, next) {
  if (req.body) req.body = sanitizeInputs(req.body);
  if (req.query) req.query = sanitizeInputs(req.query);
  if (req.params) req.params = sanitizeInputs(req.params);
  next();
}

// Base Schemas for input validation using Zod
export const AuthLoginSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(6).max(100)
});

export const SOPCreateSchema = z.object({
  code: z.string().min(3).max(50),
  title: z.string().min(3).max(255),
  categoryId: z.number().int().positive(),
  content: z.string().min(10)
});

export const ESignSchema = z.object({
  password: z.string().min(1),
  purpose: z.string().min(3).max(255)
});

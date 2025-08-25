import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Rate limiting configuration
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit authentication attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Input validation schemas
export const courseValidationSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(1000).trim(),
  type: z.enum(['lesson', 'quiz', 'exercise', 'vocabulary']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string().min(1).max(100).trim(),
  content: z.object({
    text: z.string().optional(),
    audio: z.string().url().optional(),
    video: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
  }).optional(),
  metadata: z.object({
    difficulty: z.number().min(1).max(10).optional(),
    estimatedDuration: z.number().min(1).max(300).optional(),
    tags: z.array(z.string().trim()).optional(),
    prerequisites: z.array(z.string()).optional(),
    objectives: z.array(z.string()).optional(),
  }).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const searchValidationSchema = z.object({
  page: z.coerce.number().min(1).max(1000).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().max(100).default(''),
  type: z.enum(['lesson', 'quiz', 'exercise', 'vocabulary', 'all']).default('all'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).default('all'),
  status: z.enum(['draft', 'published', 'archived', 'all']).default('all'),
  category: z.string().max(100).default(''),
});

// Content sanitization
export function sanitizeHtml(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().slice(0, 10000); // Limit string length
  }
  if (Array.isArray(input)) {
    return input.slice(0, 100).map(sanitizeInput); // Limit array size
  }
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    Object.keys(input).slice(0, 50).forEach(key => { // Limit object keys
      if (typeof key === 'string' && key.length <= 100) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    });
    return sanitized;
  }
  return input;
}

// Security headers
export const securityHeaders = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// CORS configuration
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://admin.yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Error handling without sensitive information exposure
export function createSafeErrorResponse(error: any, isDevelopment: boolean = false) {
  const safeError = {
    message: 'An error occurred',
    status: 500,
    ...(isDevelopment && { 
      details: error.message,
      stack: error.stack 
    })
  };

  // Log full error internally
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  return safeError;
}

// Role-based access control
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export function hasPermission(userRole: string, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.VIEWER]: 1,
    [UserRole.EDITOR]: 2,
    [UserRole.ADMIN]: 3,
  };

  return (roleHierarchy[userRole as UserRole] || 0) >= roleHierarchy[requiredRole];
}

// Audit logging
export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export function createAuditLog(log: Omit<AuditLog, 'timestamp'>): AuditLog {
  return {
    ...log,
    timestamp: new Date(),
  };
}
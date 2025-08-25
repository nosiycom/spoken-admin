// Security Configuration for Production Environment

export const SECURITY_CONFIG = {
  // Authentication & Authorization
  AUTH: {
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_TOKEN_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    REQUIRE_2FA: process.env.NODE_ENV === 'production',
  },

  // Rate Limiting
  RATE_LIMITS: {
    GLOBAL: { windowMs: 15 * 60 * 1000, maxRequests: 1000 },
    AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
    API: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
    UPLOAD: { windowMs: 60 * 60 * 1000, maxRequests: 50 },
    SEARCH: { windowMs: 60 * 1000, maxRequests: 30 },
  },

  // Input Validation
  VALIDATION: {
    MAX_STRING_LENGTH: 10000,
    MAX_ARRAY_LENGTH: 100,
    MAX_OBJECT_KEYS: 50,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/wav'],
  },

  // Database Security
  DATABASE: {
    MAX_QUERY_TIME: 30000, // 30 seconds
    MAX_RESULTS: 1000,
    ENABLE_QUERY_LOGGING: process.env.NODE_ENV === 'development',
    CONNECTION_POOL_SIZE: 10,
  },

  // CORS Configuration
  CORS: {
    ALLOWED_ORIGINS: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com', 'https://admin.yourdomain.com']
      : ['http://localhost:3000', 'http://localhost:3001'],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
    CREDENTIALS: true,
  },

  // Content Security Policy
  CSP: {
    DEFAULT_SRC: ["'self'"],
    SCRIPT_SRC: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
    STYLE_SRC: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    IMG_SRC: ["'self'", "data:", "https:", "blob:"],
    FONT_SRC: ["'self'", "https://fonts.gstatic.com"],
    CONNECT_SRC: ["'self'", "https://*.supabase.co"],
    FRAME_SRC: ["'none'"],
    OBJECT_SRC: ["'none'"],
    BASE_URI: ["'self'"],
    FORM_ACTION: ["'self'"],
  },

  // Security Headers
  HEADERS: {
    'X-DNS-Prefetch-Control': 'off',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  },

  // Logging & Monitoring
  LOGGING: {
    ENABLE_AUDIT_LOGS: true,
    LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    SENSITIVE_FIELDS: ['password', 'token', 'key', 'secret', 'auth'],
    MAX_LOG_SIZE: '10MB',
    LOG_RETENTION_DAYS: 90,
  },

  // Error Handling
  ERRORS: {
    EXPOSE_STACK_TRACE: process.env.NODE_ENV === 'development',
    MAX_ERROR_MESSAGE_LENGTH: 200,
    GENERIC_ERROR_MESSAGE: 'An internal error occurred',
  },

  // Encryption
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
  },
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'production') {
  // Production-specific security settings
  SECURITY_CONFIG.RATE_LIMITS.GLOBAL.maxRequests = 500;
  SECURITY_CONFIG.VALIDATION.MAX_STRING_LENGTH = 5000;
  SECURITY_CONFIG.DATABASE.ENABLE_QUERY_LOGGING = false;
}

// Validate required environment variables
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

export function validateEnvironment() {
  const missing = REQUIRED_ENV_VARS.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate Supabase URL format
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://')) {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format - must start with https://');
  }
}

// Security utility functions
export function sanitizeLogData(data: any): any {
  if (typeof data === 'string') {
    // Remove sensitive information from strings
    return SECURITY_CONFIG.LOGGING.SENSITIVE_FIELDS.reduce(
      (str, field) => str.replace(new RegExp(field, 'gi'), '[REDACTED]'),
      data
    );
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    Object.keys(data).forEach(key => {
      if (SECURITY_CONFIG.LOGGING.SENSITIVE_FIELDS.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(data[key]);
      }
    });
    return sanitized;
  }
  
  return data;
}

export function generateContentSecurityPolicy(): string {
  const directives = Object.entries(SECURITY_CONFIG.CSP)
    .map(([key, values]) => {
      const directive = key.toLowerCase().replace(/_/g, '-');
      return `${directive} ${values.join(' ')}`;
    });
  
  return directives.join('; ');
}
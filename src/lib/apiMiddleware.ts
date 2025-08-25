import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from './supabase-server';
import { z } from 'zod';
import { securityHeaders, sanitizeInput, createSafeErrorResponse } from './security';

export interface ApiContext {
  userId: string;
  req: NextRequest;
  params?: any;
}

export type ApiHandler = (context: ApiContext) => Promise<NextResponse>;

export interface ApiMiddlewareOptions {
  requireAuth?: boolean;
  validateSchema?: z.ZodSchema;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  roles?: string[];
}

// In-memory rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, windowMs: number, maxRequests: number): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

export function withApiMiddleware(
  handler: ApiHandler,
  options: ApiMiddlewareOptions = {}
) {
  return async (req: NextRequest, { params }: { params?: any } = {}) => {
    try {
      // Apply security headers
      const response = new NextResponse();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Rate limiting
      if (options.rateLimit) {
        const clientIP = req.headers.get('x-forwarded-for') || 
                        req.headers.get('x-real-ip') || 
                        'unknown';
        
        if (!checkRateLimit(
          clientIP, 
          options.rateLimit.windowMs, 
          options.rateLimit.maxRequests
        )) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429, headers: response.headers }
          );
        }
      }

      // Authentication check
      let userId: string | null = null;
      if (options.requireAuth !== false) {
        try {
          const supabase = await createServerSupabase();
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            return NextResponse.json(
              { error: 'Unauthorized' },
              { status: 401, headers: response.headers }
            );
          }
          
          userId = user.id;
        } catch (error) {
          console.error('Auth check error:', error);
          return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401, headers: response.headers }
          );
        }
      }

      // Input validation
      if (options.validateSchema && req.method !== 'GET') {
        const body = await req.json();
        const sanitizedBody = sanitizeInput(body);
        
        try {
          options.validateSchema.parse(sanitizedBody);
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              { 
                error: 'Validation failed', 
                details: error.errors 
              },
              { status: 400, headers: response.headers }
            );
          }
        }
      }

      // Execute handler
      const context: ApiContext = {
        userId: userId!,
        req,
        params: sanitizeInput(params),
      };

      const result = await handler(context);
      
      // Apply security headers to the actual response
      Object.entries(securityHeaders).forEach(([key, value]) => {
        result.headers.set(key, value);
      });

      return result;

    } catch (error) {
      console.error('API Middleware Error:', error);
      const safeError = createSafeErrorResponse(
        error, 
        process.env.NODE_ENV === 'development'
      );
      
      return NextResponse.json(
        { error: safeError.message },
        { status: safeError.status }
      );
    }
  };
}
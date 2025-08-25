import { NextRequest } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase';
import redis from '@/lib/redis';

export async function GET(req: NextRequest) {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  try {
    // Check Supabase connection
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    healthCheck.services.database = 'healthy';
  } catch (error) {
    healthCheck.services.database = 'unhealthy';
    healthCheck.status = 'degraded';
  }

  try {
    // Check Redis connection
    await redis.ping();
    healthCheck.services.redis = 'healthy';
  } catch (error) {
    healthCheck.services.redis = 'unhealthy';
    healthCheck.status = 'degraded';
  }

  const statusCode = healthCheck.status === 'ok' ? 200 : 503;
  return Response.json(healthCheck, { status: statusCode });
}
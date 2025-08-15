import { NextRequest } from 'next/server';
import { log } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { level, message, timestamp, url, userAgent } = body;

    const meta = {
      url,
      userAgent,
      timestamp,
      source: 'client',
    };

    switch (level) {
      case 'error':
        log.error(message, meta);
        break;
      case 'warn':
        log.warn(message, meta);
        break;
      case 'info':
        log.info(message, meta);
        break;
      case 'debug':
        log.debug(message, meta);
        break;
      default:
        log.info(message, meta);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Logging error:', error);
    return Response.json({ error: 'Failed to log message' }, { status: 500 });
  }
}
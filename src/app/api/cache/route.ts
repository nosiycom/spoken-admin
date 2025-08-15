import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CacheService } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return Response.json({ error: 'Key parameter required' }, { status: 400 });
    }

    const value = await CacheService.getJSON(key);
    return Response.json({ key, value, exists: value !== null });
  } catch (error) {
    console.error('Cache GET error:', error);
    return Response.json({ error: 'Failed to get cache' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { key, value, ttl } = body;

    if (!key || value === undefined) {
      return Response.json({ error: 'Key and value required' }, { status: 400 });
    }

    const success = await CacheService.setJSON(key, value, ttl);
    return Response.json({ success, key, ttl });
  } catch (error) {
    console.error('Cache SET error:', error);
    return Response.json({ error: 'Failed to set cache' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return Response.json({ error: 'Key parameter required' }, { status: 400 });
    }

    const success = await CacheService.del(key);
    return Response.json({ success, key });
  } catch (error) {
    console.error('Cache DELETE error:', error);
    return Response.json({ error: 'Failed to delete cache' }, { status: 500 });
  }
}
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Content } from '@/models/Content';
import { CacheService } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const level = searchParams.get('level');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const cacheKey = `content:${type || 'all'}:${level || 'all'}:${status || 'all'}:${page}:${limit}`;
    const cached = await CacheService.getJSON(cacheKey);
    
    if (cached) {
      return Response.json(cached);
    }

    await connectToDatabase();

    const query: any = {};
    if (type && type !== 'all') query.type = type;
    if (level && level !== 'all') query.level = level;
    if (status && status !== 'all') query.status = status;

    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Content.countDocuments(query);

    const result = {
      content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache for 5 minutes
    await CacheService.setJSON(cacheKey, result, 300);

    return Response.json(result);
  } catch (error) {
    console.error('Content fetch error:', error);
    return Response.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, type, level, category, content, metadata, status } = body;

    if (!title || !type || !level || !category || !content) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const newContent = new Content({
      title,
      description,
      type,
      level,
      category,
      content,
      metadata: {
        difficulty: metadata?.difficulty || 5,
        tags: metadata?.tags || [],
        duration: metadata?.duration,
        prerequisites: metadata?.prerequisites || [],
      },
      status: status || 'draft',
      createdBy: userId,
    });

    await newContent.save();

    // Invalidate content cache
    await CacheService.invalidatePattern('content:*');

    return Response.json({ content: newContent, message: 'Content created successfully' });
  } catch (error) {
    console.error('Content creation error:', error);
    return Response.json({ error: 'Failed to create content' }, { status: 500 });
  }
}
import { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { UserService } from '@/lib/services/users';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const currentUser = await getServerUser();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 per page

    const userService = new UserService();
    
    if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
      const users = await userService.getUsersByLevel(level as any);
      return Response.json(users);
    }

    const allUsers = await userService.getAllUsers();
    
    // Apply search filter if provided
    let filteredUsers = allUsers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = allUsers.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return Response.json({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Explicitly remove POST method - no user creation allowed
export async function POST() {
  return Response.json(
    { error: 'User creation is not allowed through this endpoint' }, 
    { status: 405 }
  );
}
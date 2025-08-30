import { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth';
import { UserService } from '@/lib/services/users';
import { createSupabaseAdminClient } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const currentUser = await getServerUser();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { first_name, last_name, email, current_level, profile_image_url } = body;

    // Validate required fields
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!current_level || !['beginner', 'intermediate', 'advanced'].includes(current_level)) {
      return Response.json({ error: 'Valid current_level is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user exists
    const userService = new UserService();
    const existingUser = await userService.getUserById(userId);
    if (!existingUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email is being changed and if it's already in use
    if (email !== existingUser.email) {
      const supabase = createSupabaseAdminClient();
      const { data: emailCheck } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', userId)
        .single();
      
      if (emailCheck) {
        return Response.json({ error: 'Email is already in use' }, { status: 409 });
      }
    }

    // Update user
    const updatedUser = await userService.updateUser(userId, {
      first_name,
      last_name,
      email,
      current_level,
      profile_image_url
    });

    return Response.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const currentUser = await getServerUser();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent users from deleting themselves (optional safety check)
    if (userId === currentUser.id) {
      return Response.json({ error: 'You cannot delete your own account' }, { status: 403 });
    }

    // Check if user exists
    const userService = new UserService();
    const existingUser = await userService.getUserById(userId);
    if (!existingUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const supabase = createSupabaseAdminClient();

    // Delete related data in transaction-like approach
    // Note: In a real app, you might want to use Supabase's RLS and foreign key constraints
    // or implement a more sophisticated soft-delete approach
    
    // Delete user achievements
    await supabase.from('user_achievements').delete().eq('user_id', userId);
    
    // Delete user performance data
    await supabase.from('user_performance').delete().eq('user_id', userId);
    
    // Delete user lesson progress
    await supabase.from('user_lesson_progress').delete().eq('user_id', userId);
    
    // Delete user course enrollments
    await supabase.from('user_course_enrollments').delete().eq('user_id', userId);
    
    // Finally delete the user
    const { error } = await supabase.from('users').delete().eq('id', userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      return Response.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    return Response.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const currentUser = await getServerUser();
    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userService = new UserService();
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
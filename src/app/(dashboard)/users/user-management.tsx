'use client';

import { useState } from 'react';
import { User } from '@/types/database';
import EditUserModal from './edit-user-modal';
import DeleteUserModal from './delete-user-modal';

interface UserManagementProps {
  users: User[];
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Less than 1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return '1 day ago';
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
  return `${Math.floor(diffInHours / 168)} weeks ago`;
}

function getUserStatus(lastActivity: string): 'Active' | 'Inactive' {
  const date = new Date(lastActivity);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays <= 7 ? 'Active' : 'Inactive';
}

export default function UserManagement({ 
  users: initialUsers
}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  // Filter users based on search and level filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || user.current_level === levelFilter;
    
    return matchesSearch && matchesLevel;
  });

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingUser(null);
  };

  const handleUserDeleted = (deletedUserId: string) => {
    setUsers(prev => prev.filter(u => u.id !== deletedUserId));
    setDeletingUser(null);
  };

  const getDisplayName = (user: User) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    return user.email.split('@')[0];
  };

  const getInitials = (user: User) => {
    const name = getDisplayName(user);
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">{users.filter(u => getUserStatus(u.last_activity_at) === 'Active').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.current_level === 'beginner').length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Beginners</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">{Math.round(users.reduce((sum, u) => sum + u.total_points, 0) / users.length) || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Points</div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            All Users ({filteredUsers.length})
          </h2>
        </header>
        
        <div className="p-3">
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              {/* Table header */}
              <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/20 rounded-sm">
                <tr>
                  <th className="p-2 whitespace-nowrap">
                    <div className="text-left font-semibold">User</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="text-left font-semibold">Level</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="text-left font-semibold">Points</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="text-left font-semibold">Streak</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="text-left font-semibold">Last Active</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="text-left font-semibold">Status</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="text-left font-semibold">Actions</div>
                  </th>
                </tr>
              </thead>
              {/* Table body */}
              <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm || levelFilter !== 'all' ? 'No users match your filters' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 shrink-0 mr-2 sm:mr-3">
                            {user.profile_image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={user.profile_image_url} 
                                alt={getDisplayName(user)}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-medium text-sm">
                                {getInitials(user)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-100">
                              {getDisplayName(user)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-left">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.current_level === 'beginner' 
                              ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-400/10'
                              : user.current_level === 'intermediate'
                              ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/10'
                              : 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-400/10'
                          }`}>
                            {user.current_level.charAt(0).toUpperCase() + user.current_level.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-left text-gray-600 dark:text-gray-300 font-medium">
                          {user.total_points.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-left">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-400">
                            🔥 {user.streak_days}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-left text-gray-600 dark:text-gray-300">
                          {formatTimeAgo(user.last_activity_at)}
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="text-left">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            getUserStatus(user.last_activity_at) === 'Active' 
                              ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-400/10'
                              : 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-400/10'
                          }`}>
                            {getUserStatus(user.last_activity_at)}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setEditingUser(user)}
                            className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => setDeletingUser(user)}
                            className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </>
  );
}
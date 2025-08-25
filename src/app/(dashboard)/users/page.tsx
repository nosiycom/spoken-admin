import { requireAuth } from '@/lib/auth';

export default async function UsersPage() {
  const user = await requireAuth();

  const users = [
    { id: 1, name: 'Marie Dubois', email: 'marie@example.com', level: 'Beginner', lastActive: '2 hours ago', status: 'Active' },
    { id: 2, name: 'Jean Pierre', email: 'jean@example.com', level: 'Intermediate', lastActive: '1 day ago', status: 'Active' },
    { id: 3, name: 'Sophie Laurent', email: 'sophie@example.com', level: 'Advanced', lastActive: '3 days ago', status: 'Inactive' },
    { id: 4, name: 'Pierre Martin', email: 'pierre@example.com', level: 'Beginner', lastActive: '5 hours ago', status: 'Active' },
    { id: 5, name: 'Claire Moreau', email: 'claire@example.com', level: 'Intermediate', lastActive: '1 week ago', status: 'Inactive' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Users</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and monitor your French learning students</p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">All Users</h2>
        </header>
        
        <div className="p-3">
          {/* Table */}
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
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 shrink-0 mr-2 sm:mr-3">
                          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-medium text-sm">
                            {user.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-100">{user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.level === 'Beginner' 
                            ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-400/10'
                            : user.level === 'Intermediate'
                            ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/10'
                            : 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-400/10'
                        }`}>
                          {user.level}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left text-gray-600 dark:text-gray-300">{user.lastActive}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' 
                            ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-400/10'
                            : 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-400/10'
                        }`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button className="text-sm text-sky-500 hover:text-sky-600 font-medium">View</button>
                        <button className="text-sm text-gray-500 hover:text-gray-600 font-medium">Message</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
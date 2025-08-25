import { requireAuth } from '@/lib/auth';

export default async function CoursesPage() {
  const user = await requireAuth();

  const courses = [
    { id: 1, title: 'French Basics', lessons: 12, students: 45, status: 'Published' },
    { id: 2, title: 'Conversational French', lessons: 8, students: 32, status: 'Draft' },
    { id: 3, title: 'French Grammar', lessons: 15, students: 28, status: 'Published' },
    { id: 4, title: 'Business French', lessons: 10, students: 18, status: 'Published' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Courses</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your French learning content and courses</p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl">
        <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">All Courses</h2>
        </header>
        
        <div className="p-3">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              {/* Table header */}
              <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/20 rounded-sm">
                <tr>
                  <th className="p-2 whitespace-nowrap">
                    <div className="text-left font-semibold">Course</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="text-left font-semibold">Lessons</div>
                  </th>
                  <th className="p-2 whitespace-nowrap">
                    <div className="text-left font-semibold">Students</div>
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
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 shrink-0 mr-2 sm:mr-3">
                          <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                            <svg className="w-5 h-5 fill-violet-500" viewBox="0 0 20 20">
                              <path d="M8.864 1.5a.6.6 0 0 0-.728 0L1.5 5.85a.6.6 0 0 0 0 .9l6.636 4.35a.6.6 0 0 0 .728 0l6.636-4.35a.6.6 0 0 0 0-.9L8.864 1.5Z" />
                              <path d="M2.5 8.3L8.5 12l6-3.7v3.2a.6.6 0 0 1-.24.48L8.76 15.2a.6.6 0 0 1-.52 0L2.74 11.98a.6.6 0 0 1-.24-.48V8.3Z" />
                            </svg>
                          </div>
                        </div>
                        <div className="font-medium text-gray-800 dark:text-gray-100">{course.title}</div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left text-gray-600 dark:text-gray-300">{course.lessons}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left text-gray-600 dark:text-gray-300">{course.students}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          course.status === 'Published' 
                            ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-400/10'
                            : 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/10'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button className="text-sm text-sky-500 hover:text-sky-600 font-medium">Edit</button>
                        <button className="text-sm text-red-500 hover:text-red-600 font-medium">Delete</button>
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
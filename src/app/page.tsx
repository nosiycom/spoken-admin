import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🇫🇷 Spoken
          </h1>
          <p className="text-gray-600">
            Admin portal for AI-powered French learning mobile app
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/sign-in"
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-block"
          >
            Sign In
          </Link>
          
          <Link
            href="/sign-up"
            className="w-full bg-white text-indigo-600 py-3 px-6 rounded-lg font-medium border-2 border-indigo-600 hover:bg-indigo-50 transition-colors inline-block"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">📚</span>
              Content Management
            </div>
            <div className="flex items-center">
              <span className="mr-2">📊</span>
              Analytics Dashboard
            </div>
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              User Management
            </div>
            <div className="flex items-center">
              <span className="mr-2">🔒</span>
              Secure Authentication
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

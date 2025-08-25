import { getServerUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TemplateNavbar } from '@/components/template/navbar';
import { TemplateButton } from '@/components/template/button';
import { organizationSchema, softwareApplicationSchema } from '@/lib/structuredData';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Home - AI-Powered French Learning Management",
  description: "Welcome to Spoken Admin Portal. Manage your AI-powered French learning content, track analytics, and engage with learners through our comprehensive dashboard.",
  openGraph: {
    title: "Spoken Admin Portal - Transform French Learning Management",
    description: "Streamline your French language education platform with AI-powered content management, real-time analytics, and learner engagement tools.",
    images: [{ url: "/og-home.png", width: 1200, height: 630 }],
  },
  twitter: {
    title: "Spoken Admin Portal - Transform French Learning Management",
    description: "Streamline your French language education platform with AI-powered content management, real-time analytics, and learner engagement tools.",
    images: ["/twitter-home.png"],
  },
};

export default async function Home() {
  try {
    const user = await getServerUser();

    if (user) {
      redirect('/dashboard');
    }
  } catch (error) {
    console.log('Auth check failed, continuing to home page:', error)
    // Continue to render home page if auth check fails
  }

  return (
    <>
      <TemplateNavbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-400/20 via-purple-400/20 to-indigo-400/20 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-6 pb-32 pt-20 sm:pt-32 lg:px-8 lg:pt-40">
            <div className="mx-auto max-w-4xl text-center">
              {/* Announcement badge */}
              <div className="mb-8 flex justify-center">
                <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-slate-600 ring-1 ring-slate-900/10 hover:ring-slate-900/20 dark:text-slate-400 dark:ring-white/10 dark:hover:ring-white/20 transition-all duration-200">
                  <span className="inline-flex items-center gap-x-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    AI-powered French learning platform
                  </span>
                  <Link href="/dashboard" className="font-semibold text-blue-600 dark:text-blue-400 ml-2 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Learn more <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Main heading */}
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
                <span className="inline-block">🇫🇷</span>{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Spoken Admin
                </span>
                <br className="hidden sm:block" />
                <span className="text-slate-800 dark:text-slate-200">Portal</span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Comprehensive admin dashboard for managing your AI-powered French learning mobile app. 
                Track analytics, manage content, and engage with learners through our intuitive platform.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <TemplateButton className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl">
                    Get started
                  </TemplateButton>
                </Link>
                <Link href="/dashboard" className="group inline-flex items-center gap-x-2 text-sm font-semibold leading-6 text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  View dashboard 
                  <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Everything you need to manage your platform
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
                Powerful tools and insights to help you create the best French learning experience.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm p-8 shadow-lg ring-1 ring-slate-900/5 dark:bg-slate-800/60 dark:ring-white/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold leading-8 text-slate-900 dark:text-white">Real-time Analytics</h3>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Track user engagement, course completion rates, and learning progress with detailed analytics and insights.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm p-8 shadow-lg ring-1 ring-slate-900/5 dark:bg-slate-800/60 dark:ring-white/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25A8.966 8.966 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold leading-8 text-slate-900 dark:text-white">Content Management</h3>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Easily create, edit, and organize your French learning content with our intuitive content management system.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm p-8 shadow-lg ring-1 ring-slate-900/5 dark:bg-slate-800/60 dark:ring-white/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 3.197a6.062 6.062 0 016.001 0M12 12.75c2.305 0 4.408.867 6 2.292m-6-2.292c-2.305 0-4.408.867-6 2.292" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold leading-8 text-slate-900 dark:text-white">User Engagement</h3>
                <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
                  Connect with your learners through messaging, notifications, and personalized learning recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom decoration */}
          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-400/20 via-purple-400/20 to-indigo-400/20 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
        </section>
      </div>
    </>
  );
}

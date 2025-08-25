import Link from 'next/link';
import { TemplateNavbar } from '@/components/template/navbar';
import { TemplateButton } from '@/components/template/button';

export default function NotFound() {
  return (
    <>
      <TemplateNavbar />
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-base font-semibold text-blue-600 dark:text-blue-400">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Page not found
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/">
              <TemplateButton>Go back home</TemplateButton>
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-gray-900 dark:text-white">
              Go to Dashboard <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
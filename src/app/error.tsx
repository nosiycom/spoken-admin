'use client';

import { useEffect } from 'react';
import { TemplateNavbar } from '@/components/template/navbar';
import { TemplateButton } from '@/components/template/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <TemplateNavbar />
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-base font-semibold text-red-600 dark:text-red-400">500</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Something went wrong!
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
            Sorry, we encountered an unexpected error. Please try again.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <TemplateButton onClick={() => reset()}>
              Try again
            </TemplateButton>
            <button 
              onClick={() => window.location.href = '/'}
              className="text-sm font-semibold text-gray-900 dark:text-white"
            >
              Go back home <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
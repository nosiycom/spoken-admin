'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <p className="text-base font-semibold text-red-600">500</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Application Error
            </h1>
            <p className="mt-6 text-base leading-7 text-gray-600">
              A critical error occurred. Please refresh the page or contact support.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => reset()}
                className="rounded-full bg-gray-950 px-3.5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Try again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="text-sm font-semibold text-gray-900"
              >
                Go home <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
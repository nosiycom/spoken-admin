export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Application error
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error.message || 'A critical error occurred.'}
          </p>
          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

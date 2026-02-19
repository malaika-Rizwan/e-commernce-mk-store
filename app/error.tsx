'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft-lg max-w-md">
        <h2 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

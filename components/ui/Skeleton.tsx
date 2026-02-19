import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white">
      <Skeleton className="h-56 w-full rounded-none" />
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-6 w-1/3" />
        <div className="mt-auto pt-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCartRow() {
  return (
    <li className="flex gap-4 py-6 first:pt-0">
      <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg" />
      <div className="flex flex-1 flex-col justify-between">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-16" />
    </li>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-8 h-9 w-64" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3].map((i) => (
              <SkeletonCartRow key={i} />
            ))}
          </ul>
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <Skeleton className="h-6 w-32" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-4 h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrdersPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-8 h-9 w-48" />
      <ul className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <li key={i}>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AccountPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-8 h-9 w-48" />
      <div className="max-w-md rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <Skeleton className="h-6 w-24" />
        <div className="mt-4 space-y-4">
          <div>
            <Skeleton className="mb-1 h-4 w-16" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <div>
            <Skeleton className="mb-1 h-4 w-16" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <div>
            <Skeleton className="mb-1 h-4 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

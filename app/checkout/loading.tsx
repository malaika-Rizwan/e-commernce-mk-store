import { Skeleton } from '@/components/ui/Skeleton';

export default function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-8 h-9 w-48" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <Skeleton className="h-6 w-32" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

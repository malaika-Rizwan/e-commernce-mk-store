import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto max-w-[1200px] px-4 py-20">
        <div className="mb-6 rounded-2xl bg-cardBg p-5 shadow-soft">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-3 h-4 w-80" />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[420px] overflow-hidden rounded-xl bg-cardBg shadow-soft"
            >
              <Skeleton className="h-56 w-full rounded-none" />
              <div className="p-5">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="mt-3 h-6 w-32" />
                <Skeleton className="mt-6 h-11 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductDetailsLoading() {
  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto max-w-[1200px] px-4 py-12 sm:py-16">
        <Skeleton className="mb-8 h-4 w-56" />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="rounded-2xl bg-cardBg p-4 shadow-soft">
            <Skeleton className="h-[420px] w-full rounded-2xl" />
            <div className="mt-4 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-11 w-40 rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}


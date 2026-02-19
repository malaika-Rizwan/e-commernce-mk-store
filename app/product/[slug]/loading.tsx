import { Skeleton } from '@/components/ui/Skeleton';

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-pageBg">
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
        <Skeleton className="mb-8 h-4 w-64 rounded" />
        <div className="grid gap-10 lg:grid-cols-[60%_1fr] lg:gap-14">
          <div className="space-y-4">
            <Skeleton className="h-[380px] w-full rounded-2xl md:h-[480px]" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-16 flex-shrink-0 rounded-xl md:h-20 md:w-20" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-11 w-14" />
              <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </div>
        <div className="mt-12">
          <div className="flex gap-6 border-b border-darkBase/20 pb-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
          <Skeleton className="mt-6 h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

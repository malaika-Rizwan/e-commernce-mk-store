import { SkeletonCard } from '@/components/ui/Skeleton';

export default function WishlistLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-9 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-2 h-5 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

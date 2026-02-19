'use client';

import { useRouter } from 'next/navigation';
import { ProductReviews } from './ProductReviews';

interface Review {
  _id?: string;
  user?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsSectionProps {
  productSlug: string;
  productId: string;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  isLoggedIn: boolean;
}

export function ProductReviewsSection(props: ProductReviewsSectionProps) {
  const router = useRouter();
  return (
    <ProductReviews
      {...props}
      onReviewAdded={() => router.refresh()}
    />
  );
}

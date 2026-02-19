'use client';

import { useRouter } from 'next/navigation';
import { ProductDetailsTabs } from './ProductDetailsTabs';

interface Review {
  _id?: string;
  user?: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductDetailsTabsWrapperProps {
  description: string;
  features: string[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  productSlug: string;
  productId: string;
  isLoggedIn: boolean;
}

export function ProductDetailsTabsWrapper(props: ProductDetailsTabsWrapperProps) {
  const router = useRouter();
  return (
    <ProductDetailsTabs
      {...props}
      onReviewAdded={() => router.refresh()}
    />
  );
}

'use client';

import { StickyAddToCart } from './StickyAddToCart';

interface ProductDetailsClientProps {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
}

export function ProductDetailsClient({
  productId,
  slug,
  name,
  price,
  image,
  stock,
}: ProductDetailsClientProps) {
  return (
    <StickyAddToCart
      productId={productId}
      slug={slug}
      name={name}
      price={price}
      image={image}
      stock={stock}
    />
  );
}

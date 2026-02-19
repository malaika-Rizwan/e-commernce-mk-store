/** Placeholder product images from public folder when product has no images */
export const PLACEHOLDER_PRODUCT_IMAGES = [
  '/products/c-tshirts.jpg',
  '/products/c-shoes.jpg',
  '/products/c-jeans.jpg',
  '/products/p11-1.jpg',
  '/products/p12-1.jpg',
  '/products/p22-1.jpg',
  '/products/p31-1.jpg',
  '/products/p32-1.jpg',
] as const;

export function getPlaceholderImages(index: number = 0): string[] {
  const i = Math.abs(index) % PLACEHOLDER_PRODUCT_IMAGES.length;
  return [PLACEHOLDER_PRODUCT_IMAGES[i]];
}

/** Normalize product images (string[] or { url, public_id }[]) to URL strings */
export function productImagesToUrls(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((item) => (typeof item === 'string' ? item : item?.url))
    .filter((url): url is string => !!url && (url.startsWith('http') || url.startsWith('/')));
}

/** First product image URL for display (single image) */
export function getFirstProductImageUrl(images: unknown): string | undefined {
  const urls = productImagesToUrls(images);
  return urls[0];
}

export function getProductDisplayImages(images: string[] | { url: string; public_id?: string }[] | undefined, fallbackIndex: number = 0): string[] {
  const urls = productImagesToUrls(images);
  if (urls.length) return urls;
  return getPlaceholderImages(fallbackIndex);
}

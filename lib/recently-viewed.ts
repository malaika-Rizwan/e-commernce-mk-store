export const RECENTLY_VIEWED_KEY = 'ecom-recently-viewed';
const MAX_ITEMS = 12;

export interface RecentlyViewedItem {
  slug: string;
  name: string;
  price: number;
  image?: string;
  id: string;
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, MAX_ITEMS).filter(
      (x): x is RecentlyViewedItem =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as RecentlyViewedItem).slug === 'string' &&
        typeof (x as RecentlyViewedItem).id === 'string'
    );
  } catch {
    return [];
  }
}

export function addRecentlyViewed(item: RecentlyViewedItem): void {
  const list = getRecentlyViewed().filter((x) => x.slug !== item.slug);
  list.unshift(item);
  const trimmed = list.slice(0, MAX_ITEMS);
  if (typeof window !== 'undefined') {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(trimmed));
  }
}

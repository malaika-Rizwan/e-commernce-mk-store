/**
 * Local product catalog for the App Router demo.
 * Images live in /public (e.g. /p1.jpg).
 */
export const products = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 8999,
    description:
      'High-quality sound with noise cancellation and long battery life.',
    category: 'Electronics',
    stock: 12,
    rating: 4.5,
    reviewsCount: 120,
    image: '/p1.jpg',
    brand: 'SoundX',
    features: [
      'Noise Cancellation',
      'Bluetooth 5.3',
      '30 Hours Battery',
      'Fast Charging',
    ],
  },
  {
    id: '2',
    name: 'Smart Fitness Watch Pro',
    price: 12999,
    description:
      'Track workouts, heart rate, sleep, and recovery with a bright always-on display.',
    category: 'Fitness',
    stock: 18,
    rating: 4.6,
    reviewsCount: 342,
    image: '/p2.jpg',
    brand: 'PulseFit',
    features: [
      'Always-On AMOLED',
      'GPS + Route Tracking',
      '7-Day Battery',
      'Water Resistant (5ATM)',
    ],
  },
  {
    id: '3',
    name: 'Minimal Leather Backpack',
    price: 7499,
    description:
      'Premium vegan leather backpack with padded laptop sleeve and clean modern silhouette.',
    category: 'Accessories',
    stock: 9,
    rating: 4.4,
    reviewsCount: 89,
    image: '/p3.jpg',
    brand: 'UrbanCarry',
    features: [
      '15\" Laptop Sleeve',
      'Water-Resistant Finish',
      'Hidden Quick-Access Pocket',
      'Comfort Shoulder Straps',
    ],
  },
  {
    id: '4',
    name: 'Luxury Scented Candle Set',
    price: 3999,
    description:
      'A curated set of calming scents designed to elevate your home with a premium ambiance.',
    category: 'Home',
    stock: 24,
    rating: 4.7,
    reviewsCount: 210,
    image: '/p4.jpg',
    brand: 'AuraHaus',
    features: [
      'Clean Burn Wax Blend',
      'Long-Lasting Fragrance',
      'Minimal Glass Jars',
      'Gift-Ready Packaging',
    ],
  },
  {
    id: '5',
    name: 'Hydrating Skincare Essentials Kit',
    price: 5999,
    description:
      'A gentle daily routine for hydration and glow—clean formulas suitable for most skin types.',
    category: 'Beauty',
    stock: 14,
    rating: 4.3,
    reviewsCount: 158,
    image: '/p5.jpg',
    brand: 'DermaPure',
    features: [
      'Fragrance-Free',
      'Hyaluronic Hydration',
      'Barrier Support',
      'Dermatologist-Tested',
    ],
  },
  {
    id: '6',
    name: 'Modern Desk Lamp (Warm White)',
    price: 4599,
    description:
      'Premium desk lamp with soft warm lighting, touch controls, and a clean, minimal design.',
    category: 'Home',
    stock: 7,
    rating: 4.5,
    reviewsCount: 76,
    image: '/p6.jpg',
    brand: 'LumaStudio',
    features: [
      'Touch Dimming',
      'Warm White Light',
      'Low-Glare Diffuser',
      'Energy Efficient LED',
    ],
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === String(id));
}


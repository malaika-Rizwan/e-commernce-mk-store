import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const SEED_PRODUCTS = [
  {
    name: 'Nova X Pro Max – 256GB (5G)',
    category: 'Electronics > Smartphones',
    price: 1099,
    compareAtPrice: 1199,
    description:
      'The Nova X Pro Max delivers flagship performance with an ultra-powerful processor, stunning OLED display, and professional-grade triple camera system.',
    features: [
      '6.7" Super Retina OLED Display',
      'Triple 48MP Pro Camera System',
      '256GB Storage',
      '5G Connectivity',
      'Face Unlock + Fingerprint',
      'Fast Charging Support',
    ],
    stock: 35,
    sku: 'NXP-256-BLK',
    images: [{ url: '/products/p1.jpg', public_id: '' }],
    brand: 'Nova',
    tags: ['smartphone', '5g', 'flagship', 'electronics'],
    featured: true,
    averageRating: 4.8,
    reviewCount: 1284,
  },
  {
    name: 'AirSound Pro Wireless Earbuds',
    category: 'Electronics > Audio',
    price: 199,
    compareAtPrice: 249,
    description:
      'Experience crystal-clear sound with AirSound Pro. Active noise cancellation and immersive bass technology.',
    features: [
      'Active Noise Cancellation',
      '24 Hour Battery Life',
      'Bluetooth 5.3',
      'Touch Controls',
      'Fast Charging Case',
    ],
    stock: 120,
    sku: 'ASP-WHITE-01',
    images: [{ url: '/products/p2.jpg', public_id: '' }],
    brand: 'AirSound',
    tags: ['earbuds', 'wireless', 'audio', 'electronics'],
    featured: true,
    averageRating: 4.6,
    reviewCount: 842,
  },
  {
    name: 'ArcticCool 500L Double Door Refrigerator',
    category: 'Home Appliances > Kitchen',
    price: 899,
    compareAtPrice: 999,
    description:
      'Upgrade your kitchen with ArcticCool 500L Refrigerator. Energy-efficient cooling and spacious compartments.',
    features: [
      '500 Liter Capacity',
      'Frost-Free Cooling',
      'Energy Efficient (A++)',
      'LED Interior Lighting',
      'Digital Temperature Control',
    ],
    stock: 12,
    sku: 'AC-500L-SS',
    images: [{ url: '/products/p3.jpg', public_id: '' }],
    brand: 'ArcticCool',
    tags: ['refrigerator', 'kitchen', 'appliances'],
    featured: false,
    averageRating: 4.5,
    reviewCount: 390,
  },
  {
    name: 'HeatWave 20L Compact Microwave Oven',
    category: 'Home Appliances',
    price: 149,
    compareAtPrice: 169,
    description:
      'HeatWave 20L Microwave offers quick and efficient heating with compact design.',
    features: [
      '20L Capacity',
      '700W Power',
      '5 Power Levels',
      'Defrost Function',
      'Easy Dial Control',
    ],
    stock: 50,
    sku: 'HW-20L-WHT',
    images: [{ url: '/products/p4.jpg', public_id: '' }],
    brand: 'HeatWave',
    tags: ['microwave', 'kitchen', 'appliances'],
    featured: false,
    averageRating: 4.3,
    reviewCount: 278,
  },
  {
    name: 'ChefMaster 7-Piece Wooden & Silicone Utensil Set',
    category: 'Kitchen Essentials',
    price: 59,
    compareAtPrice: 69,
    description:
      'ChefMaster premium utensil set. Heat-resistant, durable, and stylish for modern kitchens.',
    features: [
      '7-Piece Set',
      'Heat Resistant up to 230°C',
      'Non-Scratch Silicone',
      'Wooden Handles',
      'Storage Holder Included',
    ],
    stock: 85,
    sku: 'CM-7SET',
    images: [{ url: '/products/p5.jpg', public_id: '' }],
    brand: 'ChefMaster',
    tags: ['utensils', 'kitchen', 'cooking'],
    featured: true,
    averageRating: 4.7,
    reviewCount: 612,
  },
  {
    name: 'BakePro Premium Non-Stick Roasting Pan',
    category: 'Kitchen Essentials',
    price: 79,
    compareAtPrice: 89,
    description:
      'BakePro Roasting Pan delivers even heat distribution with premium non-stick coating.',
    features: [
      'Non-Stick Coating',
      'Heat Resistant Handles',
      'Oven Safe up to 250°C',
      'Elegant Design',
      'Easy to Clean',
    ],
    stock: 40,
    sku: 'BP-ROAST-PNK',
    images: [{ url: '/products/p6.jpg', public_id: '' }],
    brand: 'BakePro',
    tags: ['baking', 'roasting', 'kitchen'],
    featured: false,
    averageRating: 4.6,
    reviewCount: 344,
  },
];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return unauthorizedResponse();
    }

    await connectDB();

    const skus = SEED_PRODUCTS.map((p) => p.sku);
    const deleted = await Product.deleteMany({ sku: { $in: skus } });
    if (deleted.deletedCount > 0) {
      console.log(`Removed ${deleted.deletedCount} existing seed product(s).`);
    }

    const created: string[] = [];
    for (const p of SEED_PRODUCTS) {
      const slug = slugify(p.name);
      await Product.create({
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images,
        category: p.category,
        features: p.features,
        stock: p.stock,
        sku: p.sku,
        featured: p.featured,
        tags: p.tags,
        brand: p.brand,
        averageRating: p.averageRating,
        reviewCount: p.reviewCount,
        reviews: [],
      });
      created.push(p.name);
    }

    return successResponse({
      message: `Seeded ${created.length} products.`,
      products: created,
    });
  } catch (err) {
    console.error('Seed products error:', err);
    return serverErrorResponse();
  }
}

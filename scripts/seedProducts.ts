/**
 * Seed products for e-commerce app.
 * Usage: npm run seed   OR   npx tsx scripts/seedProducts.ts
 * Requires: MONGODB_URI in .env.local (or set env before running)
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function loadEnvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2].trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
          value = value.slice(1, -1).replace(/\\n/g, '\n');
        process.env[key] = value;
      }
    }
  } catch {
    // ignore missing file
  }
}
loadEnvFile(path.join(root, '.env.local'));
loadEnvFile(path.join(root, '.env'));

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
      'The Nova X Pro Max delivers flagship performance with an ultra-powerful processor, stunning OLED display, and professional-grade triple camera system. Designed for speed, elegance, and next-level photography.',
    features: [
      '6.7" Super Retina OLED Display',
      'Triple 48MP Pro Camera System',
      '256GB Storage',
      '5G Connectivity',
      'Face Unlock + Fingerprint',
      'Fast Charging Support',
    ],
    rating: 4.8,
    numReviews: 1284,
    stock: 35,
    sku: 'NXP-256-BLK',
    images: ['/products/p1.jpg'],
    brand: 'Nova',
    tags: ['smartphone', '5g', 'flagship', 'electronics'],
    isFeatured: true,
    salesCount: 1250,
  },
  {
    name: 'AirSound Pro Wireless Earbuds',
    category: 'Electronics > Audio',
    price: 199,
    compareAtPrice: 249,
    description:
      'Experience crystal-clear sound with AirSound Pro. Designed with active noise cancellation and immersive bass technology, perfect for music lovers and professionals.',
    features: [
      'Active Noise Cancellation',
      '24 Hour Battery Life',
      'Bluetooth 5.3',
      'Touch Controls',
      'Fast Charging Case',
    ],
    rating: 4.6,
    numReviews: 842,
    stock: 120,
    sku: 'ASP-WHITE-01',
    images: ['/products/p2.jpg'],
    brand: 'AirSound',
    tags: ['earbuds', 'wireless', 'audio', 'electronics'],
    isFeatured: true,
    salesCount: 680,
  },
  {
    name: 'ArcticCool 500L Double Door Refrigerator',
    category: 'Home Appliances > Kitchen',
    price: 899,
    compareAtPrice: 999,
    description:
      'Upgrade your kitchen with ArcticCool 500L Refrigerator. Designed for modern homes with energy-efficient cooling and spacious compartments.',
    features: [
      '500 Liter Capacity',
      'Frost-Free Cooling',
      'Energy Efficient (A++)',
      'LED Interior Lighting',
      'Digital Temperature Control',
    ],
    rating: 4.5,
    numReviews: 390,
    stock: 12,
    sku: 'AC-500L-SS',
    images: ['/products/p3.jpg'],
    brand: 'ArcticCool',
    tags: ['refrigerator', 'kitchen', 'appliances'],
    isFeatured: false,
    salesCount: 210,
  },
  {
    name: 'HeatWave 20L Compact Microwave Oven',
    category: 'Home Appliances',
    price: 149,
    compareAtPrice: 169,
    description:
      'HeatWave 20L Microwave offers quick and efficient heating with compact design perfect for modern kitchens.',
    features: [
      '20L Capacity',
      '700W Power',
      '5 Power Levels',
      'Defrost Function',
      'Easy Dial Control',
    ],
    rating: 4.3,
    numReviews: 278,
    stock: 50,
    sku: 'HW-20L-WHT',
    images: ['/products/p4.jpg'],
    brand: 'HeatWave',
    tags: ['microwave', 'kitchen', 'appliances'],
    isFeatured: false,
    salesCount: 420,
  },
  {
    name: 'ChefMaster 7-Piece Wooden & Silicone Utensil Set',
    category: 'Kitchen Essentials',
    price: 59,
    compareAtPrice: 69,
    description:
      'Upgrade your cooking experience with ChefMaster premium utensil set. Heat-resistant, durable, and stylish for modern kitchens.',
    features: [
      '7-Piece Set',
      'Heat Resistant up to 230°C',
      'Non-Scratch Silicone',
      'Wooden Handles',
      'Modern Storage Holder Included',
    ],
    rating: 4.7,
    numReviews: 612,
    stock: 85,
    sku: 'CM-7SET',
    images: ['/products/p5.jpg'],
    brand: 'ChefMaster',
    tags: ['utensils', 'kitchen', 'cooking'],
    isFeatured: true,
    salesCount: 890,
  },
  {
    name: 'BakePro Premium Non-Stick Roasting Pan',
    category: 'Kitchen Essentials',
    price: 79,
    compareAtPrice: 89,
    description:
      'BakePro Roasting Pan delivers even heat distribution with premium non-stick coating, perfect for baking and roasting.',
    features: [
      'Non-Stick Coating',
      'Heat Resistant Handles',
      'Oven Safe up to 250°C',
      'Elegant Design',
      'Easy to Clean',
    ],
    rating: 4.6,
    numReviews: 344,
    stock: 40,
    sku: 'BP-ROAST-PNK',
    images: ['/products/p6.jpg'],
    brand: 'BakePro',
    tags: ['baking', 'roasting', 'kitchen'],
    isFeatured: false,
    salesCount: 310,
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI. Set it in .env.local or environment.');
    process.exit(1);
  }

  const mongoose = await import('mongoose');
  const { default: connectDB } = await import('../lib/db');
  const { default: Product } = await import('../models/Product');

  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const skus = SEED_PRODUCTS.map((p) => p.sku);
    const deleted = await Product.deleteMany({ sku: { $in: skus } });
    if (deleted.deletedCount > 0) {
      console.log(`Removed ${deleted.deletedCount} existing seed product(s) (by SKU).`);
    }

    for (const p of SEED_PRODUCTS) {
      const slug = slugify(p.name);
      const existing = await Product.findOne({ slug });
      if (existing && existing.sku != null && !skus.includes(existing.sku)) {
        console.warn(`Slug "${slug}" already in use; skipping ${p.name}`);
        continue;
      }

      await Product.create({
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        images: p.images ?? [],
        category: p.category,
        features: p.features ?? [],
        stock: p.stock,
        sku: p.sku,
        featured: p.isFeatured ?? false,
        salesCount: p.salesCount ?? 0,
        tags: p.tags ?? [],
        brand: p.brand,
        averageRating: p.rating ?? 0,
        reviewCount: p.numReviews ?? 0,
        reviews: [],
      });
      console.log(`Created: ${p.name} (${p.sku})`);
    }

    console.log('Seed completed successfully.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.default.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

seed();

export interface FeaturedProduct {
  id: string;
  name: string;
  description: string;
  details: string[];
  image: string;
  price: string;
  category: string;
}

/** Featured products on the home page – 6 products using p1.jpg through p6.jpg */
export const FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: '1',
    name: 'Nova X Pro Max – 256GB (5G)',
    description:
      'The Nova X Pro Max delivers flagship performance with an ultra-powerful processor, stunning OLED display, and professional-grade triple camera system.',
    details: [
      '6.7" Super Retina OLED Display',
      'Triple 48MP Pro Camera System',
      '256GB Storage',
      '5G Connectivity',
      'Face Unlock + Fingerprint',
      'Fast Charging Support',
    ],
    image: '/products/p1.jpg',
    price: '1099.00',
    category: 'Electronics > Smartphones',
  },
  {
    id: '2',
    name: 'AirSound Pro Wireless Earbuds',
    description:
      'Experience crystal-clear sound with AirSound Pro. Active noise cancellation and immersive bass technology for music lovers and professionals.',
    details: [
      'Active Noise Cancellation',
      '24 Hour Battery Life',
      'Bluetooth 5.3',
      'Touch Controls',
      'Fast Charging Case',
    ],
    image: '/products/p2.jpg',
    price: '199.00',
    category: 'Electronics > Audio',
  },
  {
    id: '3',
    name: 'ArcticCool 500L Double Door Refrigerator',
    description:
      'Upgrade your kitchen with ArcticCool 500L Refrigerator. Energy-efficient cooling and spacious compartments for modern homes.',
    details: [
      '500 Liter Capacity',
      'Frost-Free Cooling',
      'Energy Efficient (A++)',
      'LED Interior Lighting',
      'Digital Temperature Control',
    ],
    image: '/products/p3.jpg',
    price: '899.00',
    category: 'Home Appliances > Kitchen',
  },
  {
    id: '4',
    name: 'HeatWave 20L Compact Microwave Oven',
    description:
      'HeatWave 20L Microwave offers quick and efficient heating with compact design perfect for modern kitchens.',
    details: [
      '20L Capacity',
      '700W Power',
      '5 Power Levels',
      'Defrost Function',
      'Easy Dial Control',
    ],
    image: '/products/p4.jpg',
    price: '149.00',
    category: 'Home Appliances',
  },
  {
    id: '5',
    name: 'ChefMaster 7-Piece Wooden & Silicone Utensil Set',
    description:
      'Upgrade your cooking with ChefMaster premium utensil set. Heat-resistant, durable, and stylish for modern kitchens.',
    details: [
      '7-Piece Set',
      'Heat Resistant up to 230°C',
      'Non-Scratch Silicone',
      'Wooden Handles',
      'Modern Storage Holder Included',
    ],
    image: '/products/p5.jpg',
    price: '59.00',
    category: 'Kitchen Essentials',
  },
  {
    id: '6',
    name: 'BakePro Premium Non-Stick Roasting Pan',
    description:
      'BakePro Roasting Pan delivers even heat distribution with premium non-stick coating, perfect for baking and roasting.',
    details: [
      'Non-Stick Coating',
      'Heat Resistant Handles',
      'Oven Safe up to 250°C',
      'Elegant Design',
      'Easy to Clean',
    ],
    image: '/products/p6.jpg',
    price: '79.00',
    category: 'Kitchen Essentials',
  },
];

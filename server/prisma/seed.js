import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import '../src/config/env.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL
  })
});

const categories = [
  { id: 'cat-mobiles', name: 'Mobiles' },
  { id: 'cat-tvs', name: 'Televisions' },
  { id: 'cat-appliances', name: 'Appliances' }
];

const seedProducts = [
  {
    slug: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    categoryId: 'cat-mobiles',
    categorySlug: 'mobiles',
    price: 129999,
    discount: 5,
    image: 'https://dummyimage.com/900x700/0b2130/ffffff&text=iPhone+15+Pro',
    images: [
      'https://dummyimage.com/900x700/0b2130/ffffff&text=iPhone+15+Pro+Front',
      'https://dummyimage.com/900x700/153243/ffffff&text=iPhone+15+Pro+Back'
    ],
    description: 'Apple flagship configured for premium smartphone buyers, managed in one shared inventory pool.',
    stock: 12,
    rating: 4.8,
    tags: ['A17 Pro', '256 GB', 'Titanium'],
    highlights: ['Central inventory tracking', 'High-margin flagship product', 'Eligible for fast dispatch']
  },
  {
    slug: 'samsung-galaxy-s24',
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    categoryId: 'cat-mobiles',
    categorySlug: 'mobiles',
    price: 89999,
    discount: 10,
    image: 'https://dummyimage.com/900x700/14213d/ffffff&text=Galaxy+S24',
    images: [
      'https://dummyimage.com/900x700/14213d/ffffff&text=Galaxy+S24+Front',
      'https://dummyimage.com/900x700/1f3b5b/ffffff&text=Galaxy+S24+Rear'
    ],
    description: 'Android flagship suited for the same single-store mobile assortment and promo calendar.',
    stock: 18,
    rating: 4.6,
    tags: ['AI Camera', '128 GB', 'AMOLED'],
    highlights: ['Popular search product', 'Good stock depth', 'Works well in brand-led campaigns']
  },
  {
    slug: 'sony-bravia-4k-tv',
    name: 'Sony Bravia 4K TV',
    brand: 'Sony',
    categoryId: 'cat-tvs',
    categorySlug: 'televisions',
    price: 79999,
    discount: 8,
    image: 'https://dummyimage.com/900x700/1d3557/ffffff&text=Sony+Bravia+4K+TV',
    images: [
      'https://dummyimage.com/900x700/1d3557/ffffff&text=Sony+TV+Angle1',
      'https://dummyimage.com/900x700/284f7a/ffffff&text=Sony+TV+Angle2'
    ],
    description: 'Premium television inventory handled by the same order, payment, and dispatch stack as mobiles.',
    stock: 6,
    rating: 4.5,
    tags: ['4K HDR', 'Google TV', '55 inch'],
    highlights: ['Category anchor product', 'Requires careful stock reservation', 'High value delivery workflow']
  },
  {
    slug: 'lg-smart-inverter-washing-machine',
    name: 'LG Smart Inverter Washing Machine',
    brand: 'LG',
    categoryId: 'cat-appliances',
    categorySlug: 'appliances',
    price: 36999,
    discount: 12,
    image: 'https://dummyimage.com/900x700/2a9d8f/ffffff&text=LG+Washer',
    images: [
      'https://dummyimage.com/900x700/2a9d8f/ffffff&text=LG+Washer+Front',
      'https://dummyimage.com/900x700/3fb4a5/ffffff&text=LG+Washer+Top'
    ],
    description: 'Appliance SKU managed in the same catalog without any seller partitioning or vendor handoff.',
    stock: 4,
    rating: 4.3,
    tags: ['Smart Inverter', '7 Kg', 'Top Load'],
    highlights: ['Low stock appliance', 'Requires stock alerts', 'Single-source store fulfillment']
  }
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { name: category.name },
      create: category
    });
  }

  const adminPassword = await bcrypt.hash('Admin@12345', 12);
  const vendorPassword = await bcrypt.hash('Vendor@12345', 12);

  await prisma.user.upsert({
    where: { email: 'admin@anutelecom.local' },
    update: {
      name: 'Store Admin',
      password: adminPassword,
      role: 'ADMIN'
    },
    create: {
      name: 'Store Admin',
      email: 'admin@anutelecom.local',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  await prisma.user.upsert({
    where: { email: 'vendor@anutelecom.local' },
    update: {
      name: 'Store Vendor',
      password: vendorPassword,
      role: 'VENDOR'
    },
    create: {
      name: 'Store Vendor',
      email: 'vendor@anutelecom.local',
      password: vendorPassword,
      role: 'VENDOR'
    }
  });

  for (const product of seedProducts) {
    const existingProduct = await prisma.product.findFirst({
      where: { slug: product.slug }
    });

    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: product
      });
    } else {
      await prisma.product.create({
        data: product
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

export const storeProfile = {
  name: 'Anu Telecom',
  tagline: 'Single-store electronics commerce with one catalog, one inventory pool, and one fulfillment team.',
  serviceAreas: ['Chennai', 'Bengaluru', 'Hyderabad', 'Coimbatore'],
  supportPhone: '+91 98765 43210'
};

export const architecture = {
  type: 'single-vendor',
  roles: ['customer', 'admin'],
  modules: [
    {
      title: 'Storefront',
      description: 'Customers browse one shared product catalog, filter by category, and add products into a persistent cart.'
    },
    {
      title: 'Checkout',
      description: 'The cart moves into address validation, payment initiation, and single-store stock confirmation.'
    },
    {
      title: 'Order Management',
      description: 'Every order follows one fulfillment pipeline owned by the store: placed, confirmed, packed, shipped, and delivered.'
    },
    {
      title: 'Admin Operations',
      description: 'Admins control catalog updates, inventory counts, pricing, and order status changes from one console.'
    }
  ],
  orderFlow: [
    'Customer browses the catalog and selects a product from the central store inventory.',
    'Cart quantities are validated against in-stock units before payment starts.',
    'Payment success leads to order creation and inventory reservation.',
    'Admin confirms, packs, ships, and closes delivery from a single operational queue.'
  ]
};

export const categories = [
  { id: 'cat-mobiles', name: 'Mobiles', slug: 'mobiles', description: 'Smartphones and accessories' },
  { id: 'cat-tvs', name: 'Televisions', slug: 'televisions', description: '4K, OLED, and smart TVs' },
  { id: 'cat-appliances', name: 'Appliances', slug: 'appliances', description: 'Home electronics and appliances' }
];

export const products = [
  {
    id: '1',
    slug: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'Mobiles',
    categorySlug: 'mobiles',
    price: 129999,
    image: 'https://dummyimage.com/900x700/0b2130/ffffff&text=iPhone+15+Pro',
    description: 'Apple flagship configured for premium smartphone buyers, managed in one shared inventory pool.',
    stock: 12,
    rating: 4.8,
    tags: ['A17 Pro', '256 GB', 'Titanium'],
    highlights: ['Central inventory tracking', 'High-margin flagship product', 'Eligible for fast dispatch']
  },
  {
    id: '2',
    slug: 'samsung-galaxy-s24',
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    category: 'Mobiles',
    categorySlug: 'mobiles',
    price: 89999,
    image: 'https://dummyimage.com/900x700/14213d/ffffff&text=Galaxy+S24',
    description: 'Android flagship suited for the same single-store mobile assortment and promo calendar.',
    stock: 18,
    rating: 4.6,
    tags: ['AI Camera', '128 GB', 'AMOLED'],
    highlights: ['Popular search product', 'Good stock depth', 'Works well in brand-led campaigns']
  },
  {
    id: '3',
    slug: 'sony-bravia-4k-tv',
    name: 'Sony Bravia 4K TV',
    brand: 'Sony',
    category: 'Televisions',
    categorySlug: 'televisions',
    price: 79999,
    image: 'https://dummyimage.com/900x700/1d3557/ffffff&text=Sony+Bravia+4K+TV',
    description: 'Premium television inventory handled by the same order, payment, and dispatch stack as mobiles.',
    stock: 6,
    rating: 4.5,
    tags: ['4K HDR', 'Google TV', '55 inch'],
    highlights: ['Category anchor product', 'Requires careful stock reservation', 'High value delivery workflow']
  },
  {
    id: '4',
    slug: 'lg-smart-inverter-washing-machine',
    name: 'LG Smart Inverter Washing Machine',
    brand: 'LG',
    category: 'Appliances',
    categorySlug: 'appliances',
    price: 36999,
    image: 'https://dummyimage.com/900x700/2a9d8f/ffffff&text=LG+Washer',
    description: 'Appliance SKU managed in the same catalog without any seller partitioning or vendor handoff.',
    stock: 4,
    rating: 4.3,
    tags: ['Smart Inverter', '7 Kg', 'Top Load'],
    highlights: ['Low stock appliance', 'Requires stock alerts', 'Single-source store fulfillment']
  }
];

export const demoUsers = [
  {
    id: 'admin-1',
    name: 'Store Admin',
    email: 'admin@anutelecom.local',
    role: 'admin',
    passwordHash: null
  }
];

export const orders = [
  {
    id: 'ord-1001',
    userId: 'admin-1',
    items: [{ productId: '1', quantity: 1 }],
    address: {
      fullName: 'Raj Kumar',
      city: 'Chennai',
      pinCode: '600001'
    },
    paymentMethod: 'online',
    paymentStatus: 'paid',
    total: 129999,
    status: 'Packed',
    trackingId: 'TRK-ANU-1001',
    createdAt: '2026-04-10T10:00:00.000Z'
  },
  {
    id: 'ord-1002',
    userId: 'admin-1',
    items: [{ productId: '3', quantity: 1 }],
    address: {
      fullName: 'Priya Nair',
      city: 'Bengaluru',
      pinCode: '560001'
    },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    total: 79999,
    status: 'Confirmed',
    trackingId: null,
    createdAt: '2026-04-11T12:45:00.000Z'
  }
];

export function buildAdminSnapshot() {
  const openOrderStates = new Set(['Placed', 'Confirmed', 'Packed', 'Shipped']);
  return {
    metrics: {
      activeProducts: products.length,
      lowStockProducts: products.filter((product) => product.stock <= 5).length,
      openOrders: orders.filter((order) => openOrderStates.has(order.status)).length,
      monthlyRevenue: orders.reduce((total, order) => total + order.total, 0)
    },
    modules: architecture.modules,
    operationalFlow: ['Catalog', 'Inventory', 'Checkout', 'Packing', 'Shipping', 'Delivery']
  };
}

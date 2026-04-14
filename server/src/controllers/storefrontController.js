import prisma from '../db.js';

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const storeProfile = {
  name: 'Anu Telecom',
  tagline: 'Single-store electronics commerce with one catalog and one fulfillment team.',
  supportPhone: '+91 98765 43210'
};

const architecture = {
  type: 'single-vendor',
  roles: ['USER', 'ADMIN', 'VENDOR'],
  modules: ['Storefront', 'Checkout', 'Order Management', 'Admin Operations']
};

export async function getStorefrontSnapshot(req, res) {
  const [products, productCategories, activeProducts, lowStockProducts, openOrders, revenue] =
    await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: { Category: true },
        orderBy: [{ createdAt: 'desc' }]
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { categoryId: true, categorySlug: true, Category: { select: { id: true, name: true } } }
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
      prisma.order.count({
        where: {
          status: {
            in: ['PENDING', 'PAID', 'CONFIRMED', 'PACKED', 'SHIPPED']
          }
        }
      }),
      prisma.order.aggregate({
        _sum: { total: true }
      })
    ]);

  const categories = Array.from(
    new Map(
      productCategories.map((category) => {
        const categoryName = category.Category?.name || '';
        const key = category.categorySlug || slugify(categoryName) || category.categoryId;
        return [
          key,
          {
            id: category.categoryId,
            name: categoryName,
            slug: key
          }
        ];
      })
    ).values()
  );

  res.json({
    store: storeProfile,
    architecture,
    categories,
    featuredProducts: products.slice(0, 3),
    adminSnapshot: {
      metrics: {
        activeProducts,
        lowStockProducts,
        openOrders,
        monthlyRevenue: revenue._sum.total ?? 0
      }
    }
  });
}

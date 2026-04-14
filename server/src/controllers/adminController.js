import prisma from '../db.js';

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeImages(product) {
  if (Array.isArray(product.images)) {
    return product.images.map((item) => String(item).trim()).filter(Boolean);
  }

  if (product.image) {
    return [String(product.image).trim()];
  }

  return [];
}

async function resolveCategoryId(product) {
  if (product.categoryId) {
    return product.categoryId;
  }

  const categoryName = product.category || product.categoryName || product.categorySlug;
  if (!categoryName) {
    return null;
  }

  const normalizedName = String(categoryName).trim();
  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ id: normalizedName }, { name: normalizedName }]
    }
  });

  if (existingCategory) {
    return existingCategory.id;
  }

  const createdCategory = await prisma.category.create({
    data: {
      id: slugify(normalizedName) || `cat-${Date.now()}`,
      name: normalizedName
    }
  });

  return createdCategory.id;
}

export async function getAdminDashboard(req, res) {
  const [activeProducts, lowStockProducts, openOrders, revenue, users, vendors] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
    prisma.order.count({
      where: { status: { in: ['PENDING', 'PAID', 'CONFIRMED', 'PACKED', 'SHIPPED'] } }
    }),
    prisma.order.aggregate({
      _sum: { total: true }
    }),
    prisma.user.count(),
    prisma.user.count({ where: { role: 'VENDOR' } })
  ]);

  return res.json({
    metrics: {
      activeProducts,
      lowStockProducts,
      openOrders,
      monthlyRevenue: revenue._sum.total ?? 0,
      users,
      vendors
    }
  });
}

export async function getAdminOrders(req, res) {
  const orders = await prisma.order.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      items: {
        include: {
          product: true
        }
      }
    }
  });

  return res.json(orders);
}

export async function manageProducts(req, res) {
  const { action, product } = req.body;
  if (!action || !product) {
    return res.status(400).json({ message: 'Action and product are required' });
  }

  const normalizedAction = String(action).toLowerCase();
  let savedProduct;
  const categoryId = await resolveCategoryId(product);

  if (normalizedAction === 'create') {
    if (!categoryId) {
      return res.status(400).json({ message: 'Product category is required' });
    }

    savedProduct = await prisma.product.create({
      data: {
        slug: product.slug || slugify(product.name),
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        discount: Number(product.discount ?? 0),
        stock: Number(product.stock ?? 0),
        categoryId,
        brand: product.brand || null,
        categorySlug: product.categorySlug || slugify(product.category || product.categoryName || ''),
        image: product.image || null,
        images: normalizeImages(product),
        rating: Number(product.rating ?? 0),
        tags: Array.isArray(product.tags) ? product.tags : [],
        highlights: Array.isArray(product.highlights) ? product.highlights : [],
        isActive: product.isActive ?? true
      }
    });
  } else if (normalizedAction === 'update') {
    if (!product.id) {
      return res.status(400).json({ message: 'Product id is required for updates' });
    }

    savedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        slug: product.slug || undefined,
        name: product.name,
        description: product.description ?? undefined,
        price: product.price !== undefined ? Number(product.price) : undefined,
        discount: product.discount !== undefined ? Number(product.discount) : undefined,
        stock: product.stock !== undefined ? Number(product.stock) : undefined,
        categoryId: categoryId || undefined,
        brand: product.brand ?? undefined,
        categorySlug: product.categorySlug || (product.category ? slugify(product.category || product.categoryName) : undefined),
        image: product.image ?? undefined,
        images: product.images !== undefined || product.image !== undefined ? normalizeImages(product) : undefined,
        rating: product.rating !== undefined ? Number(product.rating) : undefined,
        tags: Array.isArray(product.tags) ? product.tags : undefined,
        highlights: Array.isArray(product.highlights) ? product.highlights : undefined,
        isActive: product.isActive ?? undefined
      }
    });
  } else if (normalizedAction === 'delete') {
    if (!product.id) {
      return res.status(400).json({ message: 'Product id is required for deletion' });
    }

    savedProduct = await prisma.product.delete({
      where: { id: product.id }
    });
  } else {
    return res.status(400).json({ message: 'Unsupported action' });
  }

  return res.json({
    message: `Product ${normalizedAction} completed`,
    product: savedProduct
  });
}

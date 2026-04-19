import prisma from '../db.js';

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toProductDto(product) {
  const categoryName = product.Category?.name || product.category || '';
  const categorySlug = product.categorySlug || slugify(categoryName);
  const { Category, ...base } = product;
  const images = Array.isArray(product.images) ? product.images : [];
  const image = product.image || images[0] || null;
  const discount = Number(product.discount || 0);
  const discountedPrice = Math.max(0, Number(product.price) - (Number(product.price) * discount) / 100);

  return {
    ...base,
    image,
    images,
    discount,
    discountedPrice,
    brand: product.brand || '',
    category: categoryName,
    categorySlug,
    slug: product.slug || slugify(product.name)
  };
}

export async function getProducts(req, res) {
  const {
    search = '',
    category = 'all',
    brand = '',
    minPrice,
    maxPrice,
    minDiscount,
    minRating,
    page = 1,
    limit = 12,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 12));
  const skip = (parsedPage - 1) * parsedLimit;

  const normalizedSearch = String(search).trim();
  const normalizedCategory = String(category).trim().toLowerCase();
  const normalizedBrand = String(brand).trim().toLowerCase();
  const parsedMinPrice = minPrice !== undefined ? Number(minPrice) : undefined;
  const parsedMaxPrice = maxPrice !== undefined ? Number(maxPrice) : undefined;
  const parsedMinDiscount = minDiscount !== undefined ? Number(minDiscount) : undefined;
  const parsedMinRating = minRating !== undefined ? Number(minRating) : undefined;
  const hasMinPrice = parsedMinPrice !== undefined && !Number.isNaN(parsedMinPrice);
  const hasMaxPrice = parsedMaxPrice !== undefined && !Number.isNaN(parsedMaxPrice);
  const hasMinDiscount = parsedMinDiscount !== undefined && !Number.isNaN(parsedMinDiscount);
  const hasMinRating = parsedMinRating !== undefined && !Number.isNaN(parsedMinRating);
  const normalizedSortOrder = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

  const where = { isActive: true };

  if (normalizedSearch) {
    where.OR = [
      { name: { contains: normalizedSearch, mode: 'insensitive' } },
      { brand: { contains: normalizedSearch, mode: 'insensitive' } }
    ];
  }

  if (normalizedCategory && normalizedCategory !== 'all') {
    where.AND = where.AND || [];
    where.AND.push({
      OR: [
        { categorySlug: normalizedCategory },
        { categoryId: normalizedCategory },
        { Category: { name: { equals: normalizedCategory, mode: 'insensitive' } } }
      ]
    });
  }

  if (normalizedBrand) {
    const brands = normalizedBrand
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (brands.length > 0) {
      where.AND = where.AND || [];
      where.AND.push({
        OR: brands.map((entry) => ({
          brand: { equals: entry, mode: 'insensitive' }
        }))
      });
    }
  }

  if (hasMinPrice || hasMaxPrice) {
    where.price = {};
    if (hasMinPrice) where.price.gte = parsedMinPrice;
    if (hasMaxPrice) where.price.lte = parsedMaxPrice;
  }

  if (hasMinDiscount) {
    where.discount = { gte: parsedMinDiscount };
  }

  if (hasMinRating) {
    where.rating = { gte: parsedMinRating };
  }

  const orderByMap = {
    createdAt: { createdAt: normalizedSortOrder },
    price: { price: normalizedSortOrder },
    rating: { rating: normalizedSortOrder },
    discount: { discount: normalizedSortOrder },
    name: { name: normalizedSortOrder }
  };

  const orderBy = orderByMap[String(sortBy)] || orderByMap.createdAt;

  const [totalItems, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        Category: true
      },
      orderBy,
      skip,
      take: parsedLimit
    })
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / parsedLimit));

  return res.json({
    items: products.map(toProductDto),
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      totalItems,
      totalPages,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  });
}

export async function getProductById(req, res) {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      Category: true
    }
  });
  if (!product || !product.isActive) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(toProductDto(product));
}

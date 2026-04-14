import prisma from '../db.js';

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toCategoryDto(category) {
  return {
    id: category.id,
    name: category.name,
    productCount: category._count?.Product ?? undefined
  };
}

export async function getCategoriesController(req, res) {
  const categories = await prisma.category.findMany({
    orderBy: [{ name: 'asc' }],
    include: {
      _count: {
        select: {
          Product: true
        }
      }
    }
  });

  return res.json({ categories: categories.map(toCategoryDto) });
}

export async function getCategoryByIdController(req, res) {
  const { id } = req.params;
  const includeProducts = String(req.query.includeProducts || 'false').toLowerCase() === 'true';

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          Product: true
        }
      },
      Product: includeProducts
        ? {
            where: { isActive: true },
            orderBy: [{ createdAt: 'desc' }]
          }
        : false
    }
  });

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  return res.json({
    category: {
      ...toCategoryDto(category),
      products: includeProducts ? category.Product : undefined
    }
  });
}

export async function createCategoryController(req, res) {
  const { id, name } = req.body;
  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const categoryId = String(id || slugify(trimmedName)).trim();
  if (!categoryId) {
    return res.status(400).json({ message: 'Category id is required' });
  }

  const existingId = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  if (existingId) {
    return res.status(409).json({ message: 'Category id already exists' });
  }

  const existingName = await prisma.category.findUnique({
    where: { name: trimmedName }
  });
  if (existingName) {
    return res.status(409).json({ message: 'Category name already exists' });
  }

  const category = await prisma.category.create({
    data: {
      id: categoryId,
      name: trimmedName
    }
  });

  return res.status(201).json({ category });
}

export async function updateCategoryController(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const existing = await prisma.category.findUnique({
    where: { id }
  });
  if (!existing) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const conflict = await prisma.category.findUnique({
    where: { name: trimmedName }
  });
  if (conflict && conflict.id !== id) {
    return res.status(409).json({ message: 'Category name already exists' });
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name: trimmedName }
  });

  return res.json({ category });
}

export async function deleteCategoryController(req, res) {
  const { id } = req.params;
  const existing = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          Product: true
        }
      }
    }
  });

  if (!existing) {
    return res.status(404).json({ message: 'Category not found' });
  }

  if (existing._count.Product > 0) {
    return res.status(409).json({ message: 'Cannot delete category with assigned products' });
  }

  await prisma.category.delete({
    where: { id }
  });

  return res.json({ message: 'Category deleted' });
}


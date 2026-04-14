import prisma from '../db.js';

function normalizePaymentMethod(paymentMethod) {
  const normalized = String(paymentMethod || '').trim().toUpperCase();
  if (normalized === 'COD' || normalized === 'ONLINE') {
    return normalized;
  }

  return null;
}

export async function createOrder(req, res) {
  const { items, address, paymentMethod, total } = req.body;
  const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

  if (!Array.isArray(items) || !address || !normalizedPaymentMethod) {
    return res.status(400).json({ message: 'Order details are required' });
  }

  const productIds = [...new Set(items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true
    }
  });

  const productMap = new Map(products.map((product) => [product.id, product]));
  const orderLineItems = [];
  let computedTotal = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    const product = productMap.get(item.productId);

    if (!product || !Number.isInteger(quantity) || quantity <= 0 || product.stock < quantity) {
      return res.status(400).json({ message: 'One or more items are out of stock for the store inventory.' });
    }

    computedTotal += product.price * quantity;
    orderLineItems.push({
      productId: product.id,
      quantity,
      price: product.price
    });
  }

  if (total !== undefined && Number(total) !== computedTotal) {
    return res.status(400).json({ message: 'Order total does not match the calculated total' });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          address,
          paymentMethod: normalizedPaymentMethod,
          paymentStatus: normalizedPaymentMethod === 'COD' ? 'PENDING' : 'PAID',
          total: computedTotal,
          status: 'PENDING',
          trackingId: null,
          items: {
            create: orderLineItems
          }
        },
        include: {
          items: true
        }
      });

      for (const item of orderLineItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity
            }
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        if (updated.count !== 1) {
          throw new Error('One or more items are out of stock for the store inventory.');
        }
      }

      return createdOrder;
    });

    return res.status(201).json({ order });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to create order' });
  }
}

export async function getOrders(req, res) {
  const userOrders = await prisma.order.findMany({
    where: {
      userId: req.user.id
    },
    orderBy: [{ createdAt: 'desc' }],
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  return res.json(userOrders);
}

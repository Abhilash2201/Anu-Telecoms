import { randomUUID } from "crypto";
import prisma from "../db.js";

// Validates that a quantity is a positive integer — rejects floats, negatives, and strings
function parseQuantity(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return null;
  }
  return quantity;
}

// Each user has at most one cart (enforced by the unique constraint on Cart.userId).
// We create it lazily on first add-to-cart rather than at registration time.
async function getOrCreateCart(userId) {
  const existingCart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: {
      id: randomUUID(),
      userId,
    },
  });
}

// Transforms a raw Prisma cart record into the shape the frontend expects.
// Price is read live from the Product row (not stored on CartItem) so it
// always reflects the current selling price.
function mapCartResponse(cart) {
  const items = (cart?.CartItem || []).map((item) => {
    const product = item.Product;
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: product.price * item.quantity,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image:
          product.image ||
          (Array.isArray(product.images) ? product.images[0] : null),
        images: Array.isArray(product.images) ? product.images : [],
        discount: Number(product.discount || 0),
        stock: product.stock,
        isActive: product.isActive,
      },
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart?.id || null,
    userId: cart?.userId || null,
    items,
    subtotal,
    totalQuantity,
  };
}

// Fetches the cart with all nested relations needed to build a full cart response
async function getCartWithItems(userId) {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      CartItem: {
        include: {
          Product: true,
        },
      },
    },
  });
}

// Returns the current user's cart, or an empty cart shape if none exists yet
export async function getCartController(req, res) {
  const cart = await getCartWithItems(req.user.id);
  return res.json({ cart: mapCartResponse(cart) });
}

export async function addToCartController(req, res) {
  const { productId, quantity = 1 } = req.body;
  const parsedQuantity = parseQuantity(quantity);
  if (!productId || parsedQuantity === null) {
    return res
      .status(400)
      .json({ message: "productId and a valid quantity are required" });
  }

  const product = await prisma.product.findUnique({
    where: { id: String(productId) },
  });

  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }

  const cart = await getOrCreateCart(req.user.id);

  // If the product is already in the cart, add to existing quantity instead of creating a duplicate row
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: product.id,
    },
  });

  const nextQuantity = existingItem
    ? existingItem.quantity + parsedQuantity
    : parsedQuantity;

  // Guard against adding more than available stock
  if (product.stock < nextQuantity) {
    return res
      .status(400)
      .json({ message: "Requested quantity exceeds available stock" });
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: nextQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        id: randomUUID(),
        cartId: cart.id,
        productId: product.id,
        quantity: parsedQuantity,
      },
    });
  }

  const updatedCart = await getCartWithItems(req.user.id);
  return res.json({ cart: mapCartResponse(updatedCart) });
}

export async function updateCartItemController(req, res) {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const parsedQuantity = parseQuantity(quantity);
  if (!itemId || parsedQuantity === null) {
    return res
      .status(400)
      .json({ message: "itemId and a valid quantity are required" });
  }

  // Fetch with Cart relation so we can verify the item belongs to the requesting user
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      Cart: true,
      Product: true,
    },
  });

  if (!cartItem || cartItem.Cart.userId !== req.user.id) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  if (!cartItem.Product.isActive) {
    return res.status(400).json({ message: "Product is inactive" });
  }

  if (cartItem.Product.stock < parsedQuantity) {
    return res
      .status(400)
      .json({ message: "Requested quantity exceeds available stock" });
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: parsedQuantity },
  });

  const updatedCart = await getCartWithItems(req.user.id);
  return res.json({ cart: mapCartResponse(updatedCart) });
}

export async function removeCartItemController(req, res) {
  const { itemId } = req.params;
  if (!itemId) {
    return res.status(400).json({ message: "itemId is required" });
  }

  // Verify ownership before deleting — prevents users from deleting other users' cart items
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      Cart: true,
    },
  });

  if (!cartItem || cartItem.Cart.userId !== req.user.id) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } catch (err) {
    // P2025 means the record was already deleted (race condition: two delete
    // requests fired before either completed). Treat it as a successful removal.
    if (err?.code === "P2025") {
      return res.status(404).json({ message: "Cart item not found" });
    }
    throw err;
  }

  const updatedCart = await getCartWithItems(req.user.id);
  return res.json({ cart: mapCartResponse(updatedCart) });
}

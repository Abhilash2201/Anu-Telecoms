import { architecture, buildAdminSnapshot, categories, products, storeProfile } from '../data/storeData.js';

export async function getStorefrontSnapshot(req, res) {
  res.json({
    store: storeProfile,
    architecture,
    categories,
    featuredProducts: products.slice(0, 3),
    adminSnapshot: buildAdminSnapshot()
  });
}

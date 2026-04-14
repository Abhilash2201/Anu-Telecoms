export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  discount?: number;
  discountedPrice?: number;
  image: string | null;
  images?: string[];
  description: string;
  stock: number;
  rating: number;
  tags: string[];
  highlights: string[];
}

export interface ProductListResponse {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface StorefrontResponse {
  store: {
    name: string;
    tagline: string;
    supportPhone: string;
  };
  architecture: {
    type: string;
    roles: string[];
    modules: string[];
  };
  categories: Category[];
  featuredProducts: Product[];
  adminSnapshot: {
    metrics: {
      activeProducts: number;
      lowStockProducts: number;
      openOrders: number;
      monthlyRevenue: number;
    };
  };
}

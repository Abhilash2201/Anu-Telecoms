export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  rating: number;
  tags: string[];
  highlights: string[];
}

export interface StorefrontResponse {
  store: {
    name: string;
    tagline: string;
    serviceAreas: string[];
    supportPhone: string;
  };
  architecture: {
    type: string;
    roles: string[];
    modules: Array<{ title: string; description: string }>;
    orderFlow: string[];
  };
  categories: Category[];
  featuredProducts: Product[];
}

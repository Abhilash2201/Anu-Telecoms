import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import api from '../api/apiClient';
import ProductCard from '../components/ProductCard';
import { Category, Product, ProductListResponse } from '../types/store';

type ProductQuery = {
  page: number;
  limit: number;
  search: string;
  category: string;
  brand: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

const bannerCards = [
  { title: 'Mobiles', subtitle: 'Starting at Rs 5,999' },
  { title: 'Home Appliances', subtitle: 'Best Prices' },
  { title: 'Refrigerators', subtitle: 'Up to 40% off' },
  { title: 'TVs & Audio', subtitle: 'Starting Rs 12,999' }
];

function HomePage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<ProductListResponse['pagination']>({
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const query: ProductQuery = {
    page: Number(params.get('page') || 1),
    limit: Number(params.get('limit') || 12),
    search: params.get('search') || '',
    category: params.get('category') || 'all',
    brand: params.get('brand') || '',
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    sortBy: params.get('sortBy') || 'createdAt',
    sortOrder: params.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  };

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        setCategories(res.data?.categories || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', {
        params: {
          page: query.page,
          limit: query.limit,
          search: query.search || undefined,
          category: query.category,
          brand: query.brand || undefined,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }
      })
      .then((res) => {
        setProducts(res.data?.items || []);
        setPagination(res.data?.pagination || pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.toString()]);

  const availableBrands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort(),
    [products]
  );

  const updateQuery = (updates: Partial<ProductQuery>) => {
    const next = new URLSearchParams(params);
    const setOrDelete = (key: keyof ProductQuery, value: string | number | undefined) => {
      if (value === undefined || value === '' || value === 'all') next.delete(String(key));
      else next.set(String(key), String(value));
    };

    setOrDelete('search', updates.search ?? query.search);
    setOrDelete('category', updates.category ?? query.category);
    setOrDelete('brand', updates.brand ?? query.brand);
    setOrDelete('minPrice', updates.minPrice ?? query.minPrice);
    setOrDelete('maxPrice', updates.maxPrice ?? query.maxPrice);
    setOrDelete('sortBy', updates.sortBy ?? query.sortBy);
    setOrDelete('sortOrder', updates.sortOrder ?? query.sortOrder);
    setOrDelete('limit', updates.limit ?? query.limit);
    setOrDelete('page', updates.page ?? 1);

    setParams(next);
  };

  return (
    <Page>
      <Hero>
        <HeroContent>
          <HeroTitle>Big Festive Sale! Up to 50% Off</HeroTitle>
          <HeroText>Get exciting offers on mobiles, appliances and accessories.</HeroText>
          <HeroButton>Shop Now</HeroButton>
        </HeroContent>
        <HeroGraphic />
      </Hero>

      <BannerGrid>
        {bannerCards.map((card) => (
          <BannerCard key={card.title}>
            <BannerTitle>{card.title}</BannerTitle>
            <BannerText>{card.subtitle}</BannerText>
          </BannerCard>
        ))}
      </BannerGrid>

      <ContentWrap>
        <Sidebar>
          <FilterBlock>
            <FilterTitle>Category</FilterTitle>
            <FilterOption $active={query.category === 'all'} onClick={() => updateQuery({ category: 'all' })}>
              All
            </FilterOption>
            {categories.map((category) => (
              <FilterOption
                key={category.id}
                $active={query.category === category.id}
                onClick={() => updateQuery({ category: category.id })}
              >
                {category.name}
              </FilterOption>
            ))}
          </FilterBlock>

          <FilterBlock>
            <FilterTitle>Price</FilterTitle>
            <RangeRow>
              <RangeInput
                type="number"
                placeholder="Min"
                defaultValue={query.minPrice ?? ''}
                onBlur={(event) => updateQuery({ minPrice: event.target.value ? Number(event.target.value) : undefined })}
              />
              <RangeInput
                type="number"
                placeholder="Max"
                defaultValue={query.maxPrice ?? ''}
                onBlur={(event) => updateQuery({ maxPrice: event.target.value ? Number(event.target.value) : undefined })}
              />
            </RangeRow>
          </FilterBlock>

          <FilterBlock>
            <FilterTitle>Brand</FilterTitle>
            {availableBrands.length === 0 ? <FilterHint>No brands in current result.</FilterHint> : null}
            {availableBrands.map((brand) => (
              <FilterOption key={brand} $active={query.brand === brand} onClick={() => updateQuery({ brand: query.brand === brand ? '' : brand })}>
                {brand}
              </FilterOption>
            ))}
          </FilterBlock>
        </Sidebar>

        <ProductsArea>
          <ProductsHead>
            <div>
              <Heading>All Products</Heading>
              <SubHead>
                Showing {products.length} of {pagination.totalItems} products
              </SubHead>
            </div>
            <SortSelect
              value={`${query.sortBy}:${query.sortOrder}`}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split(':');
                updateQuery({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
              }}
            >
              <option value="createdAt:desc">Newest</option>
              <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option>
              <option value="discount:desc">Discount</option>
              <option value="rating:desc">Rating</option>
              <option value="name:asc">Name A-Z</option>
            </SortSelect>
          </ProductsHead>

          {loading ? <LoadingBox>Loading products...</LoadingBox> : null}

          <ProductGrid>
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </ProductGrid>

          {!loading && products.length === 0 ? <LoadingBox>No products found for current filters.</LoadingBox> : null}

          <PaginationWrap>
            <PaginationButton disabled={!pagination.hasPrevPage} onClick={() => updateQuery({ page: query.page - 1 })}>
              Prev
            </PaginationButton>
            <PageInfo>
              Page {pagination.page} / {pagination.totalPages}
            </PageInfo>
            <PaginationButton disabled={!pagination.hasNextPage} onClick={() => updateQuery({ page: query.page + 1 })}>
              Next
            </PaginationButton>
          </PaginationWrap>
        </ProductsArea>
      </ContentWrap>
    </Page>
  );
}

export default HomePage;

const Page = styled.div`
  display: grid;
  gap: 18px;
`;

const Hero = styled.section`
  border-radius: 16px;
  overflow: hidden;
  background: radial-gradient(circle at 25% 20%, rgba(255, 171, 87, 0.35), transparent 28%),
    linear-gradient(100deg, var(--brand-blue-dark), #2a67ec 55%, #8bc1ff);
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  min-height: 320px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const HeroContent = styled.div`
  padding: 38px;
  color: #fff;
  display: grid;
  align-content: center;
  gap: 12px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(34px, 4vw, 66px);
  line-height: 1.05;
`;

const HeroText = styled.p`
  margin: 0;
  font-size: 22px;
  opacity: 0.95;
`;

const HeroButton = styled.button`
  margin-top: 8px;
  border: 0;
  width: fit-content;
  color: #fff;
  background: var(--brand-orange);
  border-radius: 10px;
  font-weight: 800;
  font-size: 24px;
  padding: 12px 20px;
  cursor: pointer;
`;

const HeroGraphic = styled.div`
  background: url('https://dummyimage.com/980x580/1f62ea/ffffff&text=Mobiles+%7C+TVs+%7C+Appliances') center/cover no-repeat;
`;

const BannerGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const BannerCard = styled.div`
  min-height: 120px;
  border-radius: 12px;
  padding: 14px;
  color: #fff;
  display: grid;
  align-content: center;
  background: linear-gradient(100deg, #fc7f00, #2a67ec);
`;

const BannerTitle = styled.div`
  font-weight: 800;
  font-size: 30px;
`;

const BannerText = styled.div`
  font-size: 22px;
  opacity: 0.95;
`;

const ContentWrap = styled.section`
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 16px;

  @media (max-width: 1020px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  display: grid;
  gap: 14px;
  align-self: start;
`;

const FilterBlock = styled.div`
  border-top: 1px solid #eef2fb;
  padding-top: 10px;

  &:first-child {
    border-top: 0;
    padding-top: 0;
  }
`;

const FilterTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 27px;
`;

const FilterOption = styled.button<{ $active: boolean }>`
  display: block;
  width: 100%;
  border: 0;
  text-align: left;
  background: ${({ $active }) => ($active ? '#eef3ff' : 'transparent')};
  color: ${({ $active }) => ($active ? '#123a9d' : '#334060')};
  border-radius: 8px;
  padding: 8px 8px;
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
`;

const FilterHint = styled.div`
  font-size: 13px;
  color: #7a849b;
`;

const RangeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

const RangeInput = styled.input`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px;
`;

const ProductsArea = styled.div`
  display: grid;
  gap: 12px;
`;

const ProductsHead = styled.div`
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const Heading = styled.h2`
  margin: 0;
  font-size: 46px;
`;

const SubHead = styled.div`
  color: #66708a;
`;

const SortSelect = styled.select`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingBox = styled.div`
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  color: #5f6b87;
`;

const PaginationWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
`;

const PaginationButton = styled.button`
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 8px;
  padding: 7px 12px;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  font-weight: 600;
`;

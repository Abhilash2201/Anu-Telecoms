import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import api from '../api/apiClient';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { Product, ProductListResponse } from '../types/store';

type ProductQuery = {
  page: number;
  limit: number;
  search: string;
  category: string;
  brand: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

const RATING_OPTIONS = [
  { label: '4★ & Up', value: 4 },
  { label: '3★ & Up', value: 3 },
  { label: '2★ & Up', value: 2 }
];

function StarFill({ filled }: { filled: boolean }) {
  return <span style={{ color: filled ? '#f5a623' : '#d0d5e0' }}>★</span>;
}

function HomePage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [pagination, setPagination] = useState<ProductListResponse['pagination']>({
    page: 1, limit: 12, totalItems: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false
  });

  const query: ProductQuery = {
    page: Number(params.get('page') || 1),
    limit: Number(params.get('limit') || 12),
    search: params.get('search') || '',
    category: params.get('category') || 'all',
    brand: params.get('brand') || '',
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
    sortBy: params.get('sortBy') || 'createdAt',
    sortOrder: params.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  };

  const selectedBrands = useMemo(
    () => query.brand ? query.brand.split(',').map(b => b.trim()).filter(Boolean) : [],
    [query.brand]
  );

  useEffect(() => {
    setMinPriceInput(query.minPrice !== undefined ? String(query.minPrice) : '');
    setMaxPriceInput(query.maxPrice !== undefined ? String(query.maxPrice) : '');
  }, [params.get('minPrice'), params.get('maxPrice')]);

  useEffect(() => {
    setLoading(true);
    api.get('/products', {
      params: {
        page: query.page, limit: query.limit,
        search: query.search || undefined,
        category: query.category,
        brand: query.brand || undefined,
        minPrice: query.minPrice, maxPrice: query.maxPrice,
        minRating: query.minRating,
        sortBy: query.sortBy, sortOrder: query.sortOrder
      }
    })
      .then(res => { setProducts(res.data?.items || []); setPagination(res.data?.pagination || pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.toString()]);

  const availableBrands = useMemo(
    () => Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort(),
    [products]
  );


  const updateQuery = (updates: Partial<ProductQuery>) => {
    const next = new URLSearchParams(params);
    const setOrDel = (key: string, value: string | number | undefined) => {
      if (value === undefined || value === '' || value === 'all' || value === 0) next.delete(key);
      else next.set(key, String(value));
    };
    setOrDel('search', updates.search ?? query.search);
    setOrDel('category', updates.category ?? query.category);
    setOrDel('brand', updates.brand ?? query.brand);
    setOrDel('minPrice', updates.minPrice ?? query.minPrice);
    setOrDel('maxPrice', updates.maxPrice ?? query.maxPrice);
    setOrDel('minRating', updates.minRating ?? query.minRating);
    setOrDel('sortBy', updates.sortBy ?? query.sortBy);
    setOrDel('sortOrder', updates.sortOrder ?? query.sortOrder);
    setOrDel('limit', updates.limit ?? query.limit);
    next.set('page', String(updates.page ?? 1));
    if (next.get('page') === '1') next.delete('page');
    setParams(next);
  };

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    updateQuery({ brand: next.join(',') });
  };

  const applyPrice = () => {
    updateQuery({
      minPrice: minPriceInput ? Number(minPriceInput) : undefined,
      maxPrice: maxPriceInput ? Number(maxPriceInput) : undefined
    });
  };

  const clearAllFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setParams(new URLSearchParams());
  };

  const hasFilters = query.category !== 'all' || query.brand || query.minPrice !== undefined || query.maxPrice !== undefined || query.minRating !== undefined;

  const showFrom = (query.page - 1) * query.limit + 1;
  const showTo = Math.min(query.page * query.limit, pagination.totalItems);

  const pageNumbers = useMemo(() => {
    const total = pagination.totalPages;
    const cur = pagination.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (cur > 3) pages.push('...');
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
    if (cur < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  }, [pagination.page, pagination.totalPages]);

  return (
    <Page>
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadLink to="/">Home</BreadLink>
        <BreadSep>›</BreadSep>
        <BreadCur>All Products</BreadCur>
      </Breadcrumb>

      <ContentRow>
        {/* ── Sidebar ── */}
        <Sidebar>
          <FilterHeader>
            <FilterHeading>Filter By</FilterHeading>
            {hasFilters && <ClearBtn onClick={clearAllFilters}>Clear All</ClearBtn>}
          </FilterHeader>

          {/* Price */}
          <FilterBlock>
            <FilterTitle>Price</FilterTitle>
            {(query.minPrice !== undefined || query.maxPrice !== undefined) && (
              <PriceRange>
                {query.minPrice !== undefined ? `₹${query.minPrice.toLocaleString('en-IN')}` : '₹0'} – {query.maxPrice !== undefined ? `₹${query.maxPrice.toLocaleString('en-IN')}` : 'Any'}
              </PriceRange>
            )}
            <PriceInputRow>
              <PriceInput placeholder="Min ₹" value={minPriceInput} onChange={e => setMinPriceInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyPrice()} />
              <PriceSep>–</PriceSep>
              <PriceInput placeholder="Max ₹" value={maxPriceInput} onChange={e => setMaxPriceInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyPrice()} />
            </PriceInputRow>
            <ApplyBtn onClick={applyPrice}>Apply</ApplyBtn>
          </FilterBlock>

          {/* Brand */}
          {availableBrands.length > 0 && (
            <FilterBlock>
              <FilterTitle>Brand</FilterTitle>
              {availableBrands.map(brand => (
                <CheckItem key={brand}>
                  <CheckInput type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
                  <CheckLabel $active={selectedBrands.includes(brand)}>{brand}</CheckLabel>
                </CheckItem>
              ))}
            </FilterBlock>
          )}

          {/* Customer Ratings */}
          <FilterBlock>
            <FilterTitle>Customer Ratings</FilterTitle>
            {RATING_OPTIONS.map(opt => (
              <CheckItem key={opt.value}>
                <CheckInput
                  type="radio"
                  name="rating"
                  checked={query.minRating === opt.value}
                  onChange={() => updateQuery({ minRating: query.minRating === opt.value ? undefined : opt.value })}
                />
                <CheckLabel $active={query.minRating === opt.value}>
                  <StarRow>
                    {[1,2,3,4,5].map(s => <StarFill key={s} filled={s <= opt.value} />)}
                  </StarRow>
                  &nbsp;& Up
                </CheckLabel>
              </CheckItem>
            ))}
          </FilterBlock>
        </Sidebar>

        {/* ── Products Area ── */}
        <ProductsArea>
          <ProductsHead>
            <HeadLeft>
              <HeadTitle>All Products</HeadTitle>
              {pagination.totalItems > 0 && (
                <HeadSub>Showing {showFrom}–{showTo} of {pagination.totalItems} Products</HeadSub>
              )}
            </HeadLeft>
            <SortSelect
              value={`${query.sortBy}:${query.sortOrder}`}
              onChange={e => {
                const [sortBy, sortOrder] = e.target.value.split(':');
                updateQuery({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
              }}
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option>
              <option value="discount:desc">Best Discount</option>
              <option value="rating:desc">Top Rated</option>
              <option value="name:asc">Name A–Z</option>
            </SortSelect>
          </ProductsHead>

          {!loading && products.length === 0 && (
            <StatusBox>No products found. <ClearInline onClick={clearAllFilters}>Clear filters</ClearInline></StatusBox>
          )}

          <ProductGrid>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map(p => <ProductCard key={p.id} {...p} />)
            }
          </ProductGrid>

          {/* Numbered pagination */}
          {pagination.totalPages > 1 && (
            <PaginationRow>
              <PageBtn disabled={!pagination.hasPrevPage} onClick={() => updateQuery({ page: query.page - 1 })}>‹ Prev</PageBtn>
              {pageNumbers.map((p, i) =>
                p === '...'
                  ? <PageDots key={`dots-${i}`}>…</PageDots>
                  : <PageBtn key={p} $active={p === pagination.page} onClick={() => updateQuery({ page: p as number })}>{p}</PageBtn>
              )}
              <PageBtn disabled={!pagination.hasNextPage} onClick={() => updateQuery({ page: query.page + 1 })}>Next ›</PageBtn>
            </PaginationRow>
          )}
        </ProductsArea>
      </ContentRow>

      {/* Trust Badges */}
      <TrustRow>
        {[
          { icon: '🚚', title: 'Free Shipping', sub: 'On orders over ₹500' },
          { icon: '🔒', title: 'Secure Payments', sub: '100% Safe & Protected' },
          { icon: '✅', title: 'Genuine Products', sub: 'Guaranteed Authentic' },
          { icon: '↩️', title: '7-Day Return Policy', sub: 'Easy Returns within 7 days' }
        ].map(b => (
          <TrustCard key={b.title}>
            <TrustIcon>{b.icon}</TrustIcon>
            <div>
              <TrustTitle>{b.title}</TrustTitle>
              <TrustSub>{b.sub}</TrustSub>
            </div>
          </TrustCard>
        ))}
      </TrustRow>
    </Page>
  );
}

export default HomePage;

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const Page = styled.div`display: grid; gap: 16px;`;

const Breadcrumb = styled.nav`
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #6b7a99;
  background: #fff; border: 1px solid var(--border);
  border-radius: 8px; padding: 8px 14px;
`;
const BreadLink = styled(RouterLink)`color: var(--brand-blue); font-weight: 500;`;
const BreadSep = styled.span`color: #b0b8cc;`;
const BreadCur = styled.span`color: #3d4f72; font-weight: 600;`;

const ContentRow = styled.div`
  display: grid;
  grid-template-columns: 252px 1fr;
  gap: 16px;
  align-items: start;
  @media (max-width: 1020px) { grid-template-columns: 1fr; }
`;

const Sidebar = styled.aside`
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: sticky;
  top: 16px;
  z-index: 10;
  @media (max-width: 1020px) {
    position: static;
  }
`;

const FilterHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
`;
const FilterHeading = styled.h2`margin: 0; font-size: 16px; font-weight: 800; color: #1a2540;`;
const ClearBtn = styled.button`
  border: 0; background: none; color: var(--brand-blue);
  font-size: 12px; font-weight: 600; cursor: pointer; padding: 0;
  &:hover { text-decoration: underline; }
`;

const FilterBlock = styled.div`
  border-top: 1px solid #eef2fb;
  padding: 12px 0 4px;
`;
const FilterTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: #2c3a58;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CheckItem = styled.label`
  display: flex; align-items: center; gap: 8px;
  padding: 4px 2px; cursor: pointer;
  &:hover span { color: var(--brand-blue); }
`;
const CheckInput = styled.input`cursor: pointer; accent-color: var(--brand-blue); width: 14px; height: 14px;`;
const CheckLabel = styled.span<{ $active: boolean }>`
  font-size: 13px;
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ $active }) => $active ? 'var(--brand-blue)' : '#3d4f72'};
  display: flex; align-items: center; gap: 4px;
`;
const Count = styled.span`color: #9aa3b8; font-size: 11px; font-weight: 400;`;

const PriceRange = styled.div`
  font-size: 12px; font-weight: 600; color: #3d4f72;
  background: #f0f4ff; border-radius: 4px;
  padding: 3px 7px; margin-bottom: 8px; display: inline-block;
`;
const PriceInputRow = styled.div`display: flex; align-items: center; gap: 6px;`;
const PriceInput = styled.input`
  border: 1px solid var(--border); border-radius: 6px;
  padding: 6px 8px; font-size: 12px; width: 0; flex: 1; min-width: 0;
  &:focus { outline: none; border-color: var(--brand-blue); }
`;
const PriceSep = styled.span`color: #9aa3b8; font-size: 13px;`;
const ApplyBtn = styled.button`
  margin-top: 8px; width: 100%;
  background: var(--brand-blue); color: #fff;
  border: 0; border-radius: 6px; padding: 7px 0;
  font-size: 12px; font-weight: 700; cursor: pointer;
  &:hover { background: var(--brand-blue-dark); }
`;

const StarRow = styled.span`display: inline-flex; gap: 1px;`;

const ProductsArea = styled.div`display: flex; flex-direction: column; gap: 14px;`;

const ProductsHead = styled.div`
  background: #fff; border: 1px solid var(--border);
  border-radius: 10px; padding: 12px 16px;
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
`;
const HeadLeft = styled.div``;
const HeadTitle = styled.h2`margin: 0; font-size: 20px; font-weight: 800; color: #1a2540;`;
const HeadSub = styled.div`font-size: 12px; color: #7a849b; margin-top: 2px;`;

const SortSelect = styled.select`
  border: 1px solid var(--border); border-radius: 7px;
  padding: 7px 10px; font-size: 13px; font-weight: 600;
  color: #2c3a58; background: #fff; cursor: pointer;
  &:focus { outline: none; border-color: var(--brand-blue); }
`;

const StatusBox = styled.div`
  background: #fff; border: 1px solid var(--border);
  border-radius: 10px; padding: 28px;
  text-align: center; color: #6b7a99; font-size: 14px;
`;
const ClearInline = styled.button`
  border: 0; background: none; color: var(--brand-blue);
  font-weight: 600; cursor: pointer; font-size: 14px;
  &:hover { text-decoration: underline; }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 1280px) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  @media (max-width: 1020px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 700px)  { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 420px)  { grid-template-columns: 1fr; }
`;

const PaginationRow = styled.div`
  display: flex; justify-content: center; align-items: center; gap: 4px;
  background: #fff; border: 1px solid var(--border);
  border-radius: 10px; padding: 12px;
`;
const PageBtn = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ $active }) => $active ? 'var(--brand-blue)' : 'var(--border)'};
  background: ${({ $active }) => $active ? 'var(--brand-blue)' : '#fff'};
  color: ${({ $active }) => $active ? '#fff' : '#2c3a58'};
  border-radius: 6px; padding: 5px 10px;
  font-size: 13px; font-weight: ${({ $active }) => $active ? 700 : 500};
  cursor: pointer; min-width: 34px;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:hover:not(:disabled):not([data-active]) { background: #f0f4ff; }
`;
const PageDots = styled.span`padding: 5px 4px; color: #9aa3b8;`;

const TrustRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const TrustCard = styled.div`
  background: #fff; border: 1px solid var(--border);
  border-radius: 10px; padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
`;
const TrustIcon = styled.div`font-size: 28px; flex-shrink: 0;`;
const TrustTitle = styled.div`font-size: 13px; font-weight: 700; color: #1a2540;`;
const TrustSub = styled.div`font-size: 11px; color: #7a849b; margin-top: 2px;`;

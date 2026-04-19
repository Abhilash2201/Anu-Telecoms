import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/apiClient';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { Category, Product } from '../types/store';

interface StoreInfo {
  name: string;
  tagline: string;
  supportPhone: string;
}

const CATEGORY_META: Record<string, { overlay: string; img: string; icon: string }> = {
  'cat-mobiles':    {
    overlay: 'linear-gradient(135deg,rgba(20,67,200,0.78) 0%,rgba(76,142,248,0.65) 100%)',
    img:     'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=480&h=300&fit=crop&q=80',
    icon:    '📱'
  },
  'cat-tvs':        {
    overlay: 'linear-gradient(135deg,rgba(100,30,200,0.78) 0%,rgba(180,100,240,0.65) 100%)',
    img:     'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=480&h=300&fit=crop&q=80',
    icon:    '📺'
  },
  'cat-appliances': {
    overlay: 'linear-gradient(135deg,rgba(8,110,80,0.78) 0%,rgba(30,190,130,0.65) 100%)',
    img:     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=480&h=300&fit=crop&q=80',
    icon:    '🏠'
  }
};

const PROMO_BANNERS = [
  {
    label: 'NEW ARRIVALS', title: 'Latest Smartphones', sub: 'Explore the newest models',
    to: '/shop?sortBy=createdAt&sortOrder=desc',
    overlay: 'linear-gradient(100deg,rgba(20,67,200,0.88) 0%,rgba(76,142,248,0.55) 100%)',
    img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=560&h=220&fit=crop&q=80'
  },
  {
    label: 'BEST DEALS', title: 'Up to 20% Off', sub: 'Limited time offers',
    to: '/shop?sortBy=discount&sortOrder=desc',
    overlay: 'linear-gradient(100deg,rgba(190,70,0,0.88) 0%,rgba(240,150,40,0.55) 100%)',
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=560&h=220&fit=crop&q=80'
  },
  {
    label: 'TOP RATED', title: 'Customer Favourites', sub: 'Highest rated products',
    to: '/shop?sortBy=rating&sortOrder=desc',
    overlay: 'linear-gradient(100deg,rgba(8,110,75,0.88) 0%,rgba(30,190,110,0.55) 100%)',
    img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=560&h=220&fit=crop&q=80'
  }
];

function HomePage() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [topDeals, setTopDeals] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/storefront'),
      api.get('/products?sortBy=discount&sortOrder=desc&limit=5')
    ]).then(([sf, deals]) => {
      setStore(sf.data.store);
      setCategories(sf.data.categories || []);
      setFeatured(sf.data.featuredProducts || []);
      setTopDeals(deals.data.items || []);
    }).catch(console.error).finally(() => setLoadingProducts(false));
  }, []);

  return (
    <Page>
      {/* ── Hero ── */}
      <Hero>
        <HeroContent>
          <HeroPill>Big Festive Sale 🎉</HeroPill>
          <HeroTitle>Up to 50% Off on<br />Top Electronics</HeroTitle>
          <HeroSub>Mobiles · Televisions · Appliances · Accessories</HeroSub>
          <HeroActions>
            <HeroCTA to="/shop">Shop Now</HeroCTA>
            <HeroSecondary to="/shop?sortBy=discount&sortOrder=desc">View Offers</HeroSecondary>
          </HeroActions>
          {store && (
            <HeroContact>📞 {store.supportPhone} &nbsp;|&nbsp; Mon – Sat, 9 am – 7 pm</HeroContact>
          )}
        </HeroContent>
        <HeroVisual>
          <HeroImage
            src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=760&h=480&fit=crop&q=80"
            alt="Anu Telecom Products"
          />
        </HeroVisual>
      </Hero>

      {/* ── Category Cards ── */}
      {categories.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>Shop by Category</SectionTitle>
            <SectionLink to="/shop">View All →</SectionLink>
          </SectionHeader>
          <CategoryGrid>
            {categories.map(cat => {
              const meta = CATEGORY_META[cat.id] ?? {
                overlay: 'linear-gradient(135deg,rgba(37,60,120,0.82),rgba(74,111,192,0.72))',
                img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&h=300&fit=crop&q=80',
                icon: '🛒'
              };
              return (
                <CategoryCard key={cat.id} to={`/shop?category=${cat.id}`} $overlay={meta.overlay} $img={meta.img}>
                  <CatIcon>{meta.icon}</CatIcon>
                  <CatName>{cat.name}</CatName>
                  {cat.productCount !== undefined && <CatCount>{cat.productCount} products</CatCount>}
                  <CatCta>Shop Now →</CatCta>
                </CategoryCard>
              );
            })}
          </CategoryGrid>
        </Section>
      )}

      {/* ── Promo Banners ── */}
      <PromoBanners>
        {PROMO_BANNERS.map(b => (
          <PromoBanner key={b.label} to={b.to} $overlay={b.overlay} $img={b.img}>
            <PromoLabel>{b.label}</PromoLabel>
            <PromoTitle>{b.title}</PromoTitle>
            <PromoSub>{b.sub}</PromoSub>
            <PromoArrow>→</PromoArrow>
          </PromoBanner>
        ))}
      </PromoBanners>

      {/* ── Featured Products ── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Featured Products</SectionTitle>
          <SectionLink to="/shop">See All →</SectionLink>
        </SectionHeader>
        <ProductGrid>
          {loadingProducts
            ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map(p => <ProductCard key={p.id} {...p} />)
          }
        </ProductGrid>
      </Section>

      {/* ── Top Deals ── */}
      <Section>
        <SectionHeader>
          <SectionTitle>🔥 Top Deals</SectionTitle>
          <SectionLink to="/shop?sortBy=discount&sortOrder=desc">More Deals →</SectionLink>
        </SectionHeader>
        <ProductGrid>
          {loadingProducts
            ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : topDeals.map(p => <ProductCard key={p.id} {...p} />)
          }
        </ProductGrid>
      </Section>

      {/* ── Trust Badges ── */}
      <TrustRow>
        {[
          { icon: '🚚', title: 'Free Shipping',       sub: 'On orders over ₹500' },
          { icon: '🔒', title: 'Secure Payments',      sub: '100% Safe & Protected' },
          { icon: '✅', title: 'Genuine Products',     sub: 'Guaranteed Authentic' },
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

const fadeUp = keyframes`from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; }`;

const Page = styled.div`display:grid; gap:28px; animation:${fadeUp} 0.35s ease;`;

/* Hero */
const Hero = styled.section`
  border-radius: 18px; overflow: hidden;
  background: linear-gradient(110deg, #0d2c8c 0%, #1a4fd6 45%, #4c8ef8 100%);
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 360px;
  @media(max-width:860px){ grid-template-columns:1fr; }
`;
const HeroContent = styled.div`
  padding: 44px 42px; color:#fff;
  display:flex; flex-direction:column; justify-content:center; gap:14px;
`;
const HeroPill = styled.div`
  display:inline-flex; align-items:center;
  background:rgba(255,255,255,0.18); border:1px solid rgba(255,255,255,0.35);
  border-radius:20px; padding:5px 14px;
  font-size:13px; font-weight:700; letter-spacing:0.3px;
  width:fit-content;
`;
const HeroTitle = styled.h1`
  margin:0; font-size:clamp(28px,3.5vw,48px);
  font-weight:900; line-height:1.1; color:#fff;
`;
const HeroSub = styled.p`margin:0; font-size:15px; opacity:0.85;`;
const HeroActions = styled.div`display:flex; gap:12px; flex-wrap:wrap;`;
const HeroCTA = styled(RouterLink)`
  background:var(--brand-orange); color:#fff;
  border-radius:10px; padding:13px 26px;
  font-weight:800; font-size:16px;
  transition:background 0.15s;
  &:hover{background:var(--brand-orange-dark);}
`;
const HeroSecondary = styled(RouterLink)`
  background:rgba(255,255,255,0.15); color:#fff;
  border:1px solid rgba(255,255,255,0.45);
  border-radius:10px; padding:13px 22px;
  font-weight:700; font-size:15px;
  &:hover{background:rgba(255,255,255,0.25);}
`;
const HeroContact = styled.div`font-size:13px; opacity:0.7; margin-top:4px;`;
const HeroVisual = styled.div`
  display:flex; align-items:center; justify-content:center;
  padding:20px;
  @media(max-width:860px){display:none;}
`;
const HeroImage = styled.img`
  max-width:100%; max-height:280px;
  object-fit:contain; border-radius:12px;
`;

/* Section */
const Section = styled.section`display:grid; gap:16px;`;
const SectionHeader = styled.div`
  display:flex; justify-content:space-between; align-items:baseline;
`;
const SectionTitle = styled.h2`margin:0; font-size:20px; font-weight:800; color:#1a2540;`;
const SectionLink = styled(RouterLink)`
  font-size:13px; font-weight:700; color:var(--brand-blue);
  &:hover{text-decoration:underline;}
`;

/* Categories */
const CategoryGrid = styled.div`
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
  gap:14px;
`;
const CategoryCard = styled(RouterLink)<{ $overlay: string; $img: string }>`
  background: ${p => p.$overlay}, url(${p => p.$img});
  background-size: cover;
  background-position: center;
  border-radius:14px; padding:24px 20px;
  display:flex; flex-direction:column; gap:6px;
  color:#fff; transition:transform 0.18s, box-shadow 0.18s;
  min-height: 160px;
  &:hover{ transform:translateY(-3px); box-shadow:0 10px 28px rgba(0,0,0,0.25); }
`;
const CatIcon = styled.div`font-size:32px;`;
const CatName = styled.div`font-size:18px; font-weight:800;`;
const CatCount = styled.div`font-size:12px; opacity:0.8;`;
const CatCta = styled.div`margin-top:10px; font-size:13px; font-weight:700; opacity:0.9;`;

/* Promo banners */
const PromoBanners = styled.div`
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:12px;
  @media(max-width:800px){grid-template-columns:1fr;}
`;
const PromoBanner = styled(RouterLink)<{ $overlay: string; $img: string }>`
  background: ${p => p.$overlay}, url(${p => p.$img});
  background-size: cover;
  background-position: center;
  border-radius:12px; padding:22px 24px;
  color:#fff; display:flex; flex-direction:column; gap:4px;
  position:relative; overflow:hidden;
  min-height: 120px;
  transition:transform 0.18s;
  &:hover{ transform:translateY(-2px); }
`;
const PromoLabel = styled.div`font-size:11px; font-weight:800; letter-spacing:1.5px; opacity:0.75; text-transform:uppercase;`;
const PromoTitle = styled.div`font-size:20px; font-weight:900; line-height:1.2;`;
const PromoSub = styled.div`font-size:13px; opacity:0.8;`;
const PromoArrow = styled.div`
  position:absolute; right:20px; top:50%; transform:translateY(-50%);
  font-size:28px; opacity:0.5;
`;

/* Products */
const ProductGrid = styled.div`
  display:grid;
  grid-template-columns:repeat(5,minmax(0,1fr));
  gap:12px;
  @media(max-width:1280px){grid-template-columns:repeat(4,minmax(0,1fr));}
  @media(max-width:1020px){grid-template-columns:repeat(3,minmax(0,1fr));}
  @media(max-width:700px) {grid-template-columns:repeat(2,minmax(0,1fr));}
  @media(max-width:420px) {grid-template-columns:1fr;}
`;

/* Trust Badges */
const TrustRow = styled.div`
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px;
  @media(max-width:900px){grid-template-columns:repeat(2,1fr);}
  @media(max-width:480px){grid-template-columns:1fr;}
`;
const TrustCard = styled.div`
  background:#fff; border:1px solid var(--border);
  border-radius:10px; padding:16px;
  display:flex; align-items:center; gap:12px;
`;
const TrustIcon = styled.div`font-size:28px; flex-shrink:0;`;
const TrustTitle = styled.div`font-size:13px; font-weight:700; color:#1a2540;`;
const TrustSub = styled.div`font-size:11px; color:#7a849b; margin-top:2px;`;

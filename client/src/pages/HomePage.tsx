import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/apiClient';
import ProductCard from '../components/ProductCard';
import { Category, Product } from '../types/store';

interface StoreInfo {
  name: string;
  tagline: string;
  supportPhone: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'cat-mobiles':    'linear-gradient(135deg,#1a4fd6 0%,#4f8ef7 100%)',
  'cat-tvs':        'linear-gradient(135deg,#7b2ff7 0%,#b76ef7 100%)',
  'cat-appliances': 'linear-gradient(135deg,#0a9e6b 0%,#2dd9a0 100%)'
};
const CATEGORY_ICONS: Record<string, string> = {
  'cat-mobiles':    '📱',
  'cat-tvs':        '📺',
  'cat-appliances': '🏠'
};

const PROMO_BANNERS = [
  { label: 'NEW ARRIVALS', title: 'Latest Smartphones', sub: 'Explore the newest models', to: '/shop?sortBy=createdAt&sortOrder=desc', bg: 'linear-gradient(120deg,#1443c8,#4c8ef8)' },
  { label: 'BEST DEALS',   title: 'Up to 20% Off',     sub: 'Limited time offers',         to: '/shop?sortBy=discount&sortOrder=desc', bg: 'linear-gradient(120deg,#e05a00,#f7a23b)' },
  { label: 'TOP RATED',    title: 'Customer Favourites', sub: 'Highest rated products',    to: '/shop?sortBy=rating&sortOrder=desc',   bg: 'linear-gradient(120deg,#0a7f5b,#2dd47f)' }
];

function HomePage() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [topDeals, setTopDeals] = useState<Product[]>([]);

  useEffect(() => {
    api.get('/storefront').then(res => {
      setStore(res.data.store);
      setCategories(res.data.categories || []);
      setFeatured(res.data.featuredProducts || []);
    }).catch(console.error);

    api.get('/products?sortBy=discount&sortOrder=desc&limit=4').then(res => {
      setTopDeals(res.data.items || []);
    }).catch(console.error);
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
            src="https://dummyimage.com/760x480/1643c8/ffffff&text=Mobiles+%7C+TVs+%7C+Appliances"
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
            {categories.map(cat => (
              <CategoryCard key={cat.id} to={`/shop?category=${cat.id}`} $bg={CATEGORY_COLORS[cat.id] ?? 'linear-gradient(135deg,#253c78,#4a6fc0)'}>
                <CatIcon>{CATEGORY_ICONS[cat.id] ?? '🛒'}</CatIcon>
                <CatName>{cat.name}</CatName>
                {cat.productCount !== undefined && <CatCount>{cat.productCount} products</CatCount>}
                <CatCta>Shop Now →</CatCta>
              </CategoryCard>
            ))}
          </CategoryGrid>
        </Section>
      )}

      {/* ── Promo Banners ── */}
      <PromoBanners>
        {PROMO_BANNERS.map(b => (
          <PromoBanner key={b.label} to={b.to} $bg={b.bg}>
            <PromoLabel>{b.label}</PromoLabel>
            <PromoTitle>{b.title}</PromoTitle>
            <PromoSub>{b.sub}</PromoSub>
            <PromoArrow>→</PromoArrow>
          </PromoBanner>
        ))}
      </PromoBanners>

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>Featured Products</SectionTitle>
            <SectionLink to="/shop">See All →</SectionLink>
          </SectionHeader>
          <ProductGrid>
            {featured.map(p => <ProductCard key={p.id} {...p} />)}
          </ProductGrid>
        </Section>
      )}

      {/* ── Top Deals ── */}
      {topDeals.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>🔥 Top Deals</SectionTitle>
            <SectionLink to="/shop?sortBy=discount&sortOrder=desc">More Deals →</SectionLink>
          </SectionHeader>
          <ProductGrid>
            {topDeals.map(p => <ProductCard key={p.id} {...p} />)}
          </ProductGrid>
        </Section>
      )}

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
const CategoryCard = styled(RouterLink)<{ $bg: string }>`
  background:${p => p.$bg};
  border-radius:14px; padding:24px 20px;
  display:flex; flex-direction:column; gap:6px;
  color:#fff; transition:transform 0.18s, box-shadow 0.18s;
  &:hover{ transform:translateY(-3px); box-shadow:0 10px 28px rgba(0,0,0,0.18); }
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
const PromoBanner = styled(RouterLink)<{ $bg: string }>`
  background:${p => p.$bg};
  border-radius:12px; padding:22px 24px;
  color:#fff; display:flex; flex-direction:column; gap:4px;
  position:relative; overflow:hidden;
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
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px;
  @media(max-width:1100px){grid-template-columns:repeat(3,minmax(0,1fr));}
  @media(max-width:720px) {grid-template-columns:repeat(2,minmax(0,1fr));}
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

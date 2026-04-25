import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import Footer from './Footer';

interface Props {
  children: React.ReactNode;
}

const customerNav = [
  { label: 'Home', to: '/' },
  { label: 'Mobiles', to: '/shop?category=cat-mobiles' },
  { label: 'Televisions', to: '/shop?category=cat-tvs' },
  { label: 'Appliances', to: '/shop?category=cat-appliances' },
  { label: 'Brands', to: '/shop?sortBy=name&sortOrder=asc' },
  { label: 'Offers', to: '/shop?sortBy=discount&sortOrder=desc' }
];

const adminNav = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Orders', to: '/admin?tab=orders' },
  { label: 'Catalog', to: '/admin?tab=products' },
  { label: 'Customers', to: '/admin?tab=customers' }
];

export default function Layout({ children }: Props) {
  const { getItemCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = isAdmin ? adminNav : customerNav;

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isNavActive = (to: string): boolean => {
    const [toPath, toSearch] = to.split('?');
    if (location.pathname !== toPath) return false;
    if (!toSearch) {
      if (to === '/admin') {
        const tab = new URLSearchParams(location.search).get('tab');
        return !tab || tab === 'dashboard';
      }
      return true;
    }
    const toParams = new URLSearchParams(toSearch);
    const current = new URLSearchParams(location.search);
    for (const [key, value] of toParams.entries()) {
      if (current.get(key) !== value) return false;
    }
    return true;
  };

  const handleSearch = (q?: string) => {
    const term = q ?? search;
    navigate(`/shop?search=${encodeURIComponent(term)}`);
  };

  const cartCount = getItemCount();

  return (
    <Shell>
      <TopHeader>
        <Container>
          <Logo to="/">
            <LogoTitle>ANU TELECOM</LogoTitle>
            <LogoSubtitle>NAGAMANGALA</LogoSubtitle>
          </Logo>

          {/* Desktop actions */}
          <TopActions>
            {!isAdmin && (
              <ActionLink to={isAuthenticated ? '/account' : '/login'}>
                {isAuthenticated ? user?.name || 'Account' : 'Login'}
              </ActionLink>
            )}
            {!isAdmin && (
              <ActionLink to="/wishlist">
                ♡ Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
              </ActionLink>
            )}
            {isAuthenticated && (
              <ActionLink to={isAdmin ? '/admin' : '/orders'}>
                {isAdmin ? 'Admin' : 'Orders'}
              </ActionLink>
            )}
            <CartButton to="/cart">Cart ({cartCount})</CartButton>
            {isAuthenticated && <ActionButton onClick={logout}>Logout</ActionButton>}
          </TopActions>

          {/* Mobile right side */}
          <MobileRight>
            <CartButton to="/cart">
              🛒{cartCount > 0 ? ` ${cartCount}` : ''}
            </CartButton>
            <HamburgerBtn
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? '✕' : '☰'}
            </HamburgerBtn>
          </MobileRight>
        </Container>
      </TopHeader>

      {/* Desktop nav */}
      <NavWrap>
        <Container>
          <NavBar>
            <NavList>
              {navigationItems.map((item) => (
                <NavItem key={item.label} to={item.to} $active={isNavActive(item.to)}>
                  {item.label}
                </NavItem>
              ))}
            </NavList>
            <SearchBox>
              <SearchInput
                placeholder="Search for products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
              <SearchButton onClick={() => handleSearch()}>Search</SearchButton>
            </SearchBox>
          </NavBar>
        </Container>
      </NavWrap>

      {/* Mobile drawer */}
      <MobileDrawer $open={menuOpen}>
        <DrawerSearch>
          <SearchInput
            placeholder="Search for products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <SearchButton onClick={() => handleSearch()}>Search</SearchButton>
        </DrawerSearch>

        <DrawerSection>
          {navigationItems.map((item) => (
            <DrawerNavLink key={item.label} to={item.to} $active={isNavActive(item.to)}>
              {item.label}
            </DrawerNavLink>
          ))}
        </DrawerSection>

        <DrawerDivider />

        <DrawerSection>
          {!isAdmin && (
            <DrawerNavLink to={isAuthenticated ? '/account' : '/login'}>
              👤 {isAuthenticated ? user?.name || 'Account' : 'Login'}
            </DrawerNavLink>
          )}
          {!isAdmin && (
            <DrawerNavLink to="/wishlist">
              ♡ Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}
            </DrawerNavLink>
          )}
          {isAuthenticated && (
            <DrawerNavLink to={isAdmin ? '/admin' : '/orders'}>
              📦 {isAdmin ? 'Admin' : 'Orders'}
            </DrawerNavLink>
          )}
          {isAuthenticated && (
            <DrawerActionBtn onClick={logout}>Logout</DrawerActionBtn>
          )}
        </DrawerSection>
      </MobileDrawer>

      <Main>
        <Container>{children}</Container>
      </Main>
      <Footer />
    </Shell>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const Shell = styled.div`min-height: 100vh;`;

const Container = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 20px;
`;

const TopHeader = styled.header`
  background: linear-gradient(90deg, var(--brand-blue-dark), var(--brand-blue));
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.15);
  position: sticky;
  top: 0;
  z-index: 300;

  ${Container} {
    min-height: 84px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
`;

const Logo = styled(RouterLink)`
  display: grid;
  gap: 2px;
  flex-shrink: 0;
`;

const LogoTitle = styled.div`
  font-size: clamp(20px, 2.1vw, 42px);
  font-weight: 900;
  letter-spacing: 1px;
  line-height: 1;
`;

const LogoSubtitle = styled.div`
  font-size: 13px;
  letter-spacing: 5px;
  font-weight: 600;
  @media (max-width: 480px) { display: none; }
`;

/* Desktop actions — hidden on mobile */
const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  @media (max-width: 768px) { display: none; }
`;

const ActionLink = styled(RouterLink)`
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
`;

const ActionButton = styled.button`
  border: 0;
  color: #fff;
  background: transparent;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
`;

const CartButton = styled(RouterLink)`
  background: var(--brand-orange);
  color: #fff;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 800;
  white-space: nowrap;
`;

/* Mobile right: cart pill + hamburger — hidden on desktop */
const MobileRight = styled.div`
  display: none;
  align-items: center;
  gap: 10px;
  @media (max-width: 768px) { display: flex; }
`;

const HamburgerBtn = styled.button`
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* Desktop nav — hidden on mobile */
const NavWrap = styled.div`
  background: #fff;
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
  @media (max-width: 768px) { display: none; }
`;

const NavBar = styled.div`
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
`;

const NavList = styled.div`
  display: flex;
  align-items: center;
  overflow-x: auto;
`;

const NavItem = styled(RouterLink)<{ $active?: boolean }>`
  padding: 16px 14px 12px;
  font-weight: 700;
  color: #253254;
  border-bottom: 3px solid ${({ $active }) => ($active ? 'var(--brand-blue)' : 'transparent')};
  white-space: nowrap;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  min-width: 320px;
  background: #fff;
`;

const SearchInput = styled.input`
  border: 0;
  outline: none;
  padding: 11px 12px;
  flex: 1;
  min-width: 0;
`;

const SearchButton = styled.button`
  border: 0;
  background: #f1f5ff;
  color: #1e3268;
  font-weight: 700;
  padding: 11px 14px;
  cursor: pointer;
`;

/* Mobile drawer */
const MobileDrawer = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? 'flex' : 'none')};
    flex-direction: column;
    background: #fff;
    border-bottom: 1px solid var(--border);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    position: sticky;
    top: 0;
    z-index: 100;
  }
`;

const DrawerSearch = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border);
  background: #f8faff;

  ${SearchInput} { background: transparent; padding: 14px 16px; }
  ${SearchButton} { padding: 14px 16px; background: transparent; }
`;

const DrawerSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
`;

const DrawerNavLink = styled(RouterLink)<{ $active?: boolean }>`
  padding: 13px 20px;
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? '800' : '600')};
  color: ${({ $active }) => ($active ? 'var(--brand-blue)' : '#253254')};
  background: ${({ $active }) => ($active ? '#f0f5ff' : 'transparent')};
  &:hover { background: #f6f9ff; }
`;

const DrawerDivider = styled.div`
  height: 1px;
  background: var(--border);
  margin: 0 20px;
`;

const DrawerActionBtn = styled.button`
  background: none;
  border: none;
  text-align: left;
  padding: 13px 20px;
  font-size: 15px;
  font-weight: 600;
  color: #cf2f2f;
  cursor: pointer;
  &:hover { background: #fff5f5; }
`;

const Main = styled.main`padding: 24px 0 10px;`;

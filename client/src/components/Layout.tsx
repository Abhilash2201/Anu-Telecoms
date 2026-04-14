import { useState } from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

interface Props {
  children: React.ReactNode;
}

const customerNav = [
  { label: 'Home', to: '/' },
  { label: 'Mobiles', to: '/' },
  { label: 'Appliances', to: '/' },
  { label: 'Accessories', to: '/' },
  { label: 'Brands', to: '/' },
  { label: 'Offers', to: '/' }
];

const adminNav = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Orders', to: '/orders' },
  { label: 'Catalog', to: '/' },
  { label: 'Customers', to: '/account' }
];

export default function Layout({ children }: Props) {
  const { getItemCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = isAdmin ? adminNav : customerNav;

  const handleSearch = () => {
    navigate(`/?search=${encodeURIComponent(search)}`);
  };

  return (
    <Shell>
      <TopHeader>
        <Container>
          <Logo to="/">
            <LogoTitle>ANU TELECOM</LogoTitle>
            <LogoSubtitle>NAGAMANGALA</LogoSubtitle>
          </Logo>
          <TopActions>
            {!isAdmin ? (
              <ActionLink to={isAuthenticated ? '/account' : '/login'}>{isAuthenticated ? user?.name || 'Account' : 'Login'}</ActionLink>
            ) : null}
            {!isAdmin ? <ActionMuted>Wishlist</ActionMuted> : null}
            {isAuthenticated ? <ActionLink to={isAdmin ? '/admin' : '/orders'}>{isAdmin ? 'Admin' : 'Orders'}</ActionLink> : null}
            <CartButton to="/cart">Cart ({getItemCount()})</CartButton>
            {isAuthenticated ? <ActionButton onClick={logout}>Logout</ActionButton> : null}
          </TopActions>
        </Container>
      </TopHeader>

      <NavWrap>
        <Container>
          <NavBar>
            <NavList>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.to && item.label === 'Home';
                return (
                  <NavItem key={item.label} to={item.to} $active={isActive}>
                    {item.label}
                  </NavItem>
                );
              })}
            </NavList>
            <SearchBox>
              <SearchInput
                placeholder="Search for products..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearch();
                }}
              />
              <SearchButton onClick={handleSearch}>Search</SearchButton>
            </SearchBox>
          </NavBar>
        </Container>
      </NavWrap>

      <Main>
        <Container>{children}</Container>
      </Main>
      <Footer />
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
`;

const Container = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 20px;
`;

const TopHeader = styled.header`
  background: linear-gradient(90deg, var(--brand-blue-dark), var(--brand-blue));
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);

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
`;

const LogoTitle = styled.div`
  font-size: clamp(28px, 2.1vw, 42px);
  font-weight: 900;
  letter-spacing: 1px;
  line-height: 1;
`;

const LogoSubtitle = styled.div`
  font-size: 14px;
  letter-spacing: 5px;
  font-weight: 600;
`;

const TopActions = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`;

const ActionBase = styled(RouterLink)`
  font-weight: 600;
  color: #fff;
`;

const ActionLink = styled(ActionBase)``;

const ActionMuted = styled.span`
  font-weight: 600;
  opacity: 0.9;
`;

const ActionButton = styled.button`
  border: 0;
  color: #fff;
  background: transparent;
  font-weight: 600;
  cursor: pointer;
`;

const CartButton = styled(RouterLink)`
  background: var(--brand-orange);
  color: #fff;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 800;
`;

const NavWrap = styled.div`
  background: #fff;
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
`;

const NavBar = styled.div`
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    padding: 10px 0;
  }
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

  @media (max-width: 900px) {
    min-width: 100%;
  }
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

const Main = styled.main`
  padding: 24px 0 10px;
`;

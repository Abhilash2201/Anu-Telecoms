import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../utils/format';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  discount?: number;
  image: string | null;
  images?: string[];
  brand: string;
  category?: string;
  stock?: number;
  rating?: number;
}

export default function ProductCard({ id, name, price, discountedPrice, discount = 0, image, images, brand, category, stock, rating }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const effectivePrice = typeof discountedPrice === 'number' ? discountedPrice : price - (price * discount) / 100;
  const primaryImage = image || images?.[0] || 'https://dummyimage.com/400x400/e6ebf8/6c7895&text=No+Image';
  const outOfStock = typeof stock === 'number' && stock <= 0;
  const wishlisted = isWishlisted(id);

  return (
    <Card>
      <ImageWrap to={`/product/${id}`}>
        {discount > 0 && <Badge>{Math.round(discount)}% OFF</Badge>}
        <WishBtn
          type="button"
          $active={wishlisted}
          onClick={e => { e.preventDefault(); toggle({ id, name, brand, price, discountedPrice: effectivePrice, discount, image: primaryImage, images, stock, rating, category }); }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wishlisted ? '♥' : '♡'}
        </WishBtn>
        <Img src={primaryImage} alt={name} />
      </ImageWrap>
      <Body>
        <Name to={`/product/${id}`}>{name}</Name>
        <BrandLine>{brand}{category ? ` · ${category}` : ''}</BrandLine>
        {typeof rating === 'number' && rating > 0 && (
          <RatingRow>
            <RatingBadge>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</RatingBadge>
            <RatingVal>({rating.toFixed(1)})</RatingVal>
          </RatingRow>
        )}
        <PriceRow>
          <Price>{formatCurrency(effectivePrice)}</Price>
          {discount > 0 && <OldPrice>{formatCurrency(price)}</OldPrice>}
        </PriceRow>
        {outOfStock && <OutOfStock>Out of stock</OutOfStock>}
      </Body>
      <CartBtn
        disabled={outOfStock}
        onClick={() => addToCart({ id, name, brand, category: category ?? '', price, discountedPrice: effectivePrice, discount, image: primaryImage, images, stock })}
      >
        Add to Cart
      </CartBtn>
    </Card>
  );
}

const Card = styled.article`
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(16,45,108,0.06);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.18s;
  &:hover { box-shadow: 0 6px 20px rgba(16,45,108,0.13); }
`;

const ImageWrap = styled(RouterLink)`
  position: relative;
  aspect-ratio: 1 / 1;
  background: #f6f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Badge = styled.span`
  position: absolute;
  left: 8px;
  top: 8px;
  background: var(--brand-orange);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  border-radius: 4px;
  padding: 3px 7px;
  z-index: 1;
`;

const WishBtn = styled.button<{ $active: boolean }>`
  position: absolute;
  right: 8px;
  top: 8px;
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  color: ${({ $active }) => $active ? '#e53935' : '#9aa3b8'};
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  z-index: 1;
  transition: color 0.15s, transform 0.15s;
  &:hover { transform: scale(1.15); color: #e53935; }
`;

const Img = styled.img`
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
`;

const Body = styled.div`
  padding: 10px 12px 6px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const Name = styled(RouterLink)`
  font-size: 13px;
  font-weight: 600;
  color: #1f2b48;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BrandLine = styled.div`
  font-size: 11px;
  color: #8d97ad;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
`;

const RatingBadge = styled.span`
  font-size: 11px;
  color: #f5a623;
  letter-spacing: 1px;
`;

const RatingVal = styled.span`
  font-size: 11px;
  color: #8d97ad;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 4px;
`;

const Price = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #14244f;
`;

const OldPrice = styled.div`
  font-size: 12px;
  color: #aab0bf;
  text-decoration: line-through;
`;

const OutOfStock = styled.div`
  font-size: 11px;
  color: #cf2f2f;
  font-weight: 600;
`;

const CartBtn = styled.button`
  margin: 8px 10px 10px;
  border: 0;
  background: var(--brand-orange);
  color: #fff;
  border-radius: 6px;
  height: 36px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: var(--brand-orange-dark); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

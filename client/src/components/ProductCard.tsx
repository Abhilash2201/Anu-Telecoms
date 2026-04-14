import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
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
}

export default function ProductCard({ id, name, price, discountedPrice, discount = 0, image, images, brand, stock }: ProductCardProps) {
  const { addToCart } = useCart();
  const effectivePrice = typeof discountedPrice === 'number' ? discountedPrice : price - (price * discount) / 100;
  const primaryImage = image || images?.[0] || 'https://dummyimage.com/500x500/e6ebf8/6c7895&text=No+Image';

  return (
    <Card>
      <ImageWrap to={`/product/${id}`}>
        {discount > 0 ? <Badge>{Math.round(discount)}% OFF</Badge> : null}
        <Image src={primaryImage} alt={name} />
      </ImageWrap>
      <Content>
        <Name to={`/product/${id}`}>{name}</Name>
        <Meta>{brand}</Meta>
        <PriceRow>
          <Price>{formatCurrency(effectivePrice)}</Price>
          {discount > 0 ? <OldPrice>{formatCurrency(price)}</OldPrice> : null}
        </PriceRow>
        {typeof stock === 'number' ? <Stock $inStock={stock > 0}>{stock > 0 ? `${stock} in stock` : 'Out of stock'}</Stock> : null}
      </Content>
      <ActionButton disabled={typeof stock === 'number' && stock <= 0} onClick={() => addToCart({ id, name, brand, category: '', price, discountedPrice: effectivePrice, discount, image: primaryImage, images, stock })}>
        Add to Cart
      </ActionButton>
    </Card>
  );
}

const Card = styled.article`
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(16, 45, 108, 0.06);
  display: grid;
`;

const ImageWrap = styled(RouterLink)`
  position: relative;
  aspect-ratio: 1 / 1;
  background: #f6f9ff;
  display: grid;
  place-items: center;
`;

const Badge = styled.span`
  position: absolute;
  right: 10px;
  top: 10px;
  background: var(--brand-orange);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  border-radius: 6px;
  padding: 5px 8px;
`;

const Image = styled.img`
  max-width: 84%;
  max-height: 84%;
  object-fit: contain;
`;

const Content = styled.div`
  padding: 12px;
  display: grid;
  gap: 4px;
`;

const Name = styled(RouterLink)`
  font-size: 24px;
  font-weight: 700;
  color: #1f2b48;
  line-height: 1.25;
`;

const Meta = styled.div`
  color: #7c879f;
  font-size: 13px;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const Price = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: #14244f;
`;

const OldPrice = styled.div`
  color: #8d97ad;
  text-decoration: line-through;
  font-size: 16px;
`;

const Stock = styled.div<{ $inStock: boolean }>`
  font-size: 12px;
  color: ${({ $inStock }) => ($inStock ? '#1f8c4b' : '#cf2f2f')};
`;

const ActionButton = styled.button`
  margin: 0 10px 12px;
  border: 0;
  background: var(--brand-orange);
  color: #fff;
  border-radius: 8px;
  height: 42px;
  font-weight: 800;
  cursor: pointer;

  &:hover {
    background: var(--brand-orange-dark);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

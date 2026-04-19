import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import api from '../api/apiClient';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discount?: number;
  discountedPrice?: number;
  description: string;
  image: string | null;
  images?: string[];
  stock: number;
  rating: number;
  tags?: string[];
  highlights?: string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  User: { id: string; name: string };
}

/* ── Review Section ──────────────────────────────────────────────────────── */

function StarRow({ value, onChange, readOnly }: { value: number | null; onChange?: (v: number) => void; readOnly?: boolean }) {
  return (
    <Stars>
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          $filled={s <= (value ?? 0)}
          $clickable={!readOnly}
          onClick={() => !readOnly && onChange?.(s)}
        >★</Star>
      ))}
    </Stars>
  );
}

function ReviewSection({ productId }: { productId: string }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const alreadyReviewed = reviews.some(r => r.userId === user?.id);

  useEffect(() => {
    api.get(`/products/${productId}/reviews`)
      .then(res => setReviews(res.data))
      .catch(console.error)
      .finally(() => setLoadingReviews(false));
  }, [productId]);

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post(`/products/${productId}/reviews`, { rating, comment });
      setReviews(prev => [res.data, ...prev]);
      setRating(null);
      setComment('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg ?? 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Failed to delete review');
    }
  };

  return (
    <ReviewsWrap>
      <ReviewsTitle>Customer Reviews {reviews.length > 0 && <ReviewCount>({reviews.length})</ReviewCount>}</ReviewsTitle>

      {isAuthenticated && !alreadyReviewed && (
        <WriteReview>
          <WriteTitle>Write a Review</WriteTitle>
          <label style={{ fontSize: 13, color: '#556', marginBottom: 4 }}>Your rating</label>
          <StarRow value={rating} onChange={setRating} />
          <CommentBox
            placeholder="Share your experience with this product…"
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          {submitError && <ErrorMsg>{submitError}</ErrorMsg>}
          <SubmitBtn
            disabled={!rating || !comment.trim() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </SubmitBtn>
        </WriteReview>
      )}

      {loadingReviews ? (
        <ReviewSkeleton />
      ) : reviews.length === 0 ? (
        <EmptyReviews>No reviews yet. Be the first to review this product!</EmptyReviews>
      ) : (
        <ReviewList>
          {reviews.map(review => (
            <ReviewCard key={review.id}>
              <ReviewHeader>
                <ReviewerName>{review.User?.name ?? 'User'}</ReviewerName>
                <StarRow value={review.rating} readOnly />
                {user && (user.id === review.userId || user.role === 'ADMIN') && (
                  <DeleteBtn onClick={() => handleDelete(review.id)}>Delete</DeleteBtn>
                )}
              </ReviewHeader>
              <ReviewComment>{review.comment}</ReviewComment>
            </ReviewCard>
          ))}
        </ReviewList>
      )}
    </ReviewsWrap>
  );
}

/* ── Product Detail Page ─────────────────────────────────────────────────── */

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSkeleton />;
  if (!product) return <NotFound>Product not found.</NotFound>;

  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const primaryImg = images[activeImg] ?? 'https://dummyimage.com/600x600/e6ebf8/6c7895&text=No+Image';
  const effectivePrice = typeof product.discountedPrice === 'number'
    ? product.discountedPrice
    : product.price - (product.price * (product.discount ?? 0)) / 100;
  const discount = product.discount ?? 0;
  const outOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        discount,
        discountedPrice: effectivePrice,
        image: product.image,
        images: product.images,
        stock: product.stock
      });
    }
  };

  return (
    <Page>
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadLink to="/">Home</BreadLink>
        <BreadSep>›</BreadSep>
        <BreadLink to={`/shop?category=${product.category}`}>{product.category}</BreadLink>
        <BreadSep>›</BreadSep>
        <BreadCurrent>{product.name}</BreadCurrent>
      </Breadcrumb>

      {/* Main layout */}
      <ProductLayout>
        {/* Image panel */}
        <ImagePanel>
          <MainImageWrap>
            {discount > 0 && <DiscountBadge>{Math.round(discount)}% OFF</DiscountBadge>}
            <MainImage src={primaryImg} alt={product.name} />
          </MainImageWrap>
          {images.length > 1 && (
            <Thumbnails>
              {images.map((img, i) => (
                <Thumb
                  key={i}
                  src={img}
                  alt={`${product.name} view ${i + 1}`}
                  $active={i === activeImg}
                  onClick={() => setActiveImg(i)}
                />
              ))}
            </Thumbnails>
          )}
        </ImagePanel>

        {/* Info panel */}
        <InfoPanel>
          <BrandPill>{product.brand}</BrandPill>
          <ProductName>{product.name}</ProductName>

          {product.rating > 0 && (
            <RatingRow>
              <RatingStars>{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</RatingStars>
              <RatingVal>{product.rating.toFixed(1)}</RatingVal>
            </RatingRow>
          )}

          <PriceRow>
            <EffectivePrice>{formatCurrency(effectivePrice)}</EffectivePrice>
            {discount > 0 && (
              <>
                <OriginalPrice>{formatCurrency(product.price)}</OriginalPrice>
                <DiscountText>{Math.round(discount)}% off</DiscountText>
              </>
            )}
          </PriceRow>

          <StockLine $instock={!outOfStock}>
            {outOfStock ? '✕ Out of stock' : product.stock <= 5 ? `⚠ Only ${product.stock} left` : '✓ In stock'}
          </StockLine>

          {product.description && (
            <Description>{product.description}</Description>
          )}

          {product.highlights && product.highlights.length > 0 && (
            <HighlightsBox>
              <HighlightsTitle>Highlights</HighlightsTitle>
              <ul>
                {product.highlights.map((h, i) => <HighlightItem key={i}>{h}</HighlightItem>)}
              </ul>
            </HighlightsBox>
          )}

          {product.tags && product.tags.length > 0 && (
            <TagRow>
              {product.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
            </TagRow>
          )}

          <Divider />

          {/* Quantity + actions */}
          {!outOfStock && (
            <QtyRow>
              <QtyLabel>Qty</QtyLabel>
              <QtyControl>
                <QtyBtn onClick={() => setQty(q => Math.max(1, q - 1))}>−</QtyBtn>
                <QtyVal>{qty}</QtyVal>
                <QtyBtn onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</QtyBtn>
              </QtyControl>
            </QtyRow>
          )}

          <ActionRow>
            <AddToCartBtn disabled={outOfStock} onClick={handleAddToCart}>
              Add to Cart
            </AddToCartBtn>
            <WishBtn
              $active={wishlisted}
              onClick={() => toggle({
                id: product.id, name: product.name, brand: product.brand,
                price: product.price, discountedPrice: effectivePrice,
                discount, image: product.image, images: product.images,
                stock: product.stock, rating: product.rating, category: product.category
              })}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {wishlisted ? '♥' : '♡'}
            </WishBtn>
          </ActionRow>
        </InfoPanel>
      </ProductLayout>

      <SectionDivider />
      <ReviewSection productId={product.id} />
    </Page>
  );
}

/* ── Skeletons ───────────────────────────────────────────────────────────── */

const shimmer = keyframes`
  0%   { background-position: -800px 0; }
  100% { background-position:  800px 0; }
`;
const Bone = styled.div`
  background: linear-gradient(90deg,#ececec 25%,#e0e0e0 50%,#ececec 75%);
  background-size: 1600px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 6px;
`;

function PageSkeleton() {
  return (
    <Page>
      <ProductLayout>
        <Bone style={{ aspectRatio: '1/1', borderRadius: 12 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Bone style={{ height: 18, width: '40%' }} />
          <Bone style={{ height: 28, width: '80%' }} />
          <Bone style={{ height: 14, width: '30%' }} />
          <Bone style={{ height: 32, width: '45%' }} />
          <Bone style={{ height: 14, width: '25%' }} />
          <Bone style={{ height: 80, width: '100%' }} />
          <Bone style={{ height: 46, width: '60%', marginTop: 8 }} />
        </div>
      </ProductLayout>
    </Page>
  );
}

function ReviewSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2].map(i => (
        <ReviewCard key={i}>
          <Bone style={{ height: 13, width: '30%', marginBottom: 8 }} />
          <Bone style={{ height: 13, width: '20%', marginBottom: 8 }} />
          <Bone style={{ height: 13, width: '80%' }} />
        </ReviewCard>
      ))}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const fadeUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  animation: ${fadeUp} 0.3s ease;
`;

const NotFound = styled.div`padding: 40px; text-align: center; color: #7a849b;`;

/* Breadcrumb */
const Breadcrumb = styled.nav`display: flex; align-items: center; gap: 6px; font-size: 13px;`;
const BreadLink = styled(RouterLink)`color: var(--brand-blue); &:hover{text-decoration:underline;}`;
const BreadSep = styled.span`color: #bbb;`;
const BreadCurrent = styled.span`color: #7a849b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 280px;`;

/* Layout */
const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 440px 1fr;
  gap: 40px;
  align-items: start;
  @media(max-width: 900px) { grid-template-columns: 1fr; }
`;

/* Image */
const ImagePanel = styled.div`display: flex; flex-direction: column; gap: 10px;`;
const MainImageWrap = styled.div`
  position: relative;
  background: #f6f9ff;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1/1;
  display: flex; align-items: center; justify-content: center;
`;
const DiscountBadge = styled.div`
  position: absolute; top: 12px; left: 12px;
  background: var(--brand-orange); color: #fff;
  font-size: 12px; font-weight: 800;
  border-radius: 5px; padding: 4px 9px;
  z-index: 1;
`;
const MainImage = styled.img`
  max-width: 88%; max-height: 88%;
  object-fit: contain;
  transition: transform 0.35s ease;
  &:hover { transform: scale(1.06); }
`;
const Thumbnails = styled.div`display: flex; gap: 8px; flex-wrap: wrap;`;
const Thumb = styled.img<{ $active: boolean }>`
  width: 64px; height: 64px;
  object-fit: contain;
  border: 2px solid ${p => p.$active ? 'var(--brand-blue)' : 'var(--border)'};
  border-radius: 8px;
  padding: 4px;
  background: #f6f9ff;
  cursor: pointer;
  transition: border-color 0.15s;
  &:hover { border-color: var(--brand-blue); }
`;

/* Info */
const InfoPanel = styled.div`display: flex; flex-direction: column; gap: 14px;`;
const BrandPill = styled.div`
  display: inline-flex; width: fit-content;
  background: #eef3ff; color: var(--brand-blue);
  font-size: 12px; font-weight: 700;
  border-radius: 20px; padding: 4px 12px;
`;
const ProductName = styled.h1`
  margin: 0;
  font-size: clamp(20px, 2.2vw, 28px);
  font-weight: 900;
  color: #1a2540;
  line-height: 1.2;
`;
const RatingRow = styled.div`display: flex; align-items: center; gap: 8px;`;
const RatingStars = styled.span`font-size: 16px; color: #f5a623; letter-spacing: 1px;`;
const RatingVal = styled.span`
  font-size: 13px; font-weight: 700; color: #fff;
  background: #f5a623; border-radius: 4px; padding: 1px 7px;
`;
const PriceRow = styled.div`display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;`;
const EffectivePrice = styled.div`font-size: 28px; font-weight: 900; color: #1a2540;`;
const OriginalPrice = styled.div`font-size: 16px; color: #aab0bf; text-decoration: line-through;`;
const DiscountText = styled.div`font-size: 15px; font-weight: 700; color: #2db560;`;
const StockLine = styled.div<{ $instock: boolean }>`
  font-size: 13px; font-weight: 700;
  color: ${p => p.$instock ? '#2db560' : '#cf2f2f'};
`;
const Description = styled.p`margin: 0; font-size: 14px; color: #556; line-height: 1.65;`;
const HighlightsBox = styled.div`
  background: #f8faff; border: 1px solid var(--border);
  border-radius: 8px; padding: 14px 16px;
`;
const HighlightsTitle = styled.div`font-size: 13px; font-weight: 800; color: #1a2540; margin-bottom: 8px;`;
const HighlightItem = styled.li`font-size: 13px; color: #445; line-height: 1.6; margin-left: 16px;`;
const TagRow = styled.div`display: flex; gap: 7px; flex-wrap: wrap;`;
const Tag = styled.span`
  background: #f0f3fa; color: #445;
  font-size: 12px; font-weight: 600;
  border-radius: 20px; padding: 4px 11px;
  border: 1px solid #dde3f0;
`;
const Divider = styled.div`height: 1px; background: var(--border);`;
const SectionDivider = styled(Divider)`margin: 8px 0;`;
const QtyRow = styled.div`display: flex; align-items: center; gap: 14px;`;
const QtyLabel = styled.div`font-size: 14px; font-weight: 700; color: #445;`;
const QtyControl = styled.div`
  display: flex; align-items: center;
  border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
`;
const QtyBtn = styled.button`
  width: 36px; height: 36px;
  border: 0; background: #f1f5ff;
  font-size: 18px; font-weight: 700;
  cursor: pointer; color: #1a2540;
  &:hover { background: #dde8ff; }
`;
const QtyVal = styled.div`
  width: 44px; text-align: center;
  font-size: 15px; font-weight: 700; color: #1a2540;
`;
const ActionRow = styled.div`display: flex; gap: 10px; align-items: center;`;
const AddToCartBtn = styled.button`
  background: var(--brand-orange); color: #fff;
  border: 0; border-radius: 10px;
  padding: 13px 28px;
  font-size: 15px; font-weight: 800;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: var(--brand-orange-dark); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
const WishBtn = styled.button<{ $active: boolean }>`
  width: 46px; height: 46px;
  border: 1px solid var(--border); border-radius: 10px;
  background: #fff; font-size: 22px;
  cursor: pointer;
  color: ${p => p.$active ? '#e53935' : '#9aa3b8'};
  display: flex; align-items: center; justify-content: center;
  transition: color 0.15s, border-color 0.15s;
  &:hover { color: #e53935; border-color: #e53935; }
`;

/* Reviews */
const ReviewsWrap = styled.section`display: flex; flex-direction: column; gap: 18px;`;
const ReviewsTitle = styled.h2`margin: 0; font-size: 20px; font-weight: 800; color: #1a2540;`;
const ReviewCount = styled.span`font-size: 16px; font-weight: 600; color: #7a849b;`;
const WriteReview = styled.div`
  background: #f8faff; border: 1px solid var(--border);
  border-radius: 10px; padding: 18px;
  display: flex; flex-direction: column; gap: 10px;
`;
const WriteTitle = styled.div`font-size: 15px; font-weight: 800; color: #1a2540;`;
const Stars = styled.div`display: flex; gap: 3px;`;
const Star = styled.span<{ $filled: boolean; $clickable: boolean }>`
  font-size: 22px;
  color: ${p => p.$filled ? '#f5a623' : '#ddd'};
  cursor: ${p => p.$clickable ? 'pointer' : 'default'};
  transition: color 0.12s;
  ${p => p.$clickable && '&:hover { color: #f5a623; }'}
`;
const CommentBox = styled.textarea`
  border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 12px; font-size: 14px;
  resize: vertical; outline: none; font-family: inherit;
  &:focus { border-color: var(--brand-blue); }
`;
const ErrorMsg = styled.div`font-size: 13px; color: #cf2f2f;`;
const SubmitBtn = styled.button`
  align-self: flex-start;
  background: var(--brand-blue); color: #fff;
  border: 0; border-radius: 8px;
  padding: 10px 22px; font-size: 14px; font-weight: 700;
  cursor: pointer;
  &:disabled { opacity: 0.45; cursor: not-allowed; }
  &:hover:not(:disabled) { background: var(--brand-blue-dark); }
`;
const EmptyReviews = styled.div`font-size: 14px; color: #7a849b; padding: 16px 0;`;
const ReviewList = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const ReviewCard = styled.div`
  background: #fff; border: 1px solid var(--border);
  border-radius: 10px; padding: 14px 16px;
`;
const ReviewHeader = styled.div`
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-bottom: 8px;
`;
const ReviewerName = styled.div`font-size: 14px; font-weight: 700; color: #1a2540;`;
const ReviewComment = styled.div`font-size: 14px; color: #445; line-height: 1.6;`;
const DeleteBtn = styled.button`
  margin-left: auto;
  border: 0; background: none;
  color: #cf2f2f; font-size: 13px;
  font-weight: 600; cursor: pointer;
  &:hover { text-decoration: underline; }
`;

import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Wrap>
      <Code>404</Code>
      <Title>Page not found</Title>
      <Sub>The page you're looking for doesn't exist or has been moved.</Sub>
      <HomeLink to="/">← Back to Home</HomeLink>
    </Wrap>
  );
}

const Wrap = styled.div`
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 40px 20px;
`;
const Code = styled.div`font-size: 96px; font-weight: 900; color: #e0e5f0; line-height: 1;`;
const Title = styled.h1`margin: 0; font-size: 24px; font-weight: 800; color: #1a2540;`;
const Sub = styled.p`margin: 0; font-size: 14px; color: #7a849b; max-width: 360px;`;
const HomeLink = styled(RouterLink)`
  margin-top: 8px;
  background: var(--brand-blue);
  color: #fff;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 700;
  &:hover { opacity: 0.88; }
`;

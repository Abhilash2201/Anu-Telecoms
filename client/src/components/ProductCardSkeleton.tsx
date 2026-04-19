import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

const Bone = styled.div`
  background: linear-gradient(90deg, #ececec 25%, #e0e0e0 50%, #ececec 75%);
  background-size: 1200px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 4px;
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
`;

const ImageBone = styled(Bone)`
  aspect-ratio: 4 / 3;
  border-radius: 0;
`;

const Body = styled.div`
  padding: 10px 12px 6px;
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const BtnBone = styled(Bone)`
  margin: 8px 10px 10px;
  height: 34px;
  border-radius: 6px;
`;

export default function ProductCardSkeleton() {
  return (
    <Card>
      <ImageBone />
      <Body>
        <Bone style={{ height: 11, width: '88%' }} />
        <Bone style={{ height: 11, width: '55%' }} />
        <Bone style={{ height: 15, width: '42%', marginTop: 3 }} />
      </Body>
      <BtnBone />
    </Card>
  );
}

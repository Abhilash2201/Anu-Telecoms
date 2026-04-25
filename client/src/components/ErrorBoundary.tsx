import { Component, ReactNode } from 'react';
import styled from 'styled-components';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Wrap>
          <Code>500</Code>
          <Title>Something went wrong</Title>
          <Sub>An unexpected error occurred. Please refresh the page.</Sub>
          <Btn onClick={() => window.location.reload()}>Refresh</Btn>
        </Wrap>
      );
    }
    return this.props.children;
  }
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
const Code = styled.div`font-size: 72px; font-weight: 900; color: #e0e5f0; line-height: 1;`;
const Title = styled.h1`margin: 0; font-size: 22px; font-weight: 800; color: #1a2540;`;
const Sub = styled.p`margin: 0; font-size: 14px; color: #7a849b;`;
const Btn = styled.button`
  margin-top: 8px;
  background: var(--brand-blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  &:hover { opacity: 0.88; }
`;

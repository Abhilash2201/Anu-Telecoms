import styled from 'styled-components';

export default function Footer() {
  return (
    <Root>
      <Container>
        <Columns>
          <Col>
            <Title>Anu Telecom</Title>
            <Line>+46, MG Road, Nagamangala, Karnataka, 571422</Line>
            <Line>+91 98451 23456</Line>
            <Line>info@anutelecom.com</Line>
          </Col>
          <Col>
            <ColTitle>Quick Links</ColTitle>
            <LinkItem href="#">About Us</LinkItem>
            <LinkItem href="#">Contact Us</LinkItem>
            <LinkItem href="#">Privacy Policy</LinkItem>
            <LinkItem href="#">Refund Policy</LinkItem>
          </Col>
          <Col>
            <ColTitle>Customer Service</ColTitle>
            <LinkItem href="#">FAQ</LinkItem>
            <LinkItem href="#">Track Order</LinkItem>
            <LinkItem href="#">Shipping Info</LinkItem>
            <LinkItem href="#">Offers & Deals</LinkItem>
          </Col>
          <Col>
            <ColTitle>Contact Us</ColTitle>
            <Line>Customer Support, Mon-Sat 8:00 AM - 9:00 PM</Line>
            <Highlight>+91 98451 23456</Highlight>
            <Line>info@anutelecom.com</Line>
          </Col>
        </Columns>
      </Container>
      <BottomBar>© 2024 Anu Telecom Nagamangala. All Rights Reserved.</BottomBar>
    </Root>
  );
}

const Root = styled.footer`
  margin-top: 48px;
  background: linear-gradient(180deg, #f7f9ff, #e9efff);
  border-top: 1px solid var(--border);
`;

const Container = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 34px 20px;
`;

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Col = styled.div`
  display: grid;
  gap: 8px;
`;

const Title = styled.h3`
  margin: 0 0 6px;
  font-size: 34px;
  font-weight: 900;
  color: #123f9c;
`;

const ColTitle = styled.h4`
  margin: 0 0 6px;
  font-size: 24px;
`;

const Line = styled.div`
  color: #56607a;
  line-height: 1.5;
`;

const LinkItem = styled.a`
  color: #2a365a;
`;

const Highlight = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #123f9c;
`;

const BottomBar = styled.div`
  text-align: center;
  background: #13255a;
  color: #fff;
  padding: 14px 12px;
  font-size: 14px;
`;

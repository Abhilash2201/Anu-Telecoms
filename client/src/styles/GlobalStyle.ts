import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --brand-blue: #1748c6;
    --brand-blue-dark: #0e2f8e;
    --brand-orange: #ff7a00;
    --brand-orange-dark: #e96800;
    --ink: #1c2742;
    --muted: #66708a;
    --surface: #ffffff;
    --bg: #f1f4fb;
    --border: #dde3f2;
    --radius: 14px;
    --shadow: 0 10px 24px rgba(15, 44, 109, 0.08);
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: "Poppins", "Segoe UI", sans-serif;
    color: var(--ink);
    background: var(--bg);
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button, input {
    font: inherit;
  }
`;

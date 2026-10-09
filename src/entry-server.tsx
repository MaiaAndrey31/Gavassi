import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

/** Pré-render no build: o HTML já chega com o conteúdo (SEO + LCP). */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

import './styles/global.css'; // primeiro: as folhas das seções precisam vir depois na cascata
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// HTML pré-renderizado no build (SEO + LCP) → hidrata; em dev → renderiza.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);

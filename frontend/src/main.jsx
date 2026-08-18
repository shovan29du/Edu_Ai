import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ChildProvider } from './contexts/ChildContext.jsx';
import './index.css';

// SVG colour-blind simulation filters (hidden, referenced by CSS filter: url(#id))
const ColourBlindFilters = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
    <defs>
      {/* Deuteranopia (green cone deficiency, red-green) */}
      <filter id="deuteranopia">
        <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
      </filter>
      {/* Protanopia (red cone deficiency) */}
      <filter id="protanopia">
        <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
      </filter>
      {/* Tritanopia (blue cone deficiency) */}
      <filter id="tritanopia">
        <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
      </filter>
    </defs>
  </svg>
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChildProvider>
      <ColourBlindFilters />
      <App />
    </ChildProvider>
  </React.StrictMode>
);

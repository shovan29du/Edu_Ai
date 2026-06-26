import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ChildProvider } from './contexts/ChildContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChildProvider>
      <App />
    </ChildProvider>
  </React.StrictMode>
);

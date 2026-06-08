import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

/* Global error logging */
window.onerror = (msg, source, line, col, err) => {
  console.error('[GameSpace] Global error:', msg, source, line, col, err);
};
window.onunhandledrejection = (e) => {
  console.error('[GameSpace] Unhandled rejection:', e.reason);
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

console.log('[GameSpace] App mounted successfully');

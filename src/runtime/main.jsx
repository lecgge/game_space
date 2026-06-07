import React from 'react';
import ReactDOMClient from 'react-dom/client';
import App from '../pages/App';

// Inject Electron API before rendering
const electronApi = window.electronAPI;

export const Root = {
  renderToRoot({ api }) {
    // Override Electron API with passed-in instance
    if (api) {
      Object.assign(window.electronAPI, api);
    }
    
    const container = document.getElementById('root');
    if (!container) throw new Error('Failed to find the root element');

    // Create a new app instance with access to the Electron API
    function AppWithApi() {
      return <App electronAPI={api} />;
    }

    const root = ReactDOMClient.createRoot(container);
    root.render(<React.StrictMode><AppWithApi /></React.StrictMode>);
    return root;
  },
};
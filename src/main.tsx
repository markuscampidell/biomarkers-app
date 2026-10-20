import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { AppStoreProvider } from './state/AppStore';
import { localStorageAdapter } from './storage/localStorageAdapter';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStoreProvider storage={localStorageAdapter}>
      <App />
    </AppStoreProvider>
  </StrictMode>,
);

// Installable app: register the service worker (production builds only, so dev hot-reload isn't cached).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.error('Service worker failed', err));
  });
}

// Ask the browser to keep this site's data (localStorage) instead of clearing it under storage pressure.
navigator.storage?.persist?.().catch(() => {});

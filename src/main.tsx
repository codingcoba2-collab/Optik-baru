import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Auto-recovery for chunk loading errors when developer updates the app
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    const isChunkError = /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(e.message || '');
    if (isChunkError) {
      const lastReload = sessionStorage.getItem('chunk_reload_ts');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('chunk_reload_ts', String(now));
        if (typeof caches !== 'undefined') {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
            window.location.reload();
          }).catch(() => {
            window.location.reload();
          });
        } else {
          (window as any).location.reload();
        }
      }
    }
  });
}

// Register Service Worker for PWA with auto-update monitoring
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Check for updates periodically every 2 minutes
      setInterval(() => {
        registration.update().catch(() => {});
      }, 120 * 1000);
    }).catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


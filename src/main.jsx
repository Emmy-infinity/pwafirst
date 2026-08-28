import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

// 🌟 PWA SERVICE WORKER - ISOLATED TO PREVENT CRASHES
let updateSW = null;

if ('serviceWorker' in navigator) {
  try {
    // Dynamic import to prevent build-time crashes if the virtual module is missing
    import('virtual:pwa-register').then(({ registerSW }) => {
      updateSW = registerSW({
        onNeedRefresh() {
          console.log('📡 New update streamed. Refreshing...');
          // Auto-reload to kill the old cache
          window.location.reload();
        },
        onOfflineReady() {
          console.log('🎉 Northern Market ready offline.');
        },
      });
    }).catch((err) => {
      console.warn('⚠️ PWA virtual module failed to load (build issue):', err);
    });
  } catch (err) {
    console.warn('⚠️ Service Worker registration skipped:', err);
  }
}

// 🔥 CRITICAL LOG: If you don't see this in the console, the build is broken.
console.log('🚀 Northern Market booting up...');

const root = document.getElementById('root');

if (!root) {
  console.error('❌ FATAL: #root element missing from index.html!');
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

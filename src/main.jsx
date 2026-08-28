import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

// 🔥 CRITICAL: PWA Service Worker – isolated to prevent crashes
let updateSW = null;

if ('serviceWorker' in navigator) {
  try {
    // Dynamic import prevents build failures if virtual module is missing
    import('virtual:pwa-register').then(({ registerSW }) => {
      updateSW = registerSW({
        onNeedRefresh() {
          console.log('📡 New update streamed. Reloading...');
          // 🔥 Force reload to kill old cache and load fresh assets
          window.location.reload();
        },
        onOfflineReady() {
          console.log('🎉 Northern Market ready offline.');
        },
      });
    }).catch((err) => {
      console.warn('⚠️ PWA virtual module failed to load:', err);
    });
  } catch (err) {
    console.warn('⚠️ Service Worker registration skipped:', err);
  }
}

// 🔥 Log to confirm main.jsx executed
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
    </React.StrictMode>
  );
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { registerSW } from 'virtual:pwa-register';

console.log('🚀 Northern Market booting up...');

// PWA Service Worker with auto-reload on update
if ('serviceWorker' in navigator) {
  try {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('📡 New update available. Reloading...');
        window.location.reload();
      },
      onOfflineReady() {
        console.log('🎉 Northern Market ready offline.');
      },
    });
  } catch (err) {
    console.warn('⚠️ Service Worker registration skipped:', err);
  }
}

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

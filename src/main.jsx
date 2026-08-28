import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 🛡️ THE ERROR BOUNDARY SHIELD (stops blank screens)
import ErrorBoundary from './ErrorBoundary.jsx'

// 🌟 THE PWA SERVICE WORKER REGISTRATION INTERCEPTOR
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  // Registers background service workers to handle network caching asset matrices
  const updateSW = registerSW({
    onNeedRefresh() {
      console.log('📡 New application update streamed from the web. Refreshing view context...');
      // 🔥 AUTO-RELOAD FIX: Instead of just logging, we refresh the page
      // to kill the old cache and load the new Northern Market update.
      // This is what was causing your blank screen!
      if (confirm('🔄 New update available! Click OK to reload Northern Market.')) {
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.log('🎉 Application fully operational and locked down ready for offline use.');
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🚀 THE MAGIC WRAP: If App crashes, ErrorBoundary shows a reboot button instead of a white void */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

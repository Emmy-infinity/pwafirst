import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 🌟 THE PWA SERVICE WORKER REGISTRATION INTERCEPTOR
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  // Registers background service workers to handle network caching asset matrices
  registerSW({
    onNeedRefresh() {
      console.log('📡 New application update streamed from the web. Refreshing view context...');
    },
    onOfflineReady() {
      console.log('🎉 Application fully operational and locked down ready for offline use.');
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

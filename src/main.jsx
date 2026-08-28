import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

// 🧹 PWA DISABLED – all service worker code removed for debugging

console.log('🚀 Northern Market booting up... (PWA DISABLED)');

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

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  console.log('✅ MINIMAL APP RENDERING');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
            <h1 style={{ color: '#2e7d32' }}>✅ NORTHERN MARKET IS ALIVE</h1>
            <p>If you see this, the app works.</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

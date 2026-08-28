import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 Northern Market crashed:', error, errorInfo);
    // You can send this to a logging service if you want
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          background: '#fbfbfb',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ color: '#2e7d32', fontSize: 'clamp(24px, 5vw, 48px)' }}>
            🛠️ Northern Market is rebooting
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', maxWidth: '500px', color: '#555' }}>
            Our systems are recalibrating. Please refresh the page or clear your browser cache.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '14px 40px',
              background: '#2e7d32',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(46,125,50,0.3)'
            }}
          >
            🔄 Refresh Northern Market
          </button>
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>
            {this.state.error?.message || 'Unknown hiccup detected'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

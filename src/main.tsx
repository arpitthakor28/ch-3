import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './theme/tokens.css';
import './theme/modules.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('VLS Uncaught Exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              background: '#FFFFFF',
            }}
          >
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', color: '#1E293B' }}>
              Virtual Lab Simulator
            </h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.92rem', color: '#64748B', lineHeight: 1.5 }}>
              The application encountered a reload event. Click below to refresh and load the simulations.
            </p>
            <button
              onClick={() => {
                window.location.hash = '';
                window.location.reload();
              }}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              Reload Simulator
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}


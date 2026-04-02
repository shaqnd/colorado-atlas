import { Component, StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

type ErrorBoundaryState = {
  error: Error | null;
  componentStack: string | null;
};

class RootErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, componentStack: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, componentStack: null };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error('Root render failed:', error, info);
    this.setState({ componentStack: info.componentStack ?? null });
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f5f5f7',
          color: '#1d1d1f',
          padding: '32px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            padding: 24,
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>Colorado Atlas hit an error</div>
          <div style={{ fontSize: 15, color: '#6e6e73', marginBottom: 18 }}>
            The app failed while rendering. The error details are shown below so we can fix it quickly.
          </div>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: '#111827',
              color: '#f9fafb',
              borderRadius: 12,
              padding: 16,
              fontSize: 13,
              lineHeight: 1.5,
              overflowX: 'auto',
            }}
          >
            {[
              String(this.state.error),
              this.state.error.message,
              this.state.error.stack,
              this.state.componentStack,
            ].filter(Boolean).join('\n\n')}
          </pre>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>
);

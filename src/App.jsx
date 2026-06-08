import React, { Component, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import GameLibrary from './pages/GameLibrary';
import ImportPage from './pages/ImportPage';
import SettingsPage from './pages/SettingsPage';

/* ── Error Boundary ─────────────────────────────────────────── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('[GameSpace] Render error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          height: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#07080f', color: '#e8eaf0', fontFamily: 'Inter, system-ui, sans-serif',
          padding: 32, textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 22, marginBottom: 12, color: '#f87171' }}>渲染错误</h2>
          <p style={{ fontSize: 14, color: '#8b90b0', marginBottom: 20 }}>
            应用遇到了一个错误，请检查开发者工具控制台获取详细信息。
          </p>
          <pre style={{
            background: '#12152a', padding: 16, borderRadius: 8,
            fontSize: 12, color: '#f87171', maxWidth: 600,
            overflow: 'auto', whiteSpace: 'pre-wrap', textAlign: 'left',
          }}>
            {this.state.error.message}
          </pre>
          <button onClick={() => this.setState({ error: null })}
            style={{
              marginTop: 20, padding: '10px 24px', background: '#7c3aed',
              color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
            }}>
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── App ─────────────────────────────────────────────────────── */
function AppContent() {
  const { initialize, isLoading, settings } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Apply theme to root element
  useEffect(() => {
    const theme = settings?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings?.theme]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-deep">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-text-secondary">正在加载 Game Space...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={<GameLibrary />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

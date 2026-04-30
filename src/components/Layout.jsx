import { Outlet, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useStore } from '../hooks/useStore';
import { Bot } from 'lucide-react';

export default function Layout() {
  const { loading } = useStore();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="app-layout">
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '48px 24px',
        }}>
          <div style={{
            fontSize: '40px',
            fontWeight: 800,
            color: 'var(--color-primary)',
            letterSpacing: '-0.03em',
          }}>
            ⚡ LagerPro
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
          }}>
            Daten werden geladen...
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Outlet />
      <BottomNav />
      {/* KI-Assistent FAB */}
      <button
        onClick={() => navigate('/assistent')}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--color-accent)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
          zIndex: 100,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        title="KI-Assistent"
        aria-label="KI-Assistent"
      >
        <Bot size={28} />
      </button>
    </div>
  );
}


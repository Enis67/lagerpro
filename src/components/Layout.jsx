import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useStore } from '../hooks/useStore';

export default function Layout() {
  const { loading } = useStore();

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
    </div>
  );
}

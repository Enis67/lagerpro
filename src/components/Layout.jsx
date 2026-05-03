import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import BottomNav from './BottomNav';
import PWAInstallPrompt from './PWAInstallPrompt';
import Toast from './Toast';
import { useStore } from '../hooks/useStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Bot, X, Keyboard, Hash, Zap, Package, HardHat, Search, HelpCircle, WifiOff } from 'lucide-react';

export default function Layout() {
  const { loading, isOnline, toast, clearToast } = useStore();
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const handleShowHelp = useCallback(() => setShowHelp(true), []);
  const handleCloseHelp = useCallback(() => setShowHelp(false), []);

  useKeyboardShortcuts({ onShowHelp: handleShowHelp });

  // Dark Mode Initialisierung
  useEffect(() => {
    const saved = localStorage.getItem('lagerpro-theme');
    if (saved === 'dark') {
      document.body.classList.add('dark');
    } else if (saved === 'light') {
      document.body.classList.remove('dark');
    }
  }, []);

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

      {/* Offline-Indikator */}
      {!isOnline && (
        <div
          style={{
            position: 'fixed',
            top: '12px',
            right: '12px',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-danger)',
            color: 'white',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          role="status"
          aria-label="Offline-Modus aktiv"
        >
          <WifiOff size={14} />
          Offline
        </div>
      )}

      {/* Globaler Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 12, left: 12, right: 12, zIndex: 160, display: 'flex', justifyContent: 'center' }}>
          <Toast message={toast.message} type={toast.type} onClose={clearToast} />
        </div>
      )}

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
      <PWAInstallPrompt />

      {/* Keyboard-Shortcuts Hilfe-Modal */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-lg)',
          }}
          onClick={handleCloseHelp}
          role="dialog"
          aria-modal="true"
          aria-label="Tastaturkürzel"
        >
          <div
            style={{
              background: 'var(--color-card)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: 400,
              maxHeight: '80vh',
              overflow: 'auto',
              padding: 'var(--space-xl)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-lg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <Keyboard size={22} style={{ color: 'var(--color-primary)' }} />
                <h2 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
                  Tastaturkürzel
                </h2>
              </div>
              <button
                onClick={handleCloseHelp}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  padding: 'var(--space-xs)',
                  borderRadius: 'var(--radius-md)',
                }}
                aria-label="Schließen"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {[
                { keys: 'Ctrl + 1', icon: Hash, label: 'Dashboard', desc: 'Zur Startseite' },
                { keys: 'Ctrl + 2', icon: Zap, label: 'Schnell buchen', desc: 'Neue Buchung' },
                { keys: 'Ctrl + 3', icon: Package, label: 'Materialien', desc: 'Material-Liste' },
                { keys: 'Ctrl + 4', icon: HardHat, label: 'Baustellen', desc: 'Projekt-Liste' },
                { keys: 'Ctrl + K', icon: Search, label: 'Suche fokussieren', desc: 'Suchfeld aktivieren' },
                { keys: 'Ctrl + ?', icon: HelpCircle, label: 'Hilfe anzeigen', desc: 'Dieses Fenster' },
              ].map(item => (
                <div
                  key={item.keys}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-50)',
                  }}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <item.icon size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{item.label}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      {item.desc}
                    </div>
                  </div>
                  <kbd style={{
                    fontFamily: 'monospace',
                    fontSize: 'var(--font-size-xs)',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 8px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {item.keys}
                  </kbd>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 'var(--space-lg)',
              paddingTop: 'var(--space-md)',
              borderTop: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              textAlign: 'center',
            }}>
              Shortcuts sind deaktiviert, wenn ein Textfeld fokussiert ist.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


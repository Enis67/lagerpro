import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Truck, ShoppingCart, ArrowDownUp, RotateCcw, ChevronRight, BarChart3, Download, LogOut, ScanBarcode, Users, Wrench } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../services/supabase';
import { exportMaterialsCSV } from '../services/csvExport';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function Settings() {
  const navigate = useNavigate();
  const { categories, suppliers, materials, resetData, isCloud, syncing, error, clearError } = useStore();
  const { userName, isAdmin, isAuthenticated } = useAuth();
  const [showReset, setShowReset] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [toast, setToast] = useState(null);

  async function handleReset() {
    try {
      await resetData();
      setShowReset(false);
      setToast({ message: 'Alle Daten zurückgesetzt!', type: 'info' });
    } catch (err) {
      setToast({ message: 'Fehler: ' + err.message, type: 'error' });
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      setShowLogout(false);
      window.location.href = '/login';
    } catch (err) {
      setToast({ message: 'Logout fehlgeschlagen: ' + err.message, type: 'error' });
    }
  }

  function handleExportMaterials() {
    try {
      exportMaterialsCSV(materials, categories, suppliers);
      setToast({ message: 'Materialbestand als CSV exportiert ✓', type: 'success' });
    } catch (err) {
      setToast({ message: 'Export fehlgeschlagen: ' + err.message, type: 'error' });
    }
  }

  const menuItems = [
    {
      icon: Wrench,
      label: 'Werkzeuge & Equipment',
      sub: 'Alle Werkzeuge im Überblick',
      onClick: () => navigate('/werkzeuge'),
    },
    {
      icon: ScanBarcode,
      label: 'Inventur (Bulk-Scan)',
      sub: 'Mehrfach-Scan mit Bestandsabgleich',
      onClick: () => navigate('/inventur'),
    },
    {
      icon: ShoppingCart,
      label: 'Nachbestellliste',
      sub: 'Artikel unter Mindestbestand',
      onClick: () => navigate('/nachbestellen'),
    },
    {
      icon: ArrowDownUp,
      label: 'Lagerbewegungen',
      sub: 'Alle Buchungen ansehen',
      onClick: () => navigate('/bewegungen'),
    },
    {
      icon: BarChart3,
      label: 'Statistiken',
      sub: 'Lagerwert, Trends, Top-Verbraucher',
      onClick: () => navigate('/statistiken'),
    },
    {
      icon: Download,
      label: 'Materialbestand exportieren',
      sub: `${materials.length} Artikel als CSV`,
      onClick: handleExportMaterials,
    },
    {
      icon: Tag,
      label: 'Kategorien',
      sub: `${categories.length} Kategorien verwalten`,
      onClick: () => navigate('/kategorien'),
    },
    {
      icon: Truck,
      label: 'Lieferanten',
      sub: `${suppliers.length} Lieferanten verwalten`,
      onClick: () => navigate('/lieferanten'),
    },
  ];

  return (
    <>
      <header className="page-header">
        <h1>Mehr</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Logo / Branding + User */}
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-2xl)',
          marginBottom: 'var(--space-xl)',
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 800,
            color: 'var(--color-primary)',
            letterSpacing: '-0.03em',
          }}>
            ⚡ LagerPro
          </div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-xs)',
          }}>
            Materialverwaltung für Elektrobetriebe
          </div>

          {/* User-Info */}
          {isAuthenticated && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-sm)',
              marginTop: 'var(--space-md)',
              padding: 'var(--space-sm) var(--space-md)',
              background: 'var(--color-primary-50)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-primary)',
              fontWeight: 600,
            }}>
              <Users size={14} />
              {userName}
              {isAdmin && <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7 }}>(Admin)</span>}
            </div>
          )}

          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-tertiary)',
            marginTop: 'var(--space-xs)',
          }}>
            Version 2.6 {isCloud ? '☁️ Cloud' : '💾 Offline'}
          </div>
          {isCloud && (
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: syncing ? 'var(--color-accent)' : 'var(--color-success)',
              marginTop: 'var(--space-xs)',
            }}>
              {syncing ? '🔄 Synchronisiere...' : '✓ Mit Supabase verbunden'}
            </div>
          )}
          {error && (
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-danger)',
              marginTop: 'var(--space-xs)',
              cursor: 'pointer',
            }} onClick={clearError}>
              ⚠️ {error} (Tippen zum Schließen)
            </div>
          )}
        </div>

        {/* Menü */}
        <div className="list">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                className="card card-clickable"
                onClick={item.onClick}
                disabled={item.disabled}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  opacity: item.disabled ? 0.5 : 1,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary-50)', color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-sm text-secondary">{item.sub}</div>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-text-tertiary)' }} />
              </button>
            );
          })}
        </div>

        {/* Roadmap */}
        <div className="section" style={{ marginTop: 'var(--space-3xl)' }}>
          <h3 className="detail-section-title">Roadmap</h3>
          <div className="card" style={{ background: 'var(--color-primary-50)' }}>
            <ul style={{
              listStyle: 'none',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
            }}>
              <li>✅ Cloud-Sync mit Supabase</li>
              <li>✅ PWA Installation</li>
              <li>✅ Barcode-Scanner + EAN</li>
              <li>✅ PDF/CSV-Export</li>
              <li>✅ Statistik-Dashboard</li>
              <li>✅ Smart-ID Automatisierung</li>
              <li>✅ Kategorie- & Lieferanten-Verwaltung</li>
              <li>✅ KI-Sprachbuchung</li>
              <li>✅ Quick-Repeat Buchung</li>
              <li>✅ Multi-User Login & Rollen</li>
              <li>✅ Bulk-Scan Inventur</li>
            </ul>
          </div>
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <div style={{ marginTop: 'var(--space-2xl)' }}>
            <button
              className="btn btn-outline btn-full"
              style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              onClick={() => setShowLogout(true)}
            >
              <LogOut size={16} /> Abmelden
            </button>
          </div>
        )}

        {/* Reset */}
        <div style={{ marginTop: 'var(--space-xl)', paddingBottom: 'var(--space-2xl)' }}>
          <button
            className="btn btn-outline btn-full"
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            onClick={() => setShowReset(true)}
          >
            <RotateCcw size={16} /> Alle Daten zurücksetzen
          </button>
          <div className="text-xs text-tertiary text-center mt-sm">
            Setzt alle Daten auf den Ausgangszustand mit Seed-Daten zurück.
          </div>
        </div>

        {showReset && (
          <ConfirmDialog
            title="Daten zurücksetzen?"
            message="Alle Materialien, Baustellen und Buchungen werden gelöscht und durch Beispieldaten ersetzt."
            confirmText="Zurücksetzen"
            danger
            onCancel={() => setShowReset(false)}
            onConfirm={handleReset}
          />
        )}

        {showLogout && (
          <ConfirmDialog
            title="Abmelden?"
            message="Möchtest du dich wirklich abmelden?"
            confirmText="Abmelden"
            danger
            onCancel={() => setShowLogout(false)}
            onConfirm={handleLogout}
          />
        )}
      </div>
    </>
  );
}

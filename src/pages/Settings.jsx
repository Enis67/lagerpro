import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Truck, ShoppingCart, ArrowDownUp, RotateCcw, ChevronRight, BarChart3, Download, LogOut, ScanBarcode, Users, Wrench, Keyboard, Hash, Zap, Package, HardHat, Search, HelpCircle, Bell, FileText, FileSpreadsheet } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../services/supabase';
import { exportMaterialsCSV } from '../services/csvExport';
import {
  requestNotificationPermission,
  getNotificationsEnabled,
  setNotificationsEnabled,
  getPermissionStatus,
} from '../services/notifications.js';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function Settings() {
  const navigate = useNavigate();
  const { categories, suppliers, materials, resetData, isCloud, syncing, error, clearError } = useStore();
  const { userName, isAdmin, isAuthenticated } = useAuth();
  const [showReset, setShowReset] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifEnabled, setNotifEnabled] = useState(getNotificationsEnabled());
  const [notifStatus, setNotifStatus] = useState(getPermissionStatus());

  async function handleToggleNotifications(enabled) {
    setNotifEnabled(enabled);
    setNotificationsEnabled(enabled);

    if (enabled) {
      const permission = await requestNotificationPermission();
      setNotifStatus(getPermissionStatus());

      if (permission !== 'granted') {
        setToast({
          message: permission === 'denied'
            ? 'Benachrichtigungen vom Browser blockiert. Bitte in den Browser-Einstellungen erlauben.'
            : 'Benachrichtigungen nicht erlaubt.',
          type: 'warning',
        });
        setNotifEnabled(false);
        setNotificationsEnabled(false);
        return;
      }

      setToast({ message: 'Push-Benachrichtigungen aktiviert ✓', type: 'success' });
    } else {
      setToast({ message: 'Push-Benachrichtigungen deaktiviert', type: 'info' });
    }
  }

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
      icon: FileText,
      label: 'Tagesrapport',
      sub: 'Entnahmen nach Baustelle und Material',
      onClick: () => navigate('/tagesrapport'),
    },
    {
      icon: Download,
      label: 'Materialbestand exportieren',
      sub: `${materials.length} Artikel als CSV`,
      onClick: handleExportMaterials,
    },
    {
      icon: FileSpreadsheet,
      label: 'Materialien importieren (CSV)',
      sub: 'Bulk-Import per CSV-Datei',
      onClick: () => navigate('/csv-import'),
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

        {/* Push-Benachrichtigungen Toggle */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md) var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: notifEnabled ? 'var(--color-primary-50)' : 'var(--color-surface)',
                color: notifEnabled ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Bell size={18} />
              </div>
              <div>
                <div className="font-semibold">Push-Benachrichtigungen</div>
                <div className="text-sm text-secondary">{notifStatus}</div>
              </div>
            </div>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: 48, height: 28,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={notifEnabled}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: notifEnabled ? 'var(--color-primary)' : 'var(--color-border)',
                borderRadius: 28,
                transition: 'background-color 0.2s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: 22, width: 22,
                  left: notifEnabled ? 24 : 3,
                  bottom: 3,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </span>
            </label>
          </div>
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

        {/* Keyboard Shortcuts */}
        <div className="section" style={{ marginTop: 'var(--space-2xl)' }}>
          <h3 className="detail-section-title">Tastaturkürzel</h3>
          <div className="card" style={{ background: 'var(--color-primary-50)' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              {[
                { keys: 'Ctrl + 1', icon: Hash, label: 'Dashboard' },
                { keys: 'Ctrl + 2', icon: Zap, label: 'Schnell buchen' },
                { keys: 'Ctrl + 3', icon: Package, label: 'Materialien' },
                { keys: 'Ctrl + 4', icon: HardHat, label: 'Baustellen' },
                { keys: 'Ctrl + K', icon: Search, label: 'Suche fokussieren' },
                { keys: 'Ctrl + ?', icon: HelpCircle, label: 'Hilfe anzeigen' },
              ].map(item => (
                <div
                  key={item.keys}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <item.icon size={14} />
                  </div>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <kbd style={{
                    fontFamily: 'monospace',
                    fontSize: 'var(--font-size-xs)',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 6px',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.keys}
                  </kbd>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 'var(--space-md)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-tertiary)',
              fontStyle: 'italic',
            }}>
              Nur aktiv, wenn kein Textfeld fokussiert ist.
            </div>
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

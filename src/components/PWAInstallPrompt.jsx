import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

/**
 * PWAInstallPrompt – Zeigt "App installieren" Banner an
 * Nutzt den beforeinstallprompt Event des Browsers.
 */
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Prüfe ob App bereits installiert (display-mode: standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Prüfe ob User schon dismissed hat
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const days = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (days < 7) return; // Nach 7 Tagen wieder anzeigen
    }

    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Auch appinstalled Event
    window.addEventListener('appinstalled', () => {
      setShow(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }

  if (!show || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 'var(--space-md)',
      right: 'var(--space-md)',
      zIndex: 1000,
      background: 'var(--color-primary)',
      color: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-md) var(--space-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-md)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      animation: 'slideUp 0.3s ease',
    }}>
      <Download size={22} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>LagerPro installieren</div>
        <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
          Schneller Zugriff vom Home-Screen
        </div>
      </div>
      <button
        onClick={handleInstall}
        style={{
          background: 'white',
          color: 'var(--color-primary)',
          border: 'none',
          padding: '6px 14px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          fontSize: 'var(--font-size-xs)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Installieren
      </button>
      <button
        onClick={handleDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          opacity: 0.6,
          cursor: 'pointer',
          padding: 4,
          flexShrink: 0,
        }}
        aria-label="Schließen"
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Barcode-Scanner Komponente ───────────────────────────
// Nutzt html5-qrcode für robuste Barcode/QR-Erkennung via Kamera

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Zap } from 'lucide-react';

/**
 * BarcodeScanner – Overlay mit Kamera-Preview und Barcode-Erkennung.
 * 
 * @param {function} onScan - Callback mit dem gescannten Code
 * @param {function} onClose - Callback zum Schließen
 * @param {Array} materials - Array von Material-Objekten zum Matching
 */
export default function BarcodeScanner({ onScan, onClose, materials = [] }) {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [matchedMaterial, setMatchedMaterial] = useState(null);

  useEffect(() => {
    let html5QrCode = null;

    async function startScanner() {
      try {
        html5QrCode = new Html5Qrcode('barcode-reader');
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' }, // Rückkamera
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleScan(decodedText);
          },
          () => {
            // QR-Code nicht erkannt – ignorieren
          }
        );
        setScanning(true);
      } catch (err) {
        console.error('[Scanner] Fehler:', err);
        if (err.toString().includes('NotAllowedError')) {
          setError('Kamera-Zugriff verweigert. Bitte in den Browser-Einstellungen erlauben.');
        } else if (err.toString().includes('NotFoundError')) {
          setError('Keine Kamera gefunden.');
        } else {
          setError('Kamera konnte nicht gestartet werden: ' + (err.message || err));
        }
      }
    }

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear().catch(() => {});
      }
    };
  }, []);

  function handleScan(code) {
    if (code === lastScanned) return; // Doppel-Scan vermeiden
    setLastScanned(code);

    // Vibration-Feedback
    if (navigator.vibrate) navigator.vibrate(100);

    // Material matchen: ean_code, article_number, manufacturer_number
    const codeLower = code.toLowerCase().trim();
    const match = materials.find(m =>
      (m.ean_code && m.ean_code.toLowerCase().trim() === codeLower) ||
      (m.article_number && m.article_number.toLowerCase() === codeLower) ||
      (m.manufacturer_number && m.manufacturer_number.toLowerCase() === codeLower)
    );

    if (match) {
      setMatchedMaterial(match);
      // Scanner stoppen nach Treffer
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    } else {
      setMatchedMaterial(null);
      setError(`Code "${code}" – kein Material gefunden. Bitte manuell suchen.`);
      setTimeout(() => {
        setError(null);
        setLastScanned(null);
      }, 3000);
    }
  }

  function handleConfirm() {
    if (matchedMaterial) {
      onScan(matchedMaterial);
    }
  }

  return (
    <div className="scanner-overlay">
      <div className="scanner-container">
        {/* Header */}
        <div className="scanner-header">
          <div className="scanner-header-title">
            <Camera size={20} />
            <span>Barcode scannen</span>
          </div>
          <button className="scanner-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Kamera-Preview */}
        <div className="scanner-preview">
          <div id="barcode-reader" style={{ width: '100%' }} />
          {scanning && !matchedMaterial && !error && (
            <div className="scanner-hint">
              <Zap size={14} />
              Barcode in den Rahmen halten
            </div>
          )}
        </div>

        {/* Fehler */}
        {error && !matchedMaterial && (
          <div className="scanner-error">
            {error}
          </div>
        )}

        {/* Match gefunden */}
        {matchedMaterial && (
          <div className="scanner-match">
            <div className="scanner-match-icon">✓</div>
            <div className="scanner-match-info">
              <div className="scanner-match-name">{matchedMaterial.name}</div>
              <div className="scanner-match-details">
                {matchedMaterial.article_number} · Bestand: {matchedMaterial.current_stock - matchedMaterial.reserved_stock}
              </div>
            </div>
            <button className="btn btn-primary btn-lg btn-full" onClick={handleConfirm}>
              Dieses Material wählen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

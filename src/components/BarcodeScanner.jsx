import { useEffect, useRef, useState } from 'react';
import { X, ScanLine, Keyboard, AlertCircle } from 'lucide-react';

const SUPPORTED_FORMATS = [
  'ean_13', 'ean_8', 'code_128', 'code_39', 'code_93',
  'upc_a', 'upc_e', 'itf', 'qr_code', 'data_matrix',
];

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const cancelledRef = useRef(false);

  const [error, setError] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('BarcodeDetector' in window)) {
      setSupported(false);
      setManualMode(true);
      return;
    }

    let cancelled = false;
    cancelledRef.current = false;

    async function start() {
      try {
        detectorRef.current = new window.BarcodeDetector({ formats: SUPPORTED_FORMATS });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        scanLoop();
      } catch (err) {
        console.error('[Scanner] Fehler:', err);
        if (err?.name === 'NotAllowedError') {
          setError('Kamera-Zugriff verweigert. Bitte in den Browser-Einstellungen erlauben.');
        } else if (err?.name === 'NotFoundError') {
          setError('Keine Kamera gefunden.');
        } else {
          setError('Kamera konnte nicht gestartet werden.');
        }
        setManualMode(true);
      }
    }

    start();

    return () => {
      cancelled = true;
      cancelledRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function scanLoop() {
    if (cancelledRef.current) return;
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!video || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    try {
      const codes = await detector.detect(video);
      if (codes.length > 0) {
        const value = codes[0].rawValue;
        if (value) {
          handleResult(value);
          return;
        }
      }
    } catch (err) {
      // detect() kann sporadisch fehlschlagen – einfach weiter
    }

    rafRef.current = requestAnimationFrame(scanLoop);
  }

  function handleResult(code) {
    cancelledRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    onDetected(code);
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    const code = manualCode.trim();
    if (code) handleResult(code);
  }

  return (
    <div className="scanner-overlay" role="dialog" aria-modal="true">
      <div className="scanner-container">
        <button className="scanner-close" onClick={onClose} aria-label="Schließen">
          <X size={24} />
        </button>

        <div className="scanner-title">
          <ScanLine size={20} />
          <span>{manualMode ? 'Code eingeben' : 'Barcode scannen'}</span>
        </div>

        {!manualMode && (
          <>
            <div className="scanner-video-wrap">
              <video ref={videoRef} className="scanner-video" playsInline muted />
              <div className="scanner-frame" />
            </div>
            <div className="scanner-hint">
              Kamera auf den Barcode richten – wird automatisch erkannt.
            </div>
            {supported && (
              <button
                className="btn btn-ghost btn-full"
                onClick={() => setManualMode(true)}
              >
                <Keyboard size={18} /> Manuell eingeben
              </button>
            )}
          </>
        )}

        {manualMode && (
          <form onSubmit={handleManualSubmit}>
            {error && (
              <div className="scanner-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {!supported && !error && (
              <div className="scanner-hint">
                Dein Browser unterstützt keinen Barcode-Scanner. Bitte den Code manuell eingeben.
              </div>
            )}
            <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
              <label className="form-label">Barcode / Artikelnummer</label>
              <input
                type="text"
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                placeholder="z.B. 4011233567890"
                inputMode="numeric"
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={!manualCode.trim()}>
              Übernehmen
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

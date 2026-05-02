import { QRCodeSVG } from 'qrcode.react';
import { useState, useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';

/**
 * QR-Code Generator für Materialien
 * Zeigt einen QR-Code für Scanner (Material-ID + Artikelnummer)
 * mit optionaler Druck-Funktion im Aufkleber-Format
 */
export default function QRCodeGenerator({ material, onClose }) {
  const [labelSize, setLabelSize] = useState('50x30'); // Aufkleber-Formate: 50x30, 40x20, 30x20 mm
  const qrRef = useRef(null);

  if (!material) return null;

  // QR-Code Daten: Material-ID + Artikelnummer (für Scanner)
  const qrData = JSON.stringify({
    id: material.id,
    article_number: material.article_number,
    name: material.name,
  });

  // Alternative: Nur reiner Text für einfache Scanner
  const qrPlainText = `${material.id} | ${material.article_number}`;

  const [usePlainText, setUsePlainText] = useState(true);
  const qrValue = usePlainText ? qrPlainText : qrData;

  // Aufkleber-Größen in mm → px (bei 300 DPI: 1mm ≈ 11.81px)
  const DPI = 11.81;
  const labelSizes = {
    '50x30': { width: Math.round(50 * DPI), height: Math.round(30 * DPI), name: '50 × 30 mm' },
    '40x20': { width: Math.round(40 * DPI), height: Math.round(20 * DPI), name: '40 × 20 mm' },
    '30x20': { width: Math.round(30 * DPI), height: Math.round(20 * DPI), name: '30 × 20 mm' },
  };

  const currentSize = labelSizes[labelSize];

  function handlePrint() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
    const svgUrl = `data:image/svg+xml;base64,${svgBase64}`;

    const isLandscape = currentSize.width > currentSize.height;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR-Code ${material.article_number}</title>
          <style>
            @page {
              size: ${currentSize.width}px ${currentSize.height}px;
              margin: 0;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: ${currentSize.width}px;
              height: ${currentSize.height}px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: system-ui, -apple-system, sans-serif;
              background: white;
              overflow: hidden;
            }
            .label-container {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 4px;
            }
            .qr-image {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-image img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            .label-text {
              font-size: 8px;
              font-weight: 600;
              text-align: center;
              color: #111;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
              padding: 2px 4px;
              line-height: 1.2;
            }
            .label-id {
              font-size: 7px;
              color: #555;
              text-align: center;
              padding: 0 4px 2px;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="qr-image">
              <img src="${svgUrl}" alt="QR-Code" />
            </div>
            <div class="label-text">${material.article_number}</div>
            <div class="label-id">${material.name?.substring(0, 25) || ''}</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  function handleDownload() {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `QR-${material.article_number}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="qr-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="qr-modal-header">
          <h3>QR-Code: {material.name}</h3>
          <button className="qr-close-btn" onClick={onClose} aria-label="Schließen">
            <X size={20} />
          </button>
        </div>

        {/* QR-Code Anzeige */}
        <div className="qr-modal-body">
          <div ref={qrRef} className="qr-code-wrapper">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#111111"
            />
          </div>

          <div className="qr-info">
            <div className="qr-info-row">
              <span className="qr-info-label">Artikelnr.</span>
              <span className="qr-info-value mono">{material.article_number}</span>
            </div>
            <div className="qr-info-row">
              <span className="qr-info-label">Material-ID</span>
              <span className="qr-info-value mono">{material.id}</span>
            </div>
          </div>

          {/* Format-Umschaltung */}
          <div className="qr-format-toggle">
            <label className="qr-toggle-label">
              <input
                type="checkbox"
                checked={usePlainText}
                onChange={(e) => setUsePlainText(e.target.checked)}
              />
              <span>Einfacher Text (für ältere Scanner)</span>
            </label>
          </div>

          {/* Aufkleber-Format Auswahl */}
          <div className="qr-label-sizes">
            <span className="qr-section-label">Aufkleber-Format</span>
            <div className="qr-size-buttons">
              {Object.entries(labelSizes).map(([key, { name }]) => (
                <button
                  key={key}
                  className={`qr-size-btn${labelSize === key ? ' active' : ''}`}
                  onClick={() => setLabelSize(key)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Aktionen */}
        <div className="qr-modal-actions">
          <button className="btn btn-secondary" onClick={handleDownload}>
            <Download size={16} /> Als SVG speichern
          </button>
          <button className="btn btn-accent" onClick={handlePrint}>
            <Printer size={16} /> Aufkleber drucken ({labelSizes[labelSize].name})
          </button>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .qr-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-md);
          animation: qrFadeIn 0.2s ease;
        }
        @keyframes qrFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .qr-modal {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 420px;
          max-height: 90vh;
          overflow-y: auto;
          animation: qrSlideUp 0.25s ease;
        }
        @keyframes qrSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .qr-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg) var(--space-xl);
          border-bottom: 1px solid var(--color-border);
        }
        .qr-modal-header h3 {
          font-size: var(--font-size-md);
          font-weight: 600;
          margin: 0;
          color: var(--color-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: var(--space-sm);
        }
        .qr-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-text-secondary);
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .qr-close-btn:hover {
          background: var(--color-surface-alt);
          color: var(--color-danger);
        }
        .qr-modal-body {
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-lg);
        }
        .qr-code-wrapper {
          padding: var(--space-md);
          background: white;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        .qr-code-wrapper svg {
          display: block;
        }
        .qr-info {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        .qr-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-sm) var(--space-md);
          background: var(--color-surface-alt);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
        }
        .qr-info-label {
          color: var(--color-text-secondary);
          font-weight: 500;
        }
        .qr-info-value {
          color: var(--color-text);
          font-weight: 600;
        }
        .qr-info-value.mono {
          font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
          font-size: var(--font-size-xs);
        }
        .qr-format-toggle {
          width: 100%;
        }
        .qr-toggle-label {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: var(--space-sm) 0;
        }
        .qr-toggle-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--color-accent);
          cursor: pointer;
        }
        .qr-label-sizes {
          width: 100%;
        }
        .qr-section-label {
          display: block;
          font-size: var(--font-size-xs);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-secondary);
          margin-bottom: var(--space-sm);
        }
        .qr-size-buttons {
          display: flex;
          gap: var(--space-sm);
        }
        .qr-size-btn {
          flex: 1;
          padding: var(--space-sm) var(--space-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-surface);
          color: var(--color-text);
          font-size: var(--font-size-sm);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .qr-size-btn:hover {
          border-color: var(--color-accent);
          background: var(--color-accent-bg, rgba(59,130,246,0.08));
        }
        .qr-size-btn.active {
          border-color: var(--color-accent);
          background: var(--color-accent);
          color: white;
        }
        .qr-modal-actions {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-lg) var(--space-xl);
          border-top: 1px solid var(--color-border);
        }
        .qr-modal-actions .btn {
          flex: 1;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

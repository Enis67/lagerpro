import { useState, useRef } from 'react';
import { Camera, X, Image, Trash2 } from 'lucide-react';

/**
 * ImageUploader – Kamera-Upload + Galerie für Artikelbilder.
 * Speichert Bilder als Data-URL (base64) im localStorage.
 * 
 * @param {string} materialId – Material-ID für Speicher-Schlüssel
 * @param {string[]} images – Aktuelle Bilder (Data-URLs)
 * @param {function} onChange – Callback mit neuem images-Array
 */
export default function ImageUploader({ materialId, images = [], onChange }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Bild zu groß (max. 2 MB). Bitte verkleinern.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleConfirm() {
    if (!preview) return;
    const newImages = [...images, preview];
    onChange(newImages);
    setPreview(null);
    // Speichere in localStorage für Persistenz
    try {
      localStorage.setItem(`material-images-${materialId}`, JSON.stringify(newImages));
    } catch (err) {
      console.warn('Bildspeicher voll:', err);
    }
  }

  function handleDelete(index) {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    localStorage.setItem(`material-images-${materialId}`, JSON.stringify(newImages));
  }

  function openCamera() {
    // Mobile: accept="image/*" + capture="environment" öffnet Kamera direkt
    fileInputRef.current?.click();
  }

  return (
    <div>
      {/* Bilder-Galerie */}
      {images.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-sm)',
          marginBottom: 'var(--space-md)',
        }}>
          {images.map((img, idx) => (
            <div key={idx} style={{
              position: 'relative',
              flexShrink: 0,
              width: 100,
              height: 100,
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
            }}>
              <img
                src={img}
                alt={`Artikelbild ${idx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
              <button
                onClick={() => handleDelete(idx)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(239,68,68,0.9)',
                  border: 'none',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Bild löschen"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview nach Aufnahme */}
      {preview && (
        <div style={{
          marginBottom: 'var(--space-md)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '2px solid var(--color-primary)',
        }}>
          <img
            src={preview}
            alt="Vorschau"
            style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            padding: 'var(--space-sm)',
            background: 'var(--color-surface)',
          }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleConfirm}
              style={{ flex: 1 }}
            >
              Speichern
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPreview(null)}
            >
              <X size={16} /> Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Upload-Button */}
      {!preview && (
        <button
          onClick={openCamera}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-sm)',
            padding: 'var(--space-md)',
            background: 'var(--color-primary-50)',
            border: '2px dashed var(--color-primary)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-primary)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Camera size={20} />
          Foto aufnehmen
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
}

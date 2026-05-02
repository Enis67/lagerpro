import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { parseCSV, validateMaterialRow, importMaterials } from '../services/csvImport';
import Toast from '../components/Toast';

const EXPECTED_COLUMNS = [
  'name',
  'article_number',
  'manufacturer_number',
  'category',
  'unit',
  'min_stock',
  'reorder_quantity',
  'storage_location',
  'purchase_price',
];

const SAMPLE_CSV = `name;article_number;manufacturer_number;category;unit;min_stock;reorder_quantity;storage_location;purchase_price
LS-Schalter B16 1-polig;LS-B16-1;MBN116;Schutzgeräte;stueck;5;10;Regal A1;12.50
H07RN-F 5x2,5mm² 100m;KABEL-5G2.5;;Kabel;meter;2;5;Regal B2;89.90
Wanddose AP IP44;WD-AP44;;Installation;stueck;20;50;Regal C1;3.45`;

export default function CsvImport() {
  const navigate = useNavigate();
  const { categories, addMaterial } = useStore();
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState([]);
  const [validatedRows, setValidatedRows] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [toast, setToast] = useState(null);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    resetState();
    setFileName(file.name);

    parseCSV(file)
      .then((rows) => {
        setRawRows(rows);

        // Validierung
        const validated = [];
        const errors = [];
        rows.forEach((row, index) => {
          const result = validateMaterialRow(row, index);
          if (result.valid) {
            validated.push(result.data);
          } else {
            errors.push(...result.errors);
          }
        });

        setValidatedRows(validated);
        setValidationErrors(errors);

        if (validated.length === 0 && errors.length === 0) {
          setToast({ message: 'CSV enthält keine Datenzeilen.', type: 'warning' });
        } else if (errors.length > 0) {
          setToast({
            message: `${validated.length} Zeilen valide, ${errors.length} Fehler gefunden.`,
            type: 'warning',
          });
        } else {
          setToast({ message: `${validated.length} Zeilen valide – bereit zum Import.`, type: 'success' });
        }
      })
      .catch((err) => {
        setToast({ message: 'Fehler beim Parsen: ' + err.message, type: 'error' });
      });
  }

  async function handleImport() {
    if (validatedRows.length === 0) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importMaterials(validatedRows, categories, addMaterial);
      setImportResult(result);

      if (result.success > 0) {
        setToast({
          message: `${result.success} Materialien importiert${result.failed > 0 ? `, ${result.failed} fehlgeschlagen` : ''} ✓`,
          type: result.failed > 0 ? 'warning' : 'success',
        });
      } else {
        setToast({ message: 'Keine Materialien importiert.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Import-Fehler: ' + err.message, type: 'error' });
    } finally {
      setIsImporting(false);
    }
  }

  function resetState() {
    setRawRows([]);
    setValidatedRows([]);
    setValidationErrors([]);
    setImportResult(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function downloadSample() {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lagerpro_material_import_vorlage.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const validCount = validatedRows.length;
  const errorCount = validationErrors.length;
  const totalCount = rawRows.length;

  return (
    <>
      <header className="page-header">
        <button className="page-header-back" onClick={() => navigate(-1)}>
          <ChevronLeft size={22} />
        </button>
        <h1>CSV-Import</h1>
        <div style={{ width: 44 }} />
      </header>

      <div className="page-content">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Info Card */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)', background: 'var(--color-primary-50)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
            <FileSpreadsheet size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <div className="font-semibold" style={{ marginBottom: 'var(--space-xs)' }}>
                Materialien per CSV importieren
              </div>
              <div className="text-sm text-secondary" style={{ marginBottom: 'var(--space-sm)' }}>
                Erwartete Spalten:
                <code style={{ display: 'block', fontSize: 'var(--font-size-xs)', marginTop: 4, color: 'var(--color-text-tertiary)' }}>
                  {EXPECTED_COLUMNS.join(', ')}
                </code>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={downloadSample}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} /> Vorlage herunterladen
              </button>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="card" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-xl)' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}
          >
            <Upload size={20} />
            {fileName ? 'Andere Datei wählen' : 'CSV-Datei auswählen'}
          </button>

          {fileName && (
            <div className="text-sm text-secondary text-center" style={{ marginTop: 'var(--space-md)' }}>
              <strong>{fileName}</strong> — {totalCount} Zeilen
            </div>
          )}
        </div>

        {/* Zusammenfassung */}
        {totalCount > 0 && (
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div
                style={{
                  flex: 1,
                  minWidth: 100,
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-success-50, #ecfdf5)',
                  textAlign: 'center',
                }}
              >
                <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-success)', marginTop: 4 }}>
                  {validCount}
                </div>
                <div className="text-xs text-secondary">Valide</div>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 100,
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-danger-50, #fef2f2)',
                  textAlign: 'center',
                }}
              >
                <XCircle size={20} style={{ color: 'var(--color-danger)' }} />
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-danger)', marginTop: 4 }}>
                  {errorCount}
                </div>
                <div className="text-xs text-secondary">Fehler</div>
              </div>
              <div
                style={{
                  flex: 1,
                  minWidth: 100,
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  textAlign: 'center',
                }}
              >
                <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-warning)', marginTop: 4 }}>
                  {totalCount}
                </div>
                <div className="text-xs text-secondary">Gesamt</div>
              </div>
            </div>
          </div>
        )}

        {/* Fehlerliste */}
        {validationErrors.length > 0 && (
          <div className="card" style={{ marginBottom: 'var(--space-lg)', background: 'var(--color-danger-50, #fef2f2)' }}>
            <div className="font-semibold" style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-sm)' }}>
              <XCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} />
              Validierungsfehler ({validationErrors.length})
            </div>
            <ul style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)', paddingLeft: 'var(--space-md)', margin: 0 }}>
              {validationErrors.slice(0, 10).map((err, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{err}</li>
              ))}
              {validationErrors.length > 10 && (
                <li className="text-secondary">… und {validationErrors.length - 10} weitere</li>
              )}
            </ul>
          </div>
        )}

        {/* Vorschau */}
        {validatedRows.length > 0 && (
          <div className="card" style={{ marginBottom: 'var(--space-lg)', overflow: 'hidden' }}>
            <div className="font-semibold" style={{ marginBottom: 'var(--space-sm)' }}>
              Vorschau ({validatedRows.length} Zeilen)
            </div>
            <div style={{ overflowX: 'auto', margin: '0 calc(-1 * var(--space-md))' }}>
              <table style={{ width: '100%', fontSize: 'var(--font-size-sm)', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ textAlign: 'left', padding: 'var(--space-xs) var(--space-md)', fontWeight: 600, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-xs) var(--space-md)', fontWeight: 600, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>Artikelnr.</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-xs) var(--space-md)', fontWeight: 600, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>Kategorie</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-xs) var(--space-md)', fontWeight: 600, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>Einheit</th>
                    <th style={{ textAlign: 'right', padding: 'var(--space-xs) var(--space-md)', fontWeight: 600, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>Min.</th>
                    <th style={{ textAlign: 'right', padding: 'var(--space-xs) var(--space-md)', fontWeight: 600, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>Bestellm.</th>
                    <th style={{ textAlign: 'left', padding: 'var(--space-xs) var(--space-md)', fontWeight: 600, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>Lagerort</th>
                    <th style={{ textAlign: 'right', padding: 'var(--space-xs) var(--space-md)', fontWeight: 600, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>EK (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {validatedRows.slice(0, 20).map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle, #f3f4f6)' }}>
                      <td style={{ padding: 'var(--space-xs) var(--space-md)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}</td>
                      <td style={{ padding: 'var(--space-xs) var(--space-md)', whiteSpace: 'nowrap' }}>{row.article_number}</td>
                      <td style={{ padding: 'var(--space-xs) var(--space-md)', whiteSpace: 'nowrap' }}>{row.category || '—'}</td>
                      <td style={{ padding: 'var(--space-xs) var(--space-md)', whiteSpace: 'nowrap' }}>{row.unit}</td>
                      <td style={{ padding: 'var(--space-xs) var(--space-md)', textAlign: 'right', whiteSpace: 'nowrap' }}>{row.min_stock}</td>
                      <td style={{ padding: 'var(--space-xs) var(--space-md)', textAlign: 'right', whiteSpace: 'nowrap' }}>{row.reorder_quantity}</td>
                      <td style={{ padding: 'var(--space-xs) var(--space-md)', whiteSpace: 'nowrap' }}>{row.storage_location || '—'}</td>
                      <td style={{ padding: 'var(--space-xs) var(--space-md)', textAlign: 'right', whiteSpace: 'nowrap' }}>{row.purchase_price > 0 ? row.purchase_price.toFixed(2) : '—'}</td>
                    </tr>
                  ))}
                  {validatedRows.length > 20 && (
                    <tr>
                      <td colSpan={8} style={{ padding: 'var(--space-sm) var(--space-md)', textAlign: 'center', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                        … und {validatedRows.length - 20} weitere Zeilen
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import-Button */}
        {validCount > 0 && (
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleImport}
            disabled={isImporting}
            style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}
          >
            {isImporting ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Importiere…
              </>
            ) : (
              <>
                <Upload size={20} />
                {validCount} Material{validCount !== 1 ? 'ien' : ''} importieren
              </>
            )}
          </button>
        )}

        {/* Import-Ergebnis */}
        {importResult && (
          <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
            <div className="font-semibold" style={{ marginBottom: 'var(--space-sm)' }}>
              Import-Ergebnis
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 100, padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-success-50, #ecfdf5)', textAlign: 'center' }}>
                <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-success)', marginTop: 4 }}>{importResult.success}</div>
                <div className="text-xs text-secondary">Erfolgreich</div>
              </div>
              <div style={{ flex: 1, minWidth: 100, padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-danger-50, #fef2f2)', textAlign: 'center' }}>
                <XCircle size={20} style={{ color: 'var(--color-danger)' }} />
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-danger)', marginTop: 4 }}>{importResult.failed}</div>
                <div className="text-xs text-secondary">Fehlgeschlagen</div>
              </div>
            </div>
            {importResult.errors.length > 0 && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <div className="font-semibold" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>Fehler:</div>
                <ul style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)', paddingLeft: 'var(--space-md)', margin: 0 }}>
                  {importResult.errors.slice(0, 10).map((err, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{err}</li>
                  ))}
                  {importResult.errors.length > 10 && (
                    <li className="text-secondary">… und {importResult.errors.length - 10} weitere</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

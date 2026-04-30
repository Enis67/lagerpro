// ── CSV-Export Service ───────────────────────────────────
// Erzeugt CSV-Dateien für Lagerbewegungen und Materialien

import { MOVEMENT_TYPE_LABELS, UNIT_LABELS } from '../data/constants';

/**
 * Erzeugt einen CSV-Download für Lagerbewegungen.
 * 
 * @param {Array} movements - Array von Movement-Objekten
 * @param {Array} materials - Array von Material-Objekten (für Name-Lookup)
 * @param {Array} projects - Array von Project-Objekten (für Name-Lookup)
 * @param {string} [filename] - Optional: Dateiname
 */
export function exportMovementsCSV(movements, materials, projects, filename) {
  const materialMap = Object.fromEntries(materials.map(m => [m.id, m]));
  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));

  const headers = ['Datum', 'Uhrzeit', 'Typ', 'Material', 'Artikelnr.', 'Menge', 'Einheit', 'Baustelle', 'Notiz'];
  
  const rows = movements.map(m => {
    const mat = materialMap[m.material_id];
    const proj = m.project_id ? projectMap[m.project_id] : null;
    const date = new Date(m.created_at);
    
    return [
      date.toLocaleDateString('de-DE'),
      date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      MOVEMENT_TYPE_LABELS[m.type] || m.type,
      mat?.name || 'Unbekannt',
      mat?.article_number || '',
      m.quantity,
      mat ? (UNIT_LABELS[mat.unit] || mat.unit) : '',
      proj?.name || '',
      m.note || '',
    ];
  });

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
  ].join('\n');

  // BOM für korrekte Umlaute in Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const defaultFilename = `lagerbewegungen_${new Date().toISOString().split('T')[0]}.csv`;
  downloadBlob(blob, filename || defaultFilename);
}

/**
 * Erzeugt einen CSV-Download für die Materialliste.
 */
export function exportMaterialsCSV(materials, categories, suppliers) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  const supMap = Object.fromEntries(suppliers.map(s => [s.id, s.name]));

  const headers = ['Artikelnr.', 'Herstellernr.', 'Name', 'Kategorie', 'Bestand', 'Reserviert', 'Verfügbar', 'Min-Bestand', 'Einheit', 'Lagerort', 'Lieferant', 'EK-Preis', 'VPE'];
  
  const rows = materials.map(m => [
    m.article_number || '',
    m.manufacturer_number || '',
    m.name,
    catMap[m.category_id] || '',
    m.current_stock,
    m.reserved_stock,
    Math.max(0, m.current_stock - m.reserved_stock),
    m.min_stock,
    UNIT_LABELS[m.unit] || m.unit,
    m.storage_location || '',
    supMap[m.supplier_id] || '',
    m.purchase_price?.toFixed(2) || '0.00',
    m.packaging_unit || '',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
  ].join('\n');

  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `materialbestand_${new Date().toISOString().split('T')[0]}.csv`);
}

/**
 * Helper: Blob als Datei herunterladen
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

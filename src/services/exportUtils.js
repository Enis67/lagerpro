// CSV-Export – Excel-kompatibel (Semikolon + UTF-8 BOM für deutsche Locale)
import { UNIT_LABELS, MOVEMENT_TYPE_LABELS } from '../data/constants';

const BOM = '\uFEFF';
const SEP = ';';

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(SEP) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function buildCSV(headers, rows) {
  const head = headers.map(escapeCell).join(SEP);
  const body = rows.map(r => r.map(escapeCell).join(SEP)).join('\r\n');
  return BOM + head + '\r\n' + body;
}

function downloadFile(filename, content, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function dateStamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatGermanDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatNumber(n) {
  if (n === null || n === undefined || n === '') return '';
  return String(n).replace('.', ',');
}

// ── Material-Liste exportieren ────────────────────────────
export function exportMaterialsCSV(materials, categories = [], suppliers = []) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
  const supMap = Object.fromEntries(suppliers.map(s => [s.id, s.name]));

  const headers = [
    'Artikelnr.', 'Herstellernr.', 'Barcode', 'Name', 'Kategorie',
    'Einheit', 'Bestand', 'Reserviert', 'Verfügbar', 'Mindestbestand',
    'Bestellmenge', 'Lagerort', 'Lieferant', 'EK-Preis', 'VPE',
    'Aktiv', 'Beschreibung',
  ];

  const rows = materials.map(m => [
    m.article_number,
    m.manufacturer_number,
    m.barcode,
    m.name,
    catMap[m.category_id] || '',
    UNIT_LABELS[m.unit] || m.unit,
    formatNumber(m.current_stock),
    formatNumber(m.reserved_stock),
    formatNumber(Math.max(0, (m.current_stock || 0) - (m.reserved_stock || 0))),
    formatNumber(m.min_stock),
    formatNumber(m.reorder_quantity),
    m.storage_location,
    supMap[m.supplier_id] || '',
    formatNumber(m.purchase_price),
    m.packaging_unit,
    m.active ? 'Ja' : 'Nein',
    m.description,
  ]);

  downloadFile(`lagerpro-material-${dateStamp()}.csv`, buildCSV(headers, rows));
}

// ── Lagerbewegungen exportieren ───────────────────────────
export function exportMovementsCSV(movements, materials = [], projects = []) {
  const matMap = Object.fromEntries(materials.map(m => [m.id, m]));
  const projMap = Object.fromEntries(projects.map(p => [p.id, p.name]));

  const headers = [
    'Datum', 'Typ', 'Artikelnr.', 'Material', 'Menge', 'Einheit',
    'Baustelle', 'Notiz',
  ];

  const rows = movements.map(mv => {
    const mat = matMap[mv.material_id];
    return [
      formatGermanDateTime(mv.created_at),
      MOVEMENT_TYPE_LABELS[mv.type] || mv.type,
      mat?.article_number || '',
      mat?.name || '',
      formatNumber(mv.quantity),
      mat ? (UNIT_LABELS[mat.unit] || mat.unit) : '',
      mv.project_id ? (projMap[mv.project_id] || '') : '',
      mv.note,
    ];
  });

  downloadFile(`lagerpro-bewegungen-${dateStamp()}.csv`, buildCSV(headers, rows));
}

// ── Nachbestellliste exportieren ──────────────────────────
export function exportReorderCSV(items) {
  const headers = [
    'Artikelnr.', 'Herstellernr.', 'Name', 'Lieferant', 'Bestand',
    'Mindestbestand', 'Bestellmenge', 'Einheit', 'EK-Preis', 'EK gesamt',
  ];

  const rows = items.map(item => {
    const total = (item.purchase_price || 0) * (item.reorder_quantity || 0);
    return [
      item.article_number,
      item.manufacturer_number,
      item.name,
      item.supplier_name,
      formatNumber(item.current_stock),
      formatNumber(item.min_stock),
      formatNumber(item.reorder_quantity),
      UNIT_LABELS[item.unit] || item.unit,
      formatNumber(item.purchase_price),
      formatNumber(total.toFixed(2)),
    ];
  });

  downloadFile(`lagerpro-nachbestellung-${dateStamp()}.csv`, buildCSV(headers, rows));
}

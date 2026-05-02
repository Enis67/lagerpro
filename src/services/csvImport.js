// CSV Import Service – Parser, Validierung & Import-Logik für Materialien
// Unterstützt semikolon- und komma-getrennte CSVs mit/ohne Header

import { v4 as uuid } from 'uuid';

/**
 * Parst eine CSV-Datei in ein Array von Objekten.
 * Unterstützt Semikolon- und Komma-Trennzeichen sowie Anführungszeichen.
 * @param {File} file - Die hochgeladene CSV-Datei
 * @returns {Promise<Array<Object>>} Array mit geparsten Zeilen als Objekte
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSVText(text);
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
    reader.readAsText(file);
  });
}

/**
 * Parst CSV-Text in ein Array von Objekten.
 */
function parseCSVText(text) {
  // Normalisiere Zeilenumbrüche
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').filter(line => line.trim() !== '');

  if (lines.length === 0) {
    throw new Error('CSV-Datei ist leer');
  }

  // Ermittle Trennzeichen (Semikolon hat Vorrang)
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  const headers = splitRow(firstLine, delimiter).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));

  if (headers.length === 0) {
    throw new Error('Keine Header-Zeile gefunden');
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i], delimiter);
    if (values.length === 1 && values[0].trim() === '') continue;

    const row = {};
    headers.forEach((header, index) => {
      const rawValue = values[index] !== undefined ? values[index].trim() : '';
      // Entferne umschließende Anführungszeichen
      row[header] = rawValue.replace(/^"|"$/g, '').replace(/""/g, '"');
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Splittet eine CSV-Zeile unter Beachtung von Anführungszeichen.
 */
function splitRow(line, delimiter) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // überspringe das zweite Anführungszeichen
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Validiert eine einzelne CSV-Zeile für den Material-Import.
 * Prüft Pflichtfelder: name, article_number
 * @param {Object} row - Die geparste CSV-Zeile
 * @param {number} index - Zeilenindex (für Fehlermeldungen)
 * @returns {{ valid: boolean, errors: string[], data: Object|null }}
 */
export function validateMaterialRow(row, index) {
  const errors = [];
  const lineInfo = `Zeile ${index + 1}`;

  const name = (row.name || '').trim();
  const articleNumber = (row.article_number || '').trim();

  if (!name) {
    errors.push(`${lineInfo}: Name fehlt`);
  }
  if (!articleNumber) {
    errors.push(`${lineInfo}: Artikelnummer fehlt`);
  }

  if (errors.length > 0) {
    return { valid: false, errors, data: null };
  }

  // Numerische Felder parsen
  const minStock = parseNumber(row.min_stock);
  const reorderQuantity = parseNumber(row.reorder_quantity);
  const purchasePrice = parseFloatGerman(row.purchase_price);

  const data = {
    name,
    article_number: articleNumber,
    manufacturer_number: (row.manufacturer_number || '').trim(),
    category: (row.category || '').trim(),
    unit: (row.unit || '').trim() || 'stueck',
    min_stock: minStock,
    reorder_quantity: reorderQuantity,
    storage_location: (row.storage_location || '').trim(),
    purchase_price: purchasePrice,
  };

  return { valid: true, errors: [], data };
}

/**
 * Parst eine Zahl (deutsch: Komma, englisch: Punkt).
 */
function parseNumber(value) {
  if (value === undefined || value === null || value === '') return 0;
  const cleaned = String(value).trim().replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parst einen Fließkomma-Wert (deutsch: Komma als Dezimaltrenner).
 */
function parseFloatGerman(value) {
  if (value === undefined || value === null || value === '') return 0;
  const cleaned = String(value).trim().replace(/\./g, '').replace(',', '.');
  // Für Beträge: wenn mehr als ein Punkt vorhanden, nimm den letzten als Dezimal
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    const whole = parts.slice(0, -1).join('');
    const decimal = parts[parts.length - 1];
    const num = parseFloat(`${whole}.${decimal}`);
    return isNaN(num) ? 0 : num;
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Importiert validierte Material-Zeilen als echte Materialien.
 * Löst Kategorie-Namen zu category_id auf und legt Materialien über addMaterial an.
 * @param {Array<Object>} rows - Validierte Zeilen (aus validateMaterialRow)
 * @param {Array<Object>} categories - Verfügbare Kategorien aus dem Store
 * @param {Function} addMaterial - useStore.addMaterial Funktion
 * @returns {Promise<{ success: number, failed: number, errors: string[], createdMaterials: Array<Object> }>}
 */
export async function importMaterials(rows, categories, addMaterial) {
  const errors = [];
  const createdMaterials = [];
  let success = 0;
  let failed = 0;

  // Kategorie-Lookup: Name (case-insensitive) → id
  const categoryMap = new Map();
  categories.forEach(c => {
    categoryMap.set(c.name.toLowerCase().trim(), c.id);
  });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Kategorie auflösen
    let categoryId = '';
    if (row.category) {
      const lookup = categoryMap.get(row.category.toLowerCase().trim());
      if (lookup) {
        categoryId = lookup;
      } else {
        errors.push(`Zeile ${i + 1}: Kategorie "${row.category}" nicht gefunden`);
        failed++;
        continue;
      }
    }

    const material = {
      id: uuid(),
      name: row.name,
      article_number: row.article_number,
      manufacturer_number: row.manufacturer_number || '',
      ean_code: '',
      category_id: categoryId,
      description: '',
      unit: row.unit || 'stueck',
      current_stock: 0,
      reserved_stock: 0,
      min_stock: row.min_stock || 0,
      reorder_quantity: row.reorder_quantity || 0,
      storage_location: row.storage_location || '',
      supplier_id: '',
      purchase_price: row.purchase_price || 0,
      packaging_unit: '',
      active: true,
      images: [],
    };

    try {
      await addMaterial(material);
      createdMaterials.push(material);
      success++;
    } catch (err) {
      errors.push(`Zeile ${i + 1}: ${err.message || 'Speichern fehlgeschlagen'}`);
      failed++;
    }
  }

  return { success, failed, errors, createdMaterials };
}

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const seedPath = join(__dirname, 'src', 'data', 'seedData.js');
const tempPath = join(__dirname, 'temp-seed.mjs');

import { pathToFileURL } from 'url';

fs.copyFileSync(seedPath, tempPath);
const data = await import(pathToFileURL(tempPath).href);
const { seedMaterials: materials, seedCategories: categories, seedSuppliers: suppliers, seedProjects: projects, seedMovements: movements } = data;

// Realistische EK-Preise nach Kategorie (in €)
const priceMap = {
  'Klemmen': 0.15,
  'Leitungen & Kabel': 2.5,
  'Installationsgeräte': 8.0,
  'Schutzgeräte': 25.0,
  'Verteiler & Zähler': 120.0,
  'Werkzeug': 45.0,
  'Beleuchtung': 35.0,
  'Schaltschränke': 180.0,
  'Erdung & Blitzschutz': 15.0,
  'Kommunikationstechnik': 45.0,
  'Photovoltaik': 85.0,
  'Heizung & Klima': 65.0,
};

// Kategorie-ID → Name Map
const catMap = {};
categories.forEach(c => catMap[c.id] = c.name);

let count = 0;
materials.forEach(m => {
  if (!m.purchase_price || m.purchase_price === 0) {
    const catName = catMap[m.category_id] || 'Sonstige';
    const basePrice = priceMap[catName] || 10.0;
    const variation = 0.7 + Math.random() * 0.6;
    m.purchase_price = Math.round(basePrice * variation * 100) / 100;
    count++;
  }
});

// Entferne current_stock aus Lieferanten (Bug)
suppliers.forEach(s => {
  delete s.current_stock;
});

// Realistischere Lieferanten-Namen
const supplierNames = ['Sonepar Deutschland GmbH', 'Rexel Germany GmbH', 'Hagemeyer Deutschland GmbH'];
suppliers.forEach((s, i) => {
  if (supplierNames[i]) s.name = supplierNames[i];
});

function serializeArray(name, arr) {
  const items = arr.map(item => {
    const entries = Object.entries(item).map(([k, v]) => {
      if (v === null) return `${k}: null`;
      if (typeof v === 'string') return `${k}: '${v.replace(/'/g, "\\'")}'`;
      if (typeof v === 'boolean') return `${k}: ${v}`;
      if (typeof v === 'number') return `${k}: ${v}`;
      if (Array.isArray(v)) return `${k}: ${JSON.stringify(v)}`;
      return `${k}: ${JSON.stringify(v)}`;
    });
    return `  {\n    ${entries.join(',\n    ')},\n  }`;
  });
  return `export const ${name} = [\n${items.join(',\n')}\n];`;
}

const output = [
  "// Alle Materialien mit Herstellernummern und Artikelnummern",
  serializeArray('seedMaterials', materials),
  '',
  serializeArray('seedCategories', categories),
  '',
  serializeArray('seedSuppliers', suppliers),
  '',
  serializeArray('seedProjects', projects),
  '',
  serializeArray('seedMovements', movements),
].join('\n');

fs.writeFileSync(seedPath, output);
fs.unlinkSync(tempPath);

console.log(`✓ ${count} Materialien mit purchase_price versehen`);
console.log(`✓ ${suppliers.length} Lieferanten bereinigt (current_stock entfernt)`);
console.log('✓ Lieferanten: ' + suppliers.map(s => s.name).join(', '));

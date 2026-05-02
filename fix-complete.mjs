import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const seedPath = join(__dirname, 'src', 'data', 'seedData.js');
const tempPath = join(__dirname, 'temp-seed.mjs');

// Kopiere und importiere
fs.copyFileSync(seedPath, tempPath);
const data = await import(pathToFileURL(tempPath).href);
const { seedMaterials: materials, seedCategories: categories, seedSuppliers: suppliers, seedProjects: projects, seedMovements: movements } = data;

// Echte Herstellernummern
const realMfrNumbers = {
  'WAGO-221-415': '221-415',
  'WAGO-221-413': '221-413',
  'WAGO-221-412': '221-412',
  'WAGO-773-164': '773-164',
  'WAGO-773-168': '773-168',
  'WAGO-222-415': '222-415',
  'HAG-MCN316': 'MCN316',
  'HAG-MCN332': 'MCN332',
  'HAG-MBN110': 'MBN110',
  'HAG-MBN116': 'MBN116',
  'HAG-MBN120': 'MBN120',
  'KB-10.0-BRASS': 'SAK 10/EN',
  'KB-16.0-BRASS': 'SAK 16/EN',
  'KB-25.0-BRASS': 'UK 25 N',
  'KB-35.0-BRASS': 'UK 35 N',
  'SIC-16A-B-LS': 'S201-B16',
  'SIC-20A-B-LS': 'S201-B20',
  'SIC-25A-B-LS': 'S201-B25',
  'SIC-32A-B-LS': 'S201-B32',
  'SIC-10A-B-LS': 'S201-B10',
  'SIC-13A-B-LS': 'S201-B13',
  'SIC-16A-C-LS': 'S201-C16',
  'SIC-20A-C-LS': 'S201-C20',
  'FI-40A-30MA-2P': '5SM3312-6',
  'FI-63A-30MA-4P': '5SM3344-6',
  'FI-25A-30MA-2P': '5SM3310-6',
  'SCHUKO-16A-WS': 'A 1520 WW',
  'SCHUKO-16A-AN': 'A 1520 AN',
  'SW-WECH-10A-WS': 'AS 500',
  'SW-SER-10A-WS': '0136 26',
  'SW-KR-10A-WS': '0151 26',
  'ZS-1F-AP-IP30': 'SV 9343.010',
  'ZS-3F-AP-IP30': 'SV 9343.030',
  'VERT-2R-24PLE': 'AE 1050.500',
  'AEH-1.5-ISO-1000': '462310',
  'AEH-2.5-ISO-1000': '462320',
};

materials.forEach(m => {
  if (!m.current_stock || m.current_stock === 0) {
    const min = m.min_stock || 0;
    const rand = Math.random();
    let pct;
    if (rand < 0.10) pct = 0;
    else if (rand < 0.25) pct = 0.3 + Math.random() * 0.3;
    else if (rand < 0.50) pct = 0.6 + Math.random() * 0.3;
    else if (rand < 0.75) pct = 1.0 + Math.random() * 0.2;
    else if (rand < 0.90) pct = 1.2 + Math.random() * 0.5;
    else pct = 1.7 + Math.random() * 0.8;
    m.current_stock = Math.max(0, Math.floor(min * pct));
  }
  if (realMfrNumbers[m.manufacturer_number]) {
    m.manufacturer_number = realMfrNumbers[m.manufacturer_number];
  }
});

function serializeArray(name, arr) {
  const items = arr.map(item => {
    const entries = Object.entries(item).map(([k, v]) => {
      if (v === null) return `${k}: null`;
      if (typeof v === 'string') return `${k}: '${v.replace(/'/g, "\\'")}'`;
      if (typeof v === 'boolean') return `${k}: ${v}`;
      if (typeof v === 'number') return `${k}: ${v}`;
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

console.log(`✓ ${materials.length} Materialien aktualisiert`);
console.log(`✓ Realistische Bestände gesetzt`);
console.log(`✓ Echte Herstellernummern (WAGO, Hager, ABB, etc.)`);

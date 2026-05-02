import fs from 'fs';

let c = fs.readFileSync('src/data/seedData.js', 'utf8');

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

// Kategorie-Namen → IDs Mapping auslesen
const catMatch = c.match(/export const seedCategories = \[([\s\S]*?)\];/);
const catMap = {};
if (catMatch) {
  const catContent = catMatch[1];
  const idMatches = [...catContent.matchAll(/id: '([^']+)'[\s\S]*?name: '([^']+)'/g)];
  idMatches.forEach(m => {
    catMap[m[1]] = m[2];
  });
}

// Füge purchase_price zu jedem Material hinzu
let count = 0;
c = c.replace(/({[\s\S]*?category_id: '([^']+)'[\s\S]*?)(active: true,\s*\n\s*})/g, (match, before, catId, after) => {
  if (match.includes('purchase_price')) return match; // Bereits vorhanden
  
  const catName = catMap[catId] || 'Sonstige';
  const basePrice = priceMap[catName] || 10.0;
  // Variation: ±30% für Realismus
  const variation = 0.7 + Math.random() * 0.6;
  const price = Math.round(basePrice * variation * 100) / 100;
  
  count++;
  return before + `purchase_price: ${price},\n    ` + after;
});

fs.writeFileSync('src/data/seedData.js', c);
console.log(`✓ ${count} Materialien mit purchase_price versehen`);
console.log('✓ Kategorien:', Object.keys(priceMap).join(', '));

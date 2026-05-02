const fs = require('fs');

// Lese seedData.js
let content = fs.readFileSync('src/data/seedData.js', 'utf8');

// Ersetze Herstellernummern mit echten Nummern
const replacements = {
  // WAGO echte Nummern
  "manufacturer_number: 'WAGO-221-415'": "manufacturer_number: '221-415'",
  "manufacturer_number: 'WAGO-221-413'": "manufacturer_number: '221-413'",
  "manufacturer_number: 'WAGO-221-412'": "manufacturer_number: '221-412'",
  "manufacturer_number: 'WAGO-773-164'": "manufacturer_number: '773-164'",
  "manufacturer_number: 'WAGO-773-168'": "manufacturer_number: '773-168'",
  "manufacturer_number: 'WAGO-222-415'": "manufacturer_number: '222-415'",
  
  // Hager echte Nummern
  "manufacturer_number: 'MCN316'": "manufacturer_number: 'HAG-MCN316'",
  "manufacturer_number: 'MCN332'": "manufacturer_number: 'HAG-MCN332'",
  "manufacturer_number: 'MBN110'": "manufacturer_number: 'HAG-MBN110'",
  "manufacturer_number: 'MBN116'": "manufacturer_number: 'HAG-MBN116'",
  "manufacturer_number: 'MBN120'": "manufacturer_number: 'HAG-MBN120'",
};

Object.entries(replacements).forEach(([old, neu]) => {
  content = content.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), neu);
});

// Füge current_stock hinzu - generiere realistische Werte basierend auf min_stock
// Algorithmus: 30% unter min, 50% um min, 20% über min
let id = 0;
content = content.replace(/id: '(\d+)', name:/g, (match, num) => {
  id++;
  const minStockMatch = content.match(new RegExp(`id: '${num}',[\\s\\S]{0,300}min_stock: (\\d+)`));
  let currentStock = 0;
  if (minStockMatch) {
    const min = parseInt(minStockMatch[1]);
    const rand = Math.random();
    if (rand < 0.15) currentStock = Math.floor(min * 0.3); // 15% fast leer
    else if (rand < 0.35) currentStock = Math.floor(min * 0.7); // 20% unter min
    else if (rand < 0.65) currentStock = Math.floor(min * 1.0); // 30% um min
    else if (rand < 0.85) currentStock = Math.floor(min * 1.3); // 20% über min
    else currentStock = Math.floor(min * 1.8); // 15% gut gefüllt
  }
  return `id: '${num}', current_stock: ${currentStock}, name:`;
});

fs.writeFileSync('src/data/seedData.js', content);
console.log(`Added current_stock to ${id} materials`);
console.log('Herstellernummern aktualisiert (WAGO, Hager)');

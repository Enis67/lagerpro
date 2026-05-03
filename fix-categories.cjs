const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'seedData.js');
let content = fs.readFileSync(filePath, 'utf8');

// Kategorie-Verteilung (300 Artikel total)
const distribution = {
  '1': 60,  // Kabel & Leitungen (meiste)
  '2': 40,  // Klemmen & Verbinder
  '3': 35,  // Schalter & Steckdosen
  '4': 30,  // Beleuchtung
  '5': 25,  // Schienen & Sicherungen
  '6': 20,  // Abzweigdosen
  '7': 20,  // Kabelkanäle
  '8': 15,  // Zählerschränke
  '9': 15,  // Erdung
  '10': 10, // Werkzeug
  '11': 10, // Montagematerial
  '12': 8,  // Kommunikation
  '13': 4,  // Heizung & Klima
  '14': 4,  // PV & Solar
  '15': 4,  // Reserve
};

// Verify total
const total = Object.values(distribution).reduce((a, b) => a + b, 0);
console.log(`Total: ${total} (should be 300)`);

// Count current categories
const categoryMatches = content.match(/category_id: '(\d+)'/g);
const currentCounts = {};
categoryMatches.forEach(m => {
  const id = m.match(/'(\d+)'/)[1];
  currentCounts[id] = (currentCounts[id] || 0) + 1;
});
console.log('Current distribution:', currentCounts);

// Build new content with updated distribution
let newContent = content;
let counter = 0;

// For each category, change the category_id of the right number of items
for (const [catId, count] of Object.entries(distribution)) {
  let changed = 0;
  // Find items to change to this category
  // We iterate through all items and change their category if needed
  const regex = new RegExp(`category_id: '\\d+'`, 'g');
  
  newContent = newContent.replace(regex, (match, offset) => {
    counter++;
    // Simple approach: just renumber sequentially based on distribution
    // This is a bit hacky but works
    return match; // We'll do this differently
  });
}

// Better approach: Extract all items, reshuffle, rewrite
const items = [];
const itemRegex = /{\s*id:[\s\S]*?active:\s*(true|false)\s*,?\s*}/g;
let match;

// Actually, let's use a simpler approach - just change category_id values
let itemIndex = 0;
const categorySequence = [];
for (const [catId, count] of Object.entries(distribution)) {
  for (let i = 0; i < count; i++) {
    categorySequence.push(catId);
  }
}

// Shuffle the sequence
for (let i = categorySequence.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [categorySequence[i], categorySequence[j]] = [categorySequence[j], categorySequence[i]];
}

// Replace category_ids sequentially
let seqIndex = 0;
newContent = content.replace(/category_id: '(\d+)'/g, (match) => {
  const newCat = categorySequence[seqIndex++];
  return `category_id: '${newCat}'`;
});

// Verify
const newMatches = newContent.match(/category_id: '(\d+)'/g);
const newCounts = {};
newMatches.forEach(m => {
  const id = m.match(/'(\d+)'/)[1];
  newCounts[id] = (newCounts[id] || 0) + 1;
});
console.log('New distribution:', newCounts);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('✅ seedData.js updated with realistic category distribution!');

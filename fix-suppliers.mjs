import fs from 'fs';

let c = fs.readFileSync('src/data/seedData.js', 'utf8');

// 1. Entferne current_stock aus Lieferanten
const supplierRegex = /(export const seedSuppliers = \[)([\s\S]*?)(\];\s*export const seedProjects)/;
c = c.replace(supplierRegex, (m, p1, p2, p3) => {
  p2 = p2.replace(/,\s*\n\s*current_stock: 0/g, '');
  return p1 + p2 + p3;
});

// 2. Realistischere Lieferanten
c = c.split("'Elektro Grosshandel GmbH'").join("'Sonepar Deutschland GmbH'");
c = c.split("'Kabel & Draht AG'").join("'Rexel Germany GmbH'");
c = c.split("'Beleuchtung & Co. KG'").join("'Hagemeyer Deutschland GmbH'");

fs.writeFileSync('src/data/seedData.js', c);
console.log('✓ Lieferanten bereinigt');

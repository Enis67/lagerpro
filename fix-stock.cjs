const fs = require('fs');

let content = fs.readFileSync('src/data/seedData.js', 'utf8');

let count = 0;
content = content.replace(/id: '(\d+)', name:/g, (match, id) => {
  count++;
  return `id: '${id}', current_stock: 0, name:`;
});

fs.writeFileSync('src/data/seedData.js', content);
console.log('Added current_stock: 0 to ' + count + ' materials');
console.log('WARNING: Values are 0 - need to set real stock values!');

import fs from 'fs';

let content = fs.readFileSync('src/data/seedData.js', 'utf8');

// Extrahiere alle Material-Objekte und füge current_stock hinzu
// Wir parsen die Datei als Text und manipulieren die Objekte

// Zuerst: Herstellernummern mit echten ersetzen
const replacements = {
  "'WAGO-221-415'": "'221-415'",
  "'WAGO-221-413'": "'221-413'",
  "'WAGO-221-412'": "'221-412'",
  "'WAGO-773-164'": "'773-164'",
  "'WAGO-773-168'": "'773-168'",
  "'WAGO-222-415'": "'222-415'",
  "'HAG-MCN316'": "'MCN316'",
  "'HAG-MCN332'": "'MCN332'",
  "'HAG-MBN110'": "'MBN110'",
  "'HAG-MBN116'": "'MBN116'",
  "'HAG-MBN120'": "'MBN120'",
  "'KB-10.0-BRASS'": "'SAK 10/EN'",
  "'KB-16.0-BRASS'": "'SAK 16/EN'",
  "'KB-25.0-BRASS'": "'UK 25 N'",
  "'KB-35.0-BRASS'": "'UK 35 N'",
  "'SIC-16A-B-LS'": "'S201-B16'",
  "'SIC-20A-B-LS'": "'S201-B20'",
  "'SIC-25A-B-LS'": "'S201-B25'",
  "'SIC-32A-B-LS'": "'S201-B32'",
  "'SIC-10A-B-LS'": "'S201-B10'",
  "'SIC-13A-B-LS'": "'S201-B13'",
  "'SIC-16A-C-LS'": "'S201-C16'",
  "'SIC-20A-C-LS'": "'S201-C20'",
  "'FI-40A-30MA-2P'": "'5SM3312-6'",
  "'FI-63A-30MA-4P'": "'5SM3344-6'",
  "'FI-25A-30MA-2P'": "'5SM3310-6'",
  "'SCHUKO-16A-WS'": "'A 1520 WW'",
  "'SCHUKO-16A-AN'": "'A 1520 AN'",
  "'SW-WECH-10A-WS'": "'AS 500'",
  "'SW-SER-10A-WS'": "'0136 26'",
  "'SW-KR-10A-WS'": "'0151 26'",
  "'ZS-1F-AP-IP30'": "'SV 9343.010'",
  "'ZS-3F-AP-IP30'": "'SV 9343.030'",
  "'VERT-2R-24PLE'": "'AE 1050.500'",
  "'AEH-1.5-ISO-1000'": "'462310'",
  "'AEH-2.5-ISO-1000'": "'462320'",
  "'NYY-5G2.5-B2CA'": "'NYY-J 5x2,5 re'",
  "'NYY-5G4-B2CA'": "'NYY-J 5x4 re'",
  "'NYY-5G6-B2CA'": "'NYY-J 5x6 re'",
  "'NYY-5G10-B2CA'": "'NYY-J 5x10 re'",
  "'NYY-5G16-B2CA'": "'NYY-J 5x16 re'",
  "'NYY-3G1.5-B2CA'": "'NYY-J 3x1,5 re'",
  "'NYM-3G1.5-B2CA'": "'NYM-J 3x1,5'",
  "'NYM-5G1.5-B2CA'": "'NYM-J 5x1,5'",
  "'NYM-5G2.5-B2CA'": "'NYM-J 5x2,5'",
};

for (const [old, neu] of Object.entries(replacements)) {
  content = content.split(old).join(neu);
}

// Jetzt current_stock mit realistischen Werten
// Wir ersetzen jedes current_stock: 0 mit einem zufälligen Wert
// Der Wert basiert auf min_stock das in der gleichen Objekt-Definition steht

// Wir müssen die Datei anders parshen - wir suchen nach dem Muster:
// current_stock: 0, und ersetzen es mit einem Wert basierend auf min_stock
// Da min_stock in der gleichen Zeile nicht garantiert ist, machen wir es so:
// Wir finden jedes Material-Objekt und setzen current_stock auf 50-150% von min_stock

let matCount = 0;
content = content.replace(/current_stock: 0,/g, () => {
  matCount++;
  // Verschiedene Bestandslevels:
  // 10%: leer (0)
  // 15%: kritisch (20-50% von min)
  // 25%: unter min (50-90% von min) 
  // 30%: ok (100-120% von min)
  // 15%: gut (120-180% von min)
  // 5%: voll (180-250% von min)
  const rand = Math.random();
  let pct;
  if (rand < 0.10) pct = 0;
  else if (rand < 0.25) pct = 0.2 + Math.random() * 0.3; // 20-50%
  else if (rand < 0.50) pct = 0.5 + Math.random() * 0.4; // 50-90%
  else if (rand < 0.80) pct = 1.0 + Math.random() * 0.2; // 100-120%
  else if (rand < 0.95) pct = 1.2 + Math.random() * 0.6; // 120-180%
  else pct = 1.8 + Math.random() * 0.7; // 180-250%
  
  return `current_stock: ${Math.floor(pct * 100)},`; // Placeholder - wird später angepasst
});

fs.writeFileSync('src/data/seedData.js', content);
console.log(`Updated ${matCount} materials with placeholder current_stock`);
console.log('Real values need min_stock context...');

import fs from 'fs';

const content = fs.readFileSync('src/data/seedData.js', 'utf8');

// Realistische Herstellernummern
const realNumbers = {
  // WAGO (echte Nummern)
  "'221-415'": "'221-415'", // WAGO 221-415 Compact 5-polig
  "'221-413'": "'221-413'", // WAGO 221-413 Compact 3-polig
  "'221-412'": "'221-412'", // WAGO 221-412 Compact 2-polig
  "'773-164'": "'773-164'", // WAGO 773-164
  "'773-168'": "'773-168'", // WAGO 773-168
  "'222-415'": "'222-415'", // WAGO 222-415
  
  // Hager (deutsche Artikelnummern)
  "'HAG-MCN316'": "'MCN316'", // Hager MCN316
  "'HAG-MCN332'": "'MCN332'", // Hager MCN332
  "'HAG-MBN110'": "'MBN110'", // Hager MBN110
  "'HAG-MBN116'": "'MBN116'", // Hager MBN116
  "'HAG-MBN120'": "'MBN120'", // Hager MBN120
  
  // Weidmüller
  "'KB-10.0-BRASS'": "'SAK 10/EN'", // Weidmüller SAK 10/EN
  "'KB-16.0-BRASS'": "'SAK 16/EN'", // Weidmüller SAK 16/EN
  
  // Phoenix Contact
  "'KB-25.0-BRASS'": "'UK 25 N'", // Phoenix Contact UK 25 N
  "'KB-35.0-BRASS'": "'UK 35 N'", // Phoenix Contact UK 35 N
  
  // ABB
  "'SIC-16A-B-LS'": "'S201-B16'", // ABB S201-B16
  "'SIC-20A-B-LS'": "'S201-B20'", // ABB S201-B20
  "'SIC-25A-B-LS'": "'S201-B25'", // ABB S201-B25
  "'SIC-32A-B-LS'": "'S201-B32'", // ABB S201-B32
  "'SIC-10A-B-LS'": "'S201-B10'", // ABB S201-B10
  "'SIC-13A-B-LS'": "'S201-B13'", // ABB S201-B13
  "'SIC-16A-C-LS'": "'S201-C16'", // ABB S201-C16
  "'SIC-20A-C-LS'": "'S201-C20'", // ABB S201-C20
  
  // Siemens
  "'FI-40A-30MA-2P'": "'5SM3312-6'", // Siemens 5SM3312-6
  "'FI-63A-30MA-4P'": "'5SM3344-6'", // Siemens 5SM3344-6
  "'FI-25A-30MA-2P'": "'5SM3310-6'", // Siemens 5SM3310-6
  
  // Jung (Schalter/Dosen)
  "'SCHUKO-16A-WS'": "'A 1520 WW'", // Jung A 1520 WW
  "'SCHUKO-16A-AN'": "'A 1520 AN'", // Jung A 1520 AN
  "'SW-WECH-10A-WS'": "'AS 500'", // Jung AS 500
  
  // Gira
  "'SW-SER-10A-WS'": "'0136 26'", // Gira 0136 26
  "'SW-KR-10A-WS'": "'0151 26'", // Gira 0151 26
  
  // Rittal (Zählerschränke)
  "'ZS-1F-AP-IP30'": "'SV 9343.010'", // Rittal SV 9343.010
  "'ZS-3F-AP-IP30'": "'SV 9343.030'", // Rittal SV 9343.030
  "'VERT-2R-24PLE'": "'AE 1050.500'", // Rittal AE 1050.500
  
  // Hensel (Klemmen)
  "'AEH-1.5-ISO-1000'": "'462310'", // Hensel 462310
  "'AEH-2.5-ISO-1000'": "'462320'", // Hensel 462320
  
  // NYY (Nexans/...)
  "'NYY-5G2.5-B2CA'": "'NYY-J 5x2,5 re'", // NYY-J 5x2,5 RE
  "'NYY-5G4-B2CA'": "'NYY-J 5x4 re'", // NYY-J 5x4 RE
  "'NYY-5G6-B2CA'": "'NYY-J 5x6 re'", // NYY-J 5x6 RE
  "'NYY-5G10-B2CA'": "'NYY-J 5x10 re'", // NYY-J 5x10 RE
  "'NYY-5G16-B2CA'": "'NYY-J 5x16 re'", // NYY-J 5x16 RE
  "'NYY-3G1.5-B2CA'": "'NYY-J 3x1,5 re'", // NYY-J 3x1,5 RE
  
  // NYM
  "'NYM-3G1.5-B2CA'": "'NYM-J 3x1,5'", // NYM-J 3x1,5
  "'NYM-5G1.5-B2CA'": "'NYM-J 5x1,5'", // NYM-J 5x1,5
  "'NYM-5G2.5-B2CA'": "'NYM-J 5x2,5'", // NYM-J 5x2,5
};

let newContent = content;

// Ersetze Herstellernummern
Object.entries(realNumbers).forEach(([old, neu]) => {
  newContent = newContent.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), neu);
});

// Generiere realistische current_stock Werte
// Ersetze current_stock: 0 mit zufälligem Wert basierend auf min_stock
let count = 0;
newContent = newContent.replace(/current_stock: 0,/g, () => {
  // Wir können den Wert nicht berechnen weil min_stock in der gleichen Zeile nicht verfügbar ist
  // Stattdessen: Ersetze alle 0 durch einen Platzhalter und verarbeite dann
  return 'current_stock: PLACEHOLDER,';
});

fs.writeFileSync('src/data/seedData.js', newContent);
console.log('Herstellernummern aktualisiert mit echten Nummern');
console.log('Achtung: current_stock muss noch mit realistischen Werten gefüllt werden');

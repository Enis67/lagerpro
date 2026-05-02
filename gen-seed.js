import fs from 'fs';

const materials = [];
let id = 1;

function add(name, art, man, cat, sup, unit, min, reorder, price, loc, desc) {
  materials.push({
    id: String(id++),
    name,
    article_number: art,
    manufacturer_number: man,
    category_id: String(cat),
    supplier_id: String(sup),
    unit,
    min_stock: min,
    reorder_quantity: reorder,
    price_per_unit: price,
    storage_location: loc,
    description: desc,
    active: true,
    image_url: '',
    barcode: '',
    ean: '4001234567' + String(890 + id).padStart(3, '0'),
  });
}

// ── KABEL (Kat 1) ──
add('NYY-J 5x2.5', 'E-KBL-001', 'NYY-5G2.5-B2CA', 1, 1, 'meter', 500, 250, 3.20, 'Regal A1', 'Mantelleitung PVC 0,6/1kV');
add('NYY-J 5x4', 'E-KBL-002', 'NYY-5G4-B2CA', 1, 1, 'meter', 300, 150, 4.80, 'Regal A2', 'Mantelleitung PVC 0,6/1kV');
add('NYY-J 5x6', 'E-KBL-003', 'NYY-5G6-B2CA', 1, 1, 'meter', 200, 100, 6.50, 'Regal A3', 'Mantelleitung PVC 0,6/1kV');
add('NYY-J 5x10', 'E-KBL-004', 'NYY-5G10-B2CA', 1, 1, 'meter', 150, 75, 10.20, 'Regal A4', 'Mantelleitung PVC 0,6/1kV');
add('NYY-J 5x16', 'E-KBL-005', 'NYY-5G16-B2CA', 1, 1, 'meter', 100, 50, 15.80, 'Regal A5', 'Mantelleitung PVC 0,6/1kV');
add('H05VV-F 3G1.5', 'E-KBL-006', 'H05VV-3G1.5-F', 1, 1, 'meter', 200, 100, 1.40, 'Regal A6', 'Schlauchleitung flexibel');
add('H05VV-F 3G2.5', 'E-KBL-007', 'H05VV-3G2.5-F', 1, 1, 'meter', 150, 75, 2.10, 'Regal A7', 'Schlauchleitung flexibel');
add('H07RN-F 5G2.5', 'E-KBL-008', 'H07RN-5G2.5-F', 1, 2, 'meter', 150, 75, 5.60, 'Regal A8', 'Gummischlauchleitung schwer');
add('H07RN-F 5G4', 'E-KBL-009', 'H07RN-5G4-F', 1, 2, 'meter', 100, 50, 8.20, 'Regal A9', 'Gummischlauchleitung schwer');
add('NYCY 4x25/16', 'E-KBL-010', 'NYCY-4G25-16', 1, 2, 'meter', 80, 40, 28.50, 'Regal A10', 'EMV-gerecht geschirmt');
add('NYY-J 3x1.5', 'E-KBL-011', 'NYY-3G1.5-B2CA', 1, 1, 'meter', 400, 200, 1.80, 'Regal A11', 'Mantelleitung PVC 0,6/1kV');
add('NYY-J 4x10', 'E-KBL-012', 'NYY-4G10-B2CA', 1, 1, 'meter', 120, 60, 8.50, 'Regal A12', 'Mantelleitung PVC 0,6/1kV');
add('NYCY 4x50/25', 'E-KBL-013', 'NYCY-4G50-25', 1, 2, 'meter', 50, 25, 52.00, 'Regal A13', 'EMV-gerecht geschirmt');
add('H07RN-F 3G2.5', 'E-KBL-014', 'H07RN-3G2.5-F', 1, 2, 'meter', 100, 50, 4.20, 'Regal A14', 'Gummischlauchleitung schwer');
add('H07RN-F 4G6', 'E-KBL-015', 'H07RN-4G6-F', 1, 2, 'meter', 80, 40, 9.80, 'Regal A15', 'Gummischlauchleitung schwer');
add('H05RR-F 3G1.0', 'E-KBL-016', 'H05RR-3G1.0-F', 1, 1, 'meter', 250, 125, 0.95, 'Regal A16', 'Schlauchleitung leicht');
add('H05VV-F 2G0.75', 'E-KBL-017', 'H05VV-2G0.75-F', 1, 1, 'meter', 300, 150, 0.65, 'Regal A17', 'Schlauchleitung flexibel');
add('LiYCY 4x0.5', 'E-KBL-018', 'LIYCY-4G0.5', 1, 3, 'meter', 200, 100, 1.20, 'Regal A18', 'Steuerleitung geschirmt');
add('LiYCY 8x0.5', 'E-KBL-019', 'LIYCY-8G0.5', 1, 3, 'meter', 150, 75, 2.40, 'Regal A19', 'Steuerleitung geschirmt');
add('NYCWY 4x35/16', 'E-KBL-020', 'NYCWY-4G35-16', 1, 2, 'meter', 60, 30, 38.00, 'Regal A20', 'EMV-gerecht geschirmt');

// ── LEITUNGEN (Kat 2) ──
add('NYM-J 3x1.5', 'E-LTG-001', 'NYM-3G1.5-B2CA', 2, 1, 'meter', 300, 150, 1.20, 'Regal B1', 'Mantelleitung halogenfrei');
add('NYM-J 5x1.5', 'E-LTG-002', 'NYM-5G1.5-B2CA', 2, 1, 'meter', 400, 200, 2.10, 'Regal B2', 'Mantelleitung halogenfrei');
add('NYM-J 5x2.5', 'E-LTG-003', 'NYM-5G2.5-B2CA', 2, 1, 'meter', 250, 125, 3.40, 'Regal B3', 'Mantelleitung halogenfrei');
add('H05RR-F 2x0.75', 'E-LTG-004', 'H05RR-2G0.75-F', 2, 1, 'meter', 100, 50, 0.80, 'Regal B4', 'Schlauchleitung leicht');
add('H07RN-F 3G1.5', 'E-LTG-005', 'H07RN-3G1.5-F', 2, 2, 'meter', 120, 60, 3.40, 'Regal B5', 'Gummischlauchleitung schwer');
add('J-Y(ST)Y 2x2x0.8', 'E-LTG-006', 'JYSTY-2x2x0.8', 2, 3, 'meter', 500, 250, 0.90, 'Regal B6', 'Telefonleitung');
add('J-Y(ST)Y 4x2x0.8', 'E-LTG-007', 'JYSTY-4x2x0.8', 2, 3, 'meter', 300, 150, 1.50, 'Regal B7', 'Telefonleitung');
add('LiYY 2x0.25', 'E-LTG-008', 'LIYY-2G0.25', 2, 3, 'meter', 200, 100, 0.55, 'Regal B8', 'Steuerleitung flexibel');
add('LiYY 5x0.25', 'E-LTG-009', 'LIYY-5G0.25', 2, 3, 'meter', 150, 75, 0.95, 'Regal B9', 'Steuerleitung flexibel');
add('Cat.6 Verlegekabel U/UTP', 'E-LTG-010', 'CAT6-UUTP-4P', 2, 3, 'meter', 500, 250, 0.85, 'Regal B10', 'Netzwerkkabel Cat.6');
add('NYM-J 3x2.5', 'E-LTG-011', 'NYM-3G2.5-B2CA', 2, 1, 'meter', 350, 175, 1.90, 'Regal B11', 'Mantelleitung halogenfrei');
add('NYM-J 4x1.5', 'E-LTG-012', 'NYM-4G1.5-B2CA', 2, 1, 'meter', 300, 150, 2.50, 'Regal B12', 'Mantelleitung halogenfrei');
add('NYM-J 5x4', 'E-LTG-013', 'NYM-5G4-B2CA', 2, 1, 'meter', 180, 90, 5.20, 'Regal B13', 'Mantelleitung halogenfrei');
add('Cat.6A Verlegekabel S/FTP', 'E-LTG-014', 'CAT6A-SFTP-4P', 2, 3, 'meter', 300, 150, 1.40, 'Regal B14', 'Netzwerkkabel Cat.6A geschirmt');
add('Cat.7 Verlegekabel S/FTP', 'E-LTG-015', 'CAT7-SFTP-4P', 2, 3, 'meter', 200, 100, 2.20, 'Regal B15', 'Netzwerkkabel Cat.7 geschirmt');
add('J-Y(ST)Y 6x2x0.8', 'E-LTG-016', 'JYSTY-6x2x0.8', 2, 3, 'meter', 250, 125, 2.10, 'Regal B16', 'Telefonleitung');
add('LiYY 8x0.25', 'E-LTG-017', 'LIYY-8G0.25', 2, 3, 'meter', 120, 60, 1.35, 'Regal B17', 'Steuerleitung flexibel');
add('LiYY 12x0.25', 'E-LTG-018', 'LIYY-12G0.25', 2, 3, 'meter', 100, 50, 1.80, 'Regal B18', 'Steuerleitung flexibel');
add('H05RR-F 3G1.0', 'E-LTG-019', 'H05RR-3G1.0-F', 2, 1, 'meter', 150, 75, 0.90, 'Regal B19', 'Schlauchleitung leicht');
add('H07RN-F 4G4', 'E-LTG-020', 'H07RN-4G4-F', 2, 2, 'meter', 90, 45, 7.50, 'Regal B20', 'Gummischlauchleitung schwer');

// ── KLEMMEN (Kat 3) ──
add('WAGO 221-415 5-polig', 'E-KLE-001', 'WAGO-221-415', 3, 1, 'stueck', 200, 100, 0.45, 'Regal C1', 'Dosenklemme 5-polig');
add('WAGO 221-413 3-polig', 'E-KLE-002', 'WAGO-221-413', 3, 1, 'stueck', 300, 150, 0.35, 'Regal C2', 'Dosenklemme 3-polig');
add('WAGO 221-412 2-polig', 'E-KLE-003', 'WAGO-221-412', 3, 1, 'stueck', 250, 125, 0.25, 'Regal C3', 'Dosenklemme 2-polig');
add('Lüsterklemme 4mm²', 'E-KLE-004', 'LK-4.0-POLY', 3, 1, 'stueck', 150, 75, 0.12, 'Regal C4', 'Polyamid transparent');
add('Lüsterklemme 6mm²', 'E-KLE-005', 'LK-6.0-POLY', 3, 1, 'stueck', 100, 50, 0.18, 'Regal C5', 'Polyamid transparent');
add('Klemmblock 10mm²', 'E-KLE-006', 'KB-10.0-BRASS', 3, 2, 'stueck', 80, 40, 0.85, 'Regal C6', 'Messing Hutschiene');
add('Klemmblock 16mm²', 'E-KLE-007', 'KB-16.0-BRASS', 3, 2, 'stueck', 60, 30, 1.20, 'Regal C7', 'Messing Hutschiene');
add('Aderendhülsen isoliert 1.5mm²', 'E-KLE-008', 'AEH-1.5-ISO-1000', 3, 1, 'stueck', 1000, 500, 0.03, 'Regal C8', 'VPE 1000 Stück');
add('Aderendhülsen isoliert 2.5mm²', 'E-KLE-009', 'AEH-2.5-ISO-1000', 3, 1, 'stueck', 800, 400, 0.04, 'Regal C9', 'VPE 1000 Stück');
add('Aderendhülsen isoliert 4mm²', 'E-KLE-010', 'AEH-4.0-ISO-500', 3, 1, 'stueck', 500, 250, 0.06, 'Regal C10', 'VPE 500 Stück');
add('WAGO 773-164 3-polig', 'E-KLE-011', 'WAGO-773-164', 3, 1, 'stueck', 150, 75, 0.28, 'Regal C11', 'Verbindungsklemme 3-polig');
add('WAGO 773-168 8-polig', 'E-KLE-012', 'WAGO-773-168', 3, 1, 'stueck', 100, 50, 0.55, 'Regal C12', 'Verbindungsklemme 8-polig');
add('WAGO 222-415 5-polig', 'E-KLE-013', 'WAGO-222-415', 3, 1, 'stueck', 120, 60, 0.50, 'Regal C13', 'Hebelklemme 5-polig');
add('Klemmblock 25mm²', 'E-KLE-014', 'KB-25.0-BRASS', 3, 2, 'stueck', 40, 20, 1.80, 'Regal C14', 'Messing Hutschiene');
add('Klemmblock 35mm²', 'E-KLE-015', 'KB-35.0-BRASS', 3, 2, 'stueck', 30, 15, 2.50, 'Regal C15', 'Messing Hutschiene');
add('Aderendhülsen unisoliert 1.5mm²', 'E-KLE-016', 'AEH-1.5-UNI-1000', 3, 1, 'stueck', 800, 400, 0.02, 'Regal C16', 'VPE 1000 Stück');
add('Aderendhülsen unisoliert 2.5mm²', 'E-KLE-017', 'AEH-2.5-UNI-1000', 3, 1, 'stueck', 600, 300, 0.03, 'Regal C17', 'VPE 1000 Stück');
add('Aderendhülsen unisoliert 6mm²', 'E-KLE-018', 'AEH-6.0-UNI-500', 3, 1, 'stueck', 400, 200, 0.05, 'Regal C18', 'VPE 500 Stück');
add('Lüsterklemme 2.5mm²', 'E-KLE-019', 'LK-2.5-POLY', 3, 1, 'stueck', 200, 100, 0.08, 'Regal C19', 'Polyamid transparent');
add('Isolierhülse 2.5mm² rot', 'E-KLE-020', 'IH-2.5-RT-100', 3, 1, 'stueck', 300, 150, 0.04, 'Regal C20', 'VPE 100 Stück rot');

// ── ABZWEIGDOSEN (Kat 4) ──
add('Hohlwanddose 60mm tief', 'E-ABD-001', 'HW60-DEEP-PP', 4, 1, 'stueck', 150, 75, 0.65, 'Regal D1', 'Tiefe Dose Schraubdeckel');
add('Hohlwanddose 50mm', 'E-ABD-002', 'HW50-SHAL-PP', 4, 1, 'stueck', 200, 100, 0.55, 'Regal D2', 'Standard Dose Schraubdeckel');
add('Hohlwanddose 40mm flach', 'E-ABD-003', 'HW40-FLAT-PP', 4, 1, 'stueck', 100, 50, 0.45, 'Regal D3', 'Flache Dose Schraubdeckel');
add('Unterputzdose 60mm', 'E-ABD-004', 'UP60-DEEP-PP', 4, 1, 'stueck', 100, 50, 0.40, 'Regal D4', 'UP Dose tief');
add('Unterputzdose 50mm', 'E-ABD-005', 'UP50-SHAL-PP', 4, 1, 'stueck', 120, 60, 0.35, 'Regal D5', 'UP Dose standard');
add('Abzweigdose IP65 80x80', 'E-ABD-006', 'AZD-80x80-IP65', 4, 2, 'stueck', 60, 30, 2.80, 'Regal D6', 'Feuchtraum Gummidichtung');
add('Abzweigdose IP65 100x100', 'E-ABD-007', 'AZD-100x100-IP65', 4, 2, 'stueck', 40, 20, 4.50, 'Regal D7', 'Feuchtraum Gummidichtung');
add('Kabelabzweigkasten 120x80', 'E-ABD-008', 'KAK-120x80-IP55', 4, 2, 'stueck', 30, 15, 6.80, 'Regal D8', 'IP55 mit Klemmen');
add('Hohlwanddose Schalterdose 60mm', 'E-ABD-009', 'HW60-SD-PP', 4, 1, 'stueck', 150, 75, 0.70, 'Regal D9', 'Mit Schraubkrallen');
add('Gerätedose 1-fach', 'E-ABD-010', 'GD-1F-60-PP', 4, 1, 'stueck', 200, 100, 0.50, 'Regal D10', 'Universal Gerätedose');
add('Hohlwanddose 68mm tief', 'E-ABD-011', 'HW68-DEEP-PP', 4, 1, 'stueck', 80, 40, 0.75, 'Regal D11', 'Extra tief Schraubdeckel');
add('Hohlwanddose 47mm', 'E-ABD-012', 'HW47-SHAL-PP', 4, 1, 'stueck', 150, 75, 0.48, 'Regal D12', 'Standard Dose Schraubdeckel');
add('Unterputzdose 47mm flach', 'E-ABD-013', 'UP47-FLAT-PP', 4, 1, 'stueck', 80, 40, 0.32, 'Regal D13', 'UP Dose flach');
add('Abzweigdose IP65 125x125', 'E-ABD-014', 'AZD-125x125-IP65', 4, 2, 'stueck', 25, 12, 7.20, 'Regal D14', 'Feuchtraum Gummidichtung');
add('Kabelabzweigkasten 190x140', 'E-ABD-015', 'KAK-190x140-IP55', 4, 2, 'stueck', 20, 10, 12.50, 'Regal D15', 'IP55 mit Klemmen');
add('Gerätedose 2-fach', 'E-ABD-016', 'GD-2F-60-PP', 4, 1, 'stueck', 120, 60, 0.65, 'Regal D16', 'Universal Gerätedose');
add('Gerätedose 3-fach', 'E-ABD-017', 'GD-3F-60-PP', 4, 1, 'stueck', 80, 40, 0.80, 'Regal D17', 'Universal Gerätedose');
add('Hohlwanddose 71mm tief', 'E-ABD-018', 'HW71-DEEP-PP', 4, 1, 'stueck', 60, 30, 0.85, 'Regal D18', 'Tiefe Dose Schraubdeckel');
add('Abzweigdose IP44 80x80', 'E-ABD-019', 'AZD-80x80-IP44', 4, 2, 'stueck', 40, 20, 1.80, 'Regal D19', 'Spritzwassergeschützt');
add('Kabelabzweigkasten 75x75', 'E-ABD-020', 'KAK-75x75-IP55', 4, 2, 'stueck', 50, 25, 4.20, 'Regal D20', 'IP55 mit Klemmen');

// ── SCHALTER/DOSEN (Kat 5) ──
add('Schuko-Steckdose weiß', 'E-SDA-001', 'SCHUKO-16A-WS', 5, 1, 'stueck', 100, 50, 3.20, 'Regal E1', '16A weiß UP');
add('Schuko-Steckdose anthrazit', 'E-SDA-002', 'SCHUKO-16A-AN', 5, 1, 'stueck', 60, 30, 4.50, 'Regal E2', '16A anthrazit UP');
add('Schalter Wechselschaltung', 'E-SDA-003', 'SW-WECH-10A-WS', 5, 1, 'stueck', 80, 40, 2.50, 'Regal E3', '10A Wechselschaltung UP');
add('Schalter Serienschaltung', 'E-SDA-004', 'SW-SER-10A-WS', 5, 1, 'stueck', 60, 30, 3.80, 'Regal E4', '10A Serienschaltung UP');
add('Schalter Kreuzschaltung', 'E-SDA-005', 'SW-KR-10A-WS', 5, 1, 'stueck', 40, 20, 4.20, 'Regal E5', '10A Kreuzschaltung UP');
add('Taster beleuchtet', 'E-SDA-006', 'TAST-BEL-LED-WS', 5, 2, 'stueck', 40, 20, 4.50, 'Regal E6', 'LED-Beleuchtung UP');
add('Doppel-Schuko-Steckdose', 'E-SDA-007', 'DSCHUKO-16A-WS', 5, 1, 'stueck', 50, 25, 5.80, 'Regal E7', '2-fach 16A weiß UP');
add('RJ45 Dose Cat.6', 'E-SDA-008', 'RJ45-CAT6-UP', 5, 3, 'stueck', 50, 25, 8.90, 'Regal E8', 'Netzwerkdose Cat.6 UP');
add('RJ45 Dose Cat.6A', 'E-SDA-009', 'RJ45-CAT6A-UP', 5, 3, 'stueck', 30, 15, 12.50, 'Regal E9', 'Netzwerkdose Cat.6A UP');
add('TV/SAT Dose 3-fach', 'E-SDA-010', 'TV-SAT-3F-UP', 5, 3, 'stueck', 25, 12, 15.00, 'Regal E10', 'TV+SAT+Radio Enddose');
add('Schuko-Steckdose USB-A+C', 'E-SDA-011', 'SCHUKO-USB-WS', 5, 1, 'stueck', 40, 20, 18.50, 'Regal E11', 'Mit USB-A und USB-C Ladeports');
add('Schalter Treppenhaus', 'E-SDA-012', 'SW-TH-10A-WS', 5, 1, 'stueck', 50, 25, 3.20, 'Regal E12', '10A Treppenhausautomat UP');
add('Taster unbeleuchtet', 'E-SDA-013', 'TAST-UNB-WS', 5, 1, 'stueck', 60, 30, 2.80, 'Regal E13', 'Taster UP weiß');
add('Dreifach-Schuko-Steckdose', 'E-SDA-014', 'TSCHUKO-16A-WS', 5, 1, 'stueck', 30, 15, 8.50, 'Regal E14', '3-fach 16A weiß UP');
add('Schuko-Steckdose mit Klappdeckel', 'E-SDA-015', 'SCHUKO-KD-WS', 5, 1, 'stueck', 35, 18, 5.20, 'Regal E15', 'IP44 Klappdeckel weiß');
add('Schalter Wechsel weiß', 'E-SDA-016', 'SW-WECH-10A-AN', 5, 1, 'stueck', 40, 20, 3.50, 'Regal E16', '10A Wechselschaltung anthrazit');
add('Klingeltaster beleuchtet', 'E-SDA-017', 'KLT-BEL-LED-WS', 5, 2, 'stueck', 25, 12, 5.80, 'Regal E17', 'LED Klingeltaster UP');
add('RJ45 Dose Cat.5e', 'E-SDA-018', 'RJ45-CAT5E-UP', 5, 3, 'stueck', 40, 20, 6.50, 'Regal E18', 'Netzwerkdose Cat.5e UP');
add('USB Ladestation 2-fach', 'E-SDA-019', 'USB-LAD-2F-WS', 5, 1, 'stueck', 20, 10, 22.00, 'Regal E19', '2 USB-A Ports weiß UP');
add('Bewegungsmelder 180°', 'E-SDA-020', 'BM-180-WS', 5, 2, 'stueck', 15, 8, 28.00, 'Regal E20', '180° Bewegungsmelder UP');

// ── BELEUCHTUNG (Kat 6) ──
add('LED Panel 60x60 4000K 36W', 'E-BEL-001', 'LED-6060-40K-36W', 6, 2, 'stueck', 30, 15, 45.00, 'Regal F1', '36W 4000K Rahmen weiß');
add('LED Panel 62x62 4000K 40W', 'E-BEL-002', 'LED-6262-40K-40W', 6, 2, 'stueck', 20, 10, 52.00, 'Regal F2', '40W 4000K Systemdecke');
add('LED Downlight 10W 3000K', 'E-BEL-003', 'LED-DL-10W-30K', 6, 2, 'stueck', 40, 20, 18.50, 'Regal F3', '10W 3000K Einbau');
add('LED Downlight 15W 4000K', 'E-BEL-004', 'LED-DL-15W-40K', 6, 2, 'stueck', 30, 15, 24.00, 'Regal F4', '15W 4000K Einbau');
add('LED Röhre 150cm 24W', 'E-BEL-005', 'LED-ROE-150-24W-40K', 6, 2, 'stueck', 50, 25, 22.00, 'Regal F5', '150cm 24W 4000K');
add('LED Röhre 120cm 18W', 'E-BEL-006', 'LED-ROE-120-18W-40K', 6, 2, 'stueck', 60, 30, 18.00, 'Regal F6', '120cm 18W 4000K');
add('Notleuchte LED 3h', 'E-BEL-007', 'NL-LED-3H-AUTO', 6, 2, 'stueck', 20, 10, 65.00, 'Regal F7', 'Autotest 3h Akku Deckenmontage');
add('Notleuchte LED Wand 1h', 'E-BEL-008', 'NL-LED-W1H', 6, 2, 'stueck', 15, 8, 45.00, 'Regal F8', 'Wandmontage 1h Akku');
add('LED Streifen 5m 3000K', 'E-BEL-009', 'LED-STR-5M-30K', 6, 2, 'stueck', 25, 12, 28.00, 'Regal F9', '5m selbstklebend 3000K');
add('LED Streifen 5m RGB', 'E-BEL-010', 'LED-STR-5M-RGB', 6, 2, 'stueck', 20, 10, 32.00, 'Regal F10', '5m selbstklebend RGB');
add('LED Panel 30x30 4000K 18W', 'E-BEL-011', 'LED-3030-40K-18W', 6, 2, 'stueck', 35, 18, 28.00, 'Regal F11', '18W 4000K klein');
add('LED Downlight 20W 4000K', 'E-BEL-012', 'LED-DL-20W-40K', 6, 2, 'stueck', 25, 12, 32.00, 'Regal F12', '20W 4000K Einbau');
add('LED Röhre 60cm 9W', 'E-BEL-013', 'LED-ROE-60-9W-40K', 6, 2, 'stueck', 80, 40, 9.50, 'Regal F13', '60cm 9W 4000K');
add('LED Spot GU10 5W 2700K', 'E-BEL-014', 'LED-GU10-5W-27K', 6, 2, 'stueck', 100, 50, 4.50, 'Regal F14', 'GU10 5W 2700K dimmbar');
add('LED Spot GU10 7W 4000K', 'E-BEL-015', 'LED-GU10-7W-40K', 6, 2, 'stueck', 80, 40, 6.20, 'Regal F15', 'GU10 7W 4000K dimmbar');
add('LED Fluter 50W 4000K', 'E-BEL-016', 'LED-FL-50W-40K', 6, 2, 'stueck', 15, 8, 35.00, 'Regal F16', '50W 4000K Außen IP65');
add('LED Fluter 100W 4000K', 'E-BEL-017', 'LED-FL-100W-40K', 6, 2, 'stueck', 10, 5, 55.00, 'Regal F17', '100W 4000K Außen IP65');
add('Notleuchte Rettungszeichen', 'E-BEL-018', 'NL-RETT-LED-3H', 6, 2, 'stueck', 12, 6, 78.00, 'Regal F18', 'Rettungszeichen LED 3h');
add('LED Streifen 10m 4000K', 'E-BEL-019', 'LED-STR-10M-40K', 6, 2, 'stueck', 15, 8, 45.00, 'Regal F19', '10m selbstklebend 4000K');
add('LED Einbaustrahler 7W dimmbar', 'E-BEL-020', 'LED-ES-7W-DIM-40K', 6, 2, 'stueck', 40, 20, 16.50, 'Regal F20', '7W 4000K dimmbar schwenkbar');

// ── SCHIENEN/SICHERUNGEN (Kat 7) ──
add('Hutschiene 35x7.5 2m', 'E-SCH-001', 'HS-35x7.5-STZN-2M', 7, 1, 'meter', 100, 50, 4.20, 'Regal G1', 'Stahl verzinkt 35x7.5mm');
add('Hutschiene 35x15 2m', 'E-SCH-002', 'HS-35x15-STZN-2M', 7, 1, 'meter', 80, 40, 6.80, 'Regal G2', 'Stahl verzinkt 35x15mm schwer');
add('Endkappe Hutschiene', 'E-SCH-003', 'EK-HS-35-PVC', 7, 1, 'stueck', 200, 100, 0.25, 'Regal G3', 'PVC für 35mm Hutschiene');
add('Sicherung 16A B', 'E-SCH-004', 'SIC-16A-B-LS', 7, 2, 'stueck', 100, 50, 8.50, 'Regal G4', 'LS B-Charakteristik 16A');
add('Sicherung 20A B', 'E-SCH-005', 'SIC-20A-B-LS', 7, 2, 'stueck', 80, 40, 8.50, 'Regal G5', 'LS B-Charakteristik 20A');
add('Sicherung 25A B', 'E-SCH-006', 'SIC-25A-B-LS', 7, 2, 'stueck', 60, 30, 8.50, 'Regal G6', 'LS B-Charakteristik 25A');
add('Sicherung 32A B', 'E-SCH-007', 'SIC-32A-B-LS', 7, 2, 'stueck', 50, 25, 9.20, 'Regal G7', 'LS B-Charakteristik 32A');
add('FI-Schalter 40/30mA', 'E-SCH-008', 'FI-40A-30MA-2P', 7, 2, 'stueck', 30, 15, 45.00, 'Regal G8', '2-polig 40A 30mA Typ A');
add('FI-Schalter 63/30mA', 'E-SCH-009', 'FI-63A-30MA-4P', 7, 2, 'stueck', 20, 10, 68.00, 'Regal G9', '4-polig 63A 30mA Typ A');
add('Hauptschalter 63A 3P', 'E-SCH-010', 'HS-63A-3P', 7, 2, 'stueck', 15, 8, 35.00, 'Regal G10', '3-polig 63A Lasttrennschalter');
add('Sicherung 10A B', 'E-SCH-011', 'SIC-10A-B-LS', 7, 2, 'stueck', 120, 60, 8.50, 'Regal G11', 'LS B-Charakteristik 10A');
add('Sicherung 13A B', 'E-SCH-012', 'SIC-13A-B-LS', 7, 2, 'stueck', 100, 50, 8.50, 'Regal G12', 'LS B-Charakteristik 13A');
add('Sicherung 16A C', 'E-SCH-013', 'SIC-16A-C-LS', 7, 2, 'stueck', 80, 40, 8.80, 'Regal G13', 'LS C-Charakteristik 16A');
add('Sicherung 20A C', 'E-SCH-014', 'SIC-20A-C-LS', 7, 2, 'stueck', 70, 35, 8.80, 'Regal G14', 'LS C-Charakteristik 20A');
add('FI-Schalter 25/30mA', 'E-SCH-015', 'FI-25A-30MA-2P', 7, 2, 'stueck', 40, 20, 38.00, 'Regal G15', '2-polig 25A 30mA Typ A');
add('FI-Schalter 40/300mA', 'E-SCH-016', 'FI-40A-300MA-4P', 7, 2, 'stueck', 15, 8, 72.00, 'Regal G16', '4-polig 40A 300mA Typ B');
add('Hauptschalter 100A 3P', 'E-SCH-017', 'HS-100A-3P', 7, 2, 'stueck', 10, 5, 48.00, 'Regal G17', '3-polig 100A Lasttrennschalter');
add('Sammelschiene 3-phasig 12 Mod', 'E-SCH-018', 'SS-3PH-12M', 7, 2, 'stueck', 30, 15, 12.00, 'Regal G18', '3-phasig 12 Module');
add('Sammelschiene 3-phasig 18 Mod', 'E-SCH-019', 'SS-3PH-18M', 7, 2, 'stueck', 20, 10, 16.00, 'Regal G19', '3-phasig 18 Module');
add('Endkappe Sammelschiene', 'E-SCH-020', 'EK-SS-3PH', 7, 2, 'stueck', 50, 25, 1.20, 'Regal G20', 'Isolierte Endkappe');

// ── ZAEHLERSCHRAENKE (Kat 8) ──
add('Zaehlerschrank 1-feldig AP', 'E-ZS-001', 'ZS-1F-AP-IP30', 8, 1, 'stueck', 20, 10, 45.00, 'Regal H1', 'Aufputz 1-Feld IP30 Stahlblech');
add('Zaehlerschrank 3-feldig AP', 'E-ZS-002', 'ZS-3F-AP-IP30', 8, 1, 'stueck', 15, 8, 65.00, 'Regal H2', 'Aufputz 3-Felder IP30');
add('Zaehlerschrank 5-feldig AP', 'E-ZS-003', 'ZS-5F-AP-IP30', 8, 1, 'stueck', 12, 6, 85.00, 'Regal H3', 'Aufputz 5-Felder IP30');
add('Zaehlerschrank 8-feldig AP', 'E-ZS-004', 'ZS-8F-AP-IP30', 8, 1, 'stueck', 10, 5, 110.00, 'Regal H4', 'Aufputz 8-Felder IP30');
add('Zaehlerschrank 12-feldig AP', 'E-ZS-005', 'ZS-12F-AP-IP30', 8, 1, 'stueck', 8, 4, 145.00, 'Regal H5', 'Aufputz 12-Felder IP30');
add('Zaehlerschrank 3-feldig UP', 'E-ZS-006', 'ZS-3F-UP-IP30', 8, 2, 'stueck', 10, 5, 75.00, 'Regal H6', 'Unterputz 3-Felder IP30');
add('Zaehlerschrank 5-feldig UP', 'E-ZS-007', 'ZS-5F-UP-IP30', 8, 2, 'stueck', 8, 4, 95.00, 'Regal H7', 'Unterputz 5-Felder IP30');
add('Zaehlerschrank 8-feldig UP', 'E-ZS-008', 'ZS-8F-UP-IP30', 8, 2, 'stueck', 6, 3, 125.00, 'Regal H8', 'Unterputz 8-Felder IP30');
add('Zaehlerschrank 12-feldig UP', 'E-ZS-009', 'ZS-12F-UP-IP30', 8, 2, 'stueck', 5, 3, 165.00, 'Regal H9', 'Unterputz 12-Felder IP30');
add('Kleinverteiler 2-reihig 24PLE', 'E-ZS-010', 'VERT-2R-24PLE', 8, 1, 'stueck', 10, 5, 55.00, 'Regal H10', 'Kleinverteiler 2-reihig 24 PLE');
add('Zaehlerschrank 1-feldig UP', 'E-ZS-011', 'ZS-1F-UP-IP30', 8, 2, 'stueck', 15, 8, 55.00, 'Regal H11', 'Unterputz 1-Feld IP30');
add('Zaehlerschrank 16-feldig AP', 'E-ZS-012', 'ZS-16F-AP-IP30', 8, 1, 'stueck', 5, 3, 185.00, 'Regal H12', 'Aufputz 16-Felder IP30');
add('Kleinverteiler 1-reihig 12PLE', 'E-ZS-013', 'VERT-1R-12PLE', 8, 1, 'stueck', 15, 8, 32.00, 'Regal H13', 'Kleinverteiler 1-reihig 12 PLE');
add('Kleinverteiler 3-reihig 36PLE', 'E-ZS-014', 'VERT-3R-36PLE', 8, 1, 'stueck', 8, 4, 78.00, 'Regal H14', 'Kleinverteiler 3-reihig 36 PLE');
add('Zaehlerschrank 2-feldig AP', 'E-ZS-015', 'ZS-2F-AP-IP30', 8, 1, 'stueck', 12, 6, 52.00, 'Regal H15', 'Aufputz 2-Felder IP30');
add('Zaehlerschrank 4-feldig UP', 'E-ZS-016', 'ZS-4F-UP-IP30', 8, 2, 'stueck', 8, 4, 85.00, 'Regal H16', 'Unterputz 4-Felder IP30');
add('Kleinverteiler 4-reihig 48PLE', 'E-ZS-017', 'VERT-4R-48PLE', 8, 1, 'stueck', 5, 3, 95.00, 'Regal H17', 'Kleinverteiler 4-reihig 48 PLE');
add('Zaehlerschrank 6-feldig AP', 'E-ZS-018', 'ZS-6F-AP-IP30', 8, 1, 'stueck', 8, 4, 98.00, 'Regal H18', 'Aufputz 6-Felder IP30');
add('Kleinverteiler mit Tür 2-reihig', 'E-ZS-019', 'VERT-TUR-2R-24', 8, 1, 'stueck', 6, 3, 68.00, 'Regal H19', 'Mit Tür 2-reihig 24 PLE');
add('Zaehlerschrank 20-feldig AP', 'E-ZS-020', 'ZS-20F-AP-IP30', 8, 1, 'stueck', 3, 2, 220.00, 'Regal H20', 'Aufputz 20-Felder IP30');

// ── KABELKANAELE (Kat 9) ──
add('Kabelkanal PVC 15x10', 'E-KK-001', 'KK-PVC-15x10-WE', 9, 1, 'meter', 200, 100, 1.20, 'Regal I1', 'PVC weiß mit Deckel selbstklebend');
add('Kabelkanal PVC 25x16', 'E-KK-002', 'KK-PVC-25x16-WE', 9, 1, 'meter', 150, 75, 1.80, 'Regal I2', 'PVC weiß mit Deckel selbstklebend');
add('Kabelkanal PVC 40x25', 'E-KK-003', 'KK-PVC-40x25-WE', 9, 1, 'meter', 100, 50, 3.20, 'Regal I3', 'PVC weiß mit Deckel selbstklebend');
add('Kabelkanal PVC 60x40', 'E-KK-004', 'KK-PVC-60x40-WE', 9, 1, 'meter', 60, 30, 5.50, 'Regal I4', 'PVC weiß mit Deckel');
add('Kabelkanal Stahl 35x50', 'E-KK-005', 'KK-ST-35x50-FZ', 9, 2, 'meter', 80, 40, 8.50, 'Regal I5', 'Stahl feuerverzinkt mit Deckel');
add('Kabelkanal Stahl 60x40', 'E-KK-006', 'KK-ST-60x40-FZ', 9, 2, 'meter', 60, 30, 12.00, 'Regal I6', 'Stahl feuerverzinkt mit Deckel');
add('Kabelkanal Alu 50x30', 'E-KK-007', 'KK-AL-50x30-EL', 9, 3, 'meter', 50, 25, 9.80, 'Regal I7', 'Aluminium eloxiert mit Deckel');
add('Leitungsfuehrungskanal 60x60', 'E-KK-008', 'LFK-60x60-ST', 9, 2, 'meter', 40, 20, 15.00, 'Regal I8', 'Stahl schwerlast mit Deckel');
add('Bodenkanal BK 70', 'E-KK-009', 'BK-70-ALU-EL', 9, 3, 'meter', 30, 15, 28.00, 'Regal I9', 'Aluminium Bodenkanal 70mm breit');
add('Kabelbinder schwarz 100x2.5', 'E-KK-010', 'KB-100x2.5-SW', 9, 1, 'stueck', 1000, 500, 0.02, 'Regal I10', 'Nylon UV-stabil 100mm lang');
add('Kabelkanal PVC 12x12', 'E-KK-011', 'KK-PVC-12x12-WE', 9, 1, 'meter', 300, 150, 0.80, 'Regal I11', 'PVC weiß mit Deckel');
add('Kabelkanal PVC 20x10', 'E-KK-012', 'KK-PVC-20x10-WE', 9, 1, 'meter', 250, 125, 1.00, 'Regal I12', 'PVC weiß mit Deckel');
add('Kabelkanal Stahl 100x50', 'E-KK-013', 'KK-ST-100x50-FZ', 9, 2, 'meter', 40, 20, 18.00, 'Regal I13', 'Stahl feuerverzinkt mit Deckel');
add('Kabelkanal Alu 75x50', 'E-KK-014', 'KK-AL-75x50-EL', 9, 3, 'meter', 30, 15, 14.50, 'Regal I14', 'Aluminium eloxiert mit Deckel');
add('Kabelbinder schwarz 140x3.6', 'E-KK-015', 'KB-140x3.6-SW', 9, 1, 'stueck', 800, 400, 0.03, 'Regal I15', 'Nylon UV-stabil 140mm lang');
add('Kabelbinder schwarz 200x4.8', 'E-KK-016', 'KB-200x4.8-SW', 9, 1, 'stueck', 500, 250, 0.05, 'Regal I16', 'Nylon UV-stabil 200mm lang');
add('Kabelbinder wiederlösbar', 'E-KK-017', 'KB-WIED-150-SW', 9, 1, 'stueck', 300, 150, 0.08, 'Regal I17', 'Wiederlösbar 150mm');
add('Kabelkanal Verbindungsstück 25x16', 'E-KK-018', 'KK-VB-25x16-WE', 9, 1, 'stueck', 100, 50, 0.35, 'Regal I18', 'PVC Verbindung');
add('Kabelkanal T-Stück 25x16', 'E-KK-019', 'KK-T-25x16-WE', 9, 1, 'stueck', 80, 40, 0.65, 'Regal I19', 'PVC T-Stück');
add('Kabelkanal Endstück 25x16', 'E-KK-020', 'KK-END-25x16-WE', 9, 1, 'stueck', 120, 60, 0.25, 'Regal I20', 'PVC Endstück');

// ── ERdung (Kat 10) ──
add('Erdungsstange Cu 1.5m', 'E-ERD-001', 'ES-CU-1.5M-16MM', 10, 2, 'stueck', 30, 15, 18.50, 'Regal J1', 'Kupfer 1.5m 16mm Durchmesser');
add('Erdungsband Cu 30x3', 'E-ERD-002', 'EB-CU-30x3-R50', 10, 2, 'meter', 100, 50, 4.20, 'Regal J2', 'Kupferband 30x3mm Ring 50m');
add('Erdungsklemme NYY 5x16', 'E-ERD-003', 'EK-NYY-5G16', 10, 1, 'stueck', 50, 25, 6.80, 'Regal J3', 'Haupt Erdungsklemme NYY 5x16');
add('Potentialausgleichsschiene', 'E-ERD-004', 'PAS-6x16-CU', 10, 2, 'stueck', 40, 20, 12.00, 'Regal J4', '6 Anschlüsse 16mm² Kupfer');
add('Erdungswinkel St/tZn', 'E-ERD-005', 'EW-ST-TZN-90', 10, 2, 'stueck', 60, 30, 2.50, 'Regal J5', 'Stahl verzinkt 90 Grad M10');
add('Blitzschutz Ableiter T1+T2', 'E-ERD-006', 'BS-T1T2-255', 10, 3, 'stueck', 15, 8, 85.00, 'Regal J6', 'Kombiableiter Typ 1+2 255V');
add('Potentialausgleich Erdungsbox', 'E-ERD-007', 'PAE-BOX-IP65', 10, 2, 'stueck', 25, 12, 22.00, 'Regal J7', 'Klemmenbox 8 Anschlüsse IP65');
add('Fundamenterder FeCu 1m', 'E-ERD-008', 'FE-FECU-1M-20MM', 10, 2, 'stueck', 20, 10, 28.00, 'Regal J8', 'Feuerverzinkt/Stahl 1m 20mm');
add('Erdungsklemme CuZn M8', 'E-ERD-009', 'EK-CUZN-M8', 10, 2, 'stueck', 40, 20, 3.20, 'Regal J9', 'Kupfer/Zink M8 Anschluss');
add('Erdungsring 16mm² 2m', 'E-ERD-010', 'ER-16MM-2M', 10, 2, 'stueck', 25, 12, 15.00, 'Regal J10', 'Ring 2m mit Klemme 16mm²');
add('Erdungsstange Cu 2m', 'E-ERD-011', 'ES-CU-2M-16MM', 10, 2, 'stueck', 20, 10, 24.00, 'Regal J11', 'Kupfer 2m 16mm Durchmesser');
add('Erdungsband Cu 25x3', 'E-ERD-012', 'EB-CU-25x3-R50', 10, 2, 'meter', 120, 60, 3.60, 'Regal J12', 'Kupferband 25x3mm Ring 50m');
add('Potentialausgleichsschiene 10-fach', 'E-ERD-013', 'PAS-10x16-CU', 10, 2, 'stueck', 25, 12, 18.00, 'Regal J13', '10 Anschlüsse 16mm² Kupfer');
add('Erdungsklemme NYY 4x10', 'E-ERD-014', 'EK-NYY-4G10', 10, 1, 'stueck', 40, 20, 5.50, 'Regal J14', 'Haupt Erdungsklemme NYY 4x10');
add('Blitzschutz Ableiter T2', 'E-ERD-015', 'BS-T2-255', 10, 3, 'stueck', 20, 10, 45.00, 'Regal J15', 'Ableiter Typ 2 255V');
add('Erdungsbuchse M10', 'E-ERD-016', 'EB-M10-CUZN', 10, 2, 'stueck', 50, 25, 1.80, 'Regal J16', 'M10 Kupfer/Zink');
add('Erdungswinkel verstellbar', 'E-ERD-017', 'EW-VER-TZN', 10, 2, 'stueck', 40, 20, 3.80, 'Regal J17', 'Stahl verzinkt verstellbar');
add('Potentialausgleich Erdungsbox 12', 'E-ERD-018', 'PAE-BOX-12-IP65', 10, 2, 'stueck', 15, 8, 28.00, 'Regal J18', 'Klemmenbox 12 Anschlüsse IP65');
add('Fundamenterder FeCu 1.5m', 'E-ERD-019', 'FE-FECU-1.5M-20MM', 10, 2, 'stueck', 15, 8, 38.00, 'Regal J19', 'Feuerverzinkt/Stahl 1.5m 20mm');
add('Erdungsband Al 30x3', 'E-ERD-020', 'EB-AL-30x3-R50', 10, 3, 'meter', 80, 40, 2.80, 'Regal J20', 'Aluminiumband 30x3mm Ring 50m');

// ── WERKZEUG (Kat 11) ──
add('Abisolierzange 0.2-6mm²', 'E-WZ-001', 'AZ-0.2-6.0-PRO', 11, 3, 'stueck', 15, 8, 24.50, 'Regal K1', 'Automatisch Knipex-Style');
add('Crimpzange 0.5-16mm²', 'E-WZ-002', 'CZ-0.5-16.0-RATCH', 11, 3, 'stueck', 10, 5, 45.00, 'Regal K2', 'Ratsche Aderendhülsen isoliert');
add('Spannungsprüfer 12-1000V', 'E-WZ-003', 'SP-12-1000V-NC', 11, 3, 'stueck', 20, 10, 32.00, 'Regal K3', 'Berührungslos NCV LED+Akustik');
add('Multimeter digital CAT III', 'E-WZ-004', 'MM-DIG-CAT3-600', 11, 3, 'stueck', 8, 4, 65.00, 'Regal K4', 'True RMS CAT III 600V NCV');
add('Kabelschere bis 32mm', 'E-WZ-005', 'KS-32MM-RATCH', 11, 3, 'stueck', 12, 6, 38.00, 'Regal K5', 'Ratsche Kabelschneider 32mm');
add('Lochsaegen Set 16-51mm', 'E-WZ-006', 'LS-SET-16-51-BIM', 11, 3, 'set', 8, 4, 55.00, 'Regal K6', 'Bi-Metall 6-teilig Adapter');
add('Drehmomentschluessel 5-25Nm', 'E-WZ-007', 'DS-5-25NM-1/4', 11, 3, 'stueck', 6, 3, 48.00, 'Regal K7', '1/4 Antrieb Umschaltknarre');
add('Kabelzieher Nylon 15m', 'E-WZ-008', 'KZ-NYL-15M', 11, 3, 'stueck', 10, 5, 18.00, 'Regal K8', 'Nylon 15m mit Schlaufe');
add('Isolierschraubendreher Set', 'E-WZ-009', 'ISD-SET-VDE-7', 11, 3, 'set', 12, 6, 35.00, 'Regal K9', 'VDE geprüft 7-teilig');
add('Digitaler Phasenprüfer', 'E-WZ-010', 'DPP-PHASE-LED', 11, 3, 'stueck', 15, 8, 12.50, 'Regal K10', 'Zweipolig LED-Anzeige');
add('Abisolierzange 0.08-6mm²', 'E-WZ-011', 'AZ-0.08-6.0-PRO', 11, 3, 'stueck', 12, 6, 28.00, 'Regal K11', 'Feinabisolierung automatisch');
add('Crimpzange 0.1-10mm²', 'E-WZ-012', 'CZ-0.1-10.0-RATCH', 11, 3, 'stueck', 8, 4, 38.00, 'Regal K12', 'Ratsche unisoliert');
add('Spannungsprüfer zweipolig', 'E-WZ-013', 'SP-2P-12-1000V', 11, 3, 'stueck', 25, 12, 18.00, 'Regal K13', 'Zweipolig LED+LCD');
add('Multimeter analog', 'E-WZ-014', 'MM-ANA-600V', 11, 3, 'stueck', 10, 5, 22.00, 'Regal K14', 'Analog 600V');
add('Kabelschere hydraulisch 40mm', 'E-WZ-015', 'KS-40MM-HYD', 11, 3, 'stueck', 5, 3, 120.00, 'Regal K15', 'Hydraulisch 40mm');
add('Lochsaege 68mm', 'E-WZ-016', 'LS-68-BIM', 11, 3, 'stueck', 15, 8, 12.00, 'Regal K16', 'Bi-Metall 68mm für Unterputzdosen');
add('Drehmomentschluessel 2-10Nm', 'E-WZ-017', 'DS-2-10NM-1/4', 11, 3, 'stueck', 8, 4, 35.00, 'Regal K17', '1/4 Antrieb Feinmechanik');
add('Kabelzieher Stahl 20m', 'E-WZ-018', 'KZ-ST-20M', 11, 3, 'stueck', 8, 4, 25.00, 'Regal K18', 'Stahl 20m mit Schlaufe');
add('Kombizange 180mm', 'E-WZ-019', 'KZ-180-ISO', 11, 3, 'stueck', 15, 8, 16.50, 'Regal K19', 'VDE isoliert 180mm');
add('Seitenschneider 160mm', 'E-WZ-020', 'SS-160-ISO', 11, 3, 'stueck', 18, 9, 14.00, 'Regal K20', 'VDE isoliert 160mm');

// ── MONTAGEMATERIAL (Kat 12) ──
add('Schraube TX25 5x50', 'E-MM-001', 'SCR-TX25-5x50', 12, 1, 'stueck', 500, 250, 0.05, 'Regal L1', 'Torx 25 5x50 verzinkt');
add('Schraube TX25 6x60', 'E-MM-002', 'SCR-TX25-6x60', 12, 1, 'stueck', 400, 200, 0.07, 'Regal L2', 'Torx 25 6x60 verzinkt');
add('Dübel 6mm universal', 'E-MM-003', 'DUEB-6-UNI-100', 12, 1, 'stueck', 1000, 500, 0.02, 'Regal L3', 'Universal 6mm VPE 100');
add('Dübel 8mm universal', 'E-MM-004', 'DUEB-8-UNI-100', 12, 1, 'stueck', 800, 400, 0.03, 'Regal L4', 'Universal 8mm VPE 100');
add('Dübel 10mm universal', 'E-MM-005', 'DUEB-10-UNI-50', 12, 1, 'stueck', 500, 250, 0.05, 'Regal L5', 'Universal 10mm VPE 50');
add('Hakenluester 80mm', 'E-MM-006', 'HL-80-STAHL', 12, 1, 'stueck', 200, 100, 0.15, 'Regal L6', 'Stahl verzinkt 80mm');
add('Schelle 16-20mm', 'E-MM-007', 'SCL-16-20-100', 12, 1, 'stueck', 300, 150, 0.08, 'Regal L7', 'Kabelschelle 16-20mm VPE 100');
add('Schelle 25-32mm', 'E-MM-008', 'SCL-25-32-100', 12, 1, 'stueck', 250, 125, 0.12, 'Regal L8', 'Kabelschelle 25-32mm VPE 100');
add('Montageklebeband 19mm', 'E-MM-009', 'MK-19-DBL-50', 12, 1, 'stueck', 100, 50, 3.50, 'Regal L9', 'Doppelseitig 19mm 50m');
add('Federstecker Hohlwand', 'E-MM-010', 'FS-HW-METALL', 12, 1, 'stueck', 300, 150, 0.10, 'Regal L10', 'Metall Hohlwandbefestigung');
add('Schraube TX30 8x80', 'E-MM-011', 'SCR-TX30-8x80', 12, 1, 'stueck', 300, 150, 0.10, 'Regal L11', 'Torx 30 8x80 verzinkt');
add('Dübel 12mm universal', 'E-MM-012', 'DUEB-12-UNI-50', 12, 1, 'stueck', 300, 150, 0.08, 'Regal L12', 'Universal 12mm VPE 50');
add('Dübel 14mm universal', 'E-MM-013', 'DUEB-14-UNI-25', 12, 1, 'stueck', 200, 100, 0.12, 'Regal L13', 'Universal 14mm VPE 25');
add('Hakenluester 50mm', 'E-MM-014', 'HL-50-STAHL', 12, 1, 'stueck', 300, 150, 0.10, 'Regal L14', 'Stahl verzinkt 50mm');
add('Schelle 10-14mm', 'E-MM-015', 'SCL-10-14-100', 12, 1, 'stueck', 400, 200, 0.06, 'Regal L15', 'Kabelschelle 10-14mm VPE 100');
add('Schelle 35-40mm', 'E-MM-016', 'SCL-35-40-50', 12, 1, 'stueck', 150, 75, 0.18, 'Regal L16', 'Kabelschelle 35-40mm VPE 50');
add('Montageklebeband 25mm', 'E-MM-017', 'MK-25-DBL-50', 12, 1, 'stueck', 80, 40, 4.50, 'Regal L17', 'Doppelseitig 25mm 50m');
add('Federstecker Gipskarton', 'E-MM-018', 'FS-GK-METALL', 12, 1, 'stueck', 400, 200, 0.08, 'Regal L18', 'Metall Gipskartonbefestigung');
add('Schraube Holz 4x40', 'E-MM-019', 'SCR-HZ-4x40', 12, 1, 'stueck', 600, 300, 0.03, 'Regal L19', 'Holzschraube 4x40 verzinkt');
add('Dübelrahmen 6x30', 'E-MM-020', 'DR-6x30-100', 12, 1, 'stueck', 500, 250, 0.04, 'Regal L20', 'Dübelrahmen 6x30 VPE 100');

// ── KOMMUNIKATION (Kat 13) ──
add('Patchkabel Cat.6 2m blau', 'E-KOM-001', 'PK-CAT6-2M-BL', 13, 3, 'stueck', 50, 25, 4.50, 'Regal M1', 'RJ45 2m blau Cat.6');
add('Patchkabel Cat.6 5m blau', 'E-KOM-002', 'PK-CAT6-5M-BL', 13, 3, 'stueck', 40, 20, 6.80, 'Regal M2', 'RJ45 5m blau Cat.6');
add('Patchkabel Cat.6 10m blau', 'E-KOM-003', 'PK-CAT6-10M-BL', 13, 3, 'stueck', 30, 15, 9.50, 'Regal M3', 'RJ45 10m blau Cat.6');
add('Patchpanel 24-port Cat.6', 'E-KOM-004', 'PP-24P-CAT6', 13, 3, 'stueck', 15, 8, 65.00, 'Regal M4', '19" 24 Port Cat.6');
add('Switch 8-port Gigabit', 'E-KOM-005', 'SW-8P-GBIT', 13, 3, 'stueck', 10, 5, 45.00, 'Regal M5', '8 Port Gigabit unmanaged');
add('Switch 16-port Gigabit', 'E-KOM-006', 'SW-16P-GBIT', 13, 3, 'stueck', 8, 4, 78.00, 'Regal M6', '16 Port Gigabit unmanaged');
add('WLAN Access Point', 'E-KOM-007', 'AP-WLAN-AC1200', 13, 3, 'stueck', 12, 6, 85.00, 'Regal M7', 'Dual-Band AC1200 PoE');
add('Koaxialkabel 75 Ohm 100m', 'E-KOM-008', 'KOAX-75-100', 13, 3, 'stueck', 20, 10, 45.00, 'Regal M8', '75 Ohm 100m Ring');
add('LWL Kabel OM3 4-faser', 'E-KOM-009', 'LWL-OM3-4F-500', 13, 3, 'stueck', 15, 8, 120.00, 'Regal M9', 'Multimode OM3 500m');
add('LWL Patchkabel LC-LC 3m', 'E-KOM-010', 'LWL-LCLC-3M-OM3', 13, 3, 'stueck', 25, 12, 15.00, 'Regal M10', 'Duplex LC-LC 3m OM3');
add('Patchkabel Cat.6A 2m rot', 'E-KOM-011', 'PK-CAT6A-2M-RT', 13, 3, 'stueck', 30, 15, 6.50, 'Regal M11', 'RJ45 2m rot Cat.6A geschirmt');
add('Patchkabel Cat.6A 5m rot', 'E-KOM-012', 'PK-CAT6A-5M-RT', 13, 3, 'stueck', 25, 12, 9.80, 'Regal M12', 'RJ45 5m rot Cat.6A geschirmt');
add('Patchpanel 48-port Cat.6', 'E-KOM-013', 'PP-48P-CAT6', 13, 3, 'stueck', 10, 5, 120.00, 'Regal M13', '19" 48 Port Cat.6');
add('Switch 24-port Gigabit PoE', 'E-KOM-014', 'SW-24P-GBIT-POE', 13, 3, 'stueck', 5, 3, 185.00, 'Regal M14', '24 Port Gigabit PoE+');
add('WLAN Access Point Outdoor', 'E-KOM-015', 'AP-WLAN-AC1200-OD', 13, 3, 'stueck', 8, 4, 125.00, 'Regal M15', 'Outdoor Dual-Band AC1200 PoE');
add('Koaxialkabel 75 Ohm 50m', 'E-KOM-016', 'KOAX-75-50', 13, 3, 'stueck', 30, 15, 25.00, 'Regal M16', '75 Ohm 50m Ring');
add('LWL Kabel OS2 2-faser', 'E-KOM-017', 'LWL-OS2-2F-500', 13, 3, 'stueck', 10, 5, 150.00, 'Regal M17', 'Singlemode OS2 500m');
add('LWL Patchkabel SC-SC 5m', 'E-KOM-018', 'LWL-SCSC-5M-OS2', 13, 3, 'stueck', 15, 8, 22.00, 'Regal M18', 'Duplex SC-SC 5m OS2');
add('Patchkabel Cat.5e 2m grau', 'E-KOM-019', 'PK-CAT5E-2M-GR', 13, 3, 'stueck', 60, 30, 3.20, 'Regal M19', 'RJ45 2m grau Cat.5e');
add('Keystone Jack Cat.6', 'E-KOM-020', 'KJ-CAT6-TOOL', 13, 3, 'stueck', 50, 25, 3.50, 'Regal M20', 'Toolless Keystone Cat.6');

// ── PV/SOLAR (Kat 14) ──
add('PV-Kabel 4mm² schwarz', 'E-PV-001', 'PV-KBL-4-SW', 14, 2, 'meter', 300, 150, 1.80, 'Regal N1', 'Solarleitung 4mm² schwarz');
add('PV-Kabel 4mm² rot', 'E-PV-002', 'PV-KBL-4-RT', 14, 2, 'meter', 300, 150, 1.80, 'Regal N2', 'Solarleitung 4mm² rot');
add('PV-Kabel 6mm² schwarz', 'E-PV-003', 'PV-KBL-6-SW', 14, 2, 'meter', 200, 100, 2.60, 'Regal N3', 'Solarleitung 6mm² schwarz');
add('PV-Stecker MC4', 'E-PV-004', 'PV-MC4-SET', 14, 2, 'stueck', 100, 50, 2.50, 'Regal N4', 'MC4 Stecker + Buchse Paar');
add('PV-Ableiter Typ 2', 'E-PV-005', 'PV-T2-1000V', 14, 3, 'stueck', 20, 10, 35.00, 'Regal N5', 'Überspannungsschutz 1000V DC');
add('Wechselrichter 5kW', 'E-PV-006', 'WR-5K-3PH', 14, 3, 'stueck', 5, 3, 850.00, 'Regal N6', '3-phasig 5kW Hybrid');
add('Solarzähler bidirektional', 'E-PV-007', 'SZ-BIDIR-3PH', 14, 3, 'stueck', 8, 4, 180.00, 'Regal N7', '3-phasig bidirektional');
add('Dachhaken Edelstahl', 'E-PV-008', 'DH-ED-SET-4', 14, 2, 'stueck', 40, 20, 12.00, 'Regal N8', 'Edelstahl Set 4 Stück');
add('Schienenverbinder 40x40', 'E-PV-009', 'SV-40x40-AL', 14, 2, 'stueck', 60, 30, 3.50, 'Regal N9', 'Aluminium Schienenverbinder');
add('Endklemme Modul 30-50mm', 'E-PV-010', 'EK-MOD-30-50', 14, 2, 'stueck', 80, 40, 1.80, 'Regal N10', 'Modulendklemme verstellbar');
add('PV-Kabel 2.5mm² schwarz', 'E-PV-011', 'PV-KBL-2.5-SW', 14, 2, 'meter', 400, 200, 1.20, 'Regal N11', 'Solarleitung 2.5mm² schwarz');
add('PV-Kabel 2.5mm² rot', 'E-PV-012', 'PV-KBL-2.5-RT', 14, 2, 'meter', 400, 200, 1.20, 'Regal N12', 'Solarleitung 2.5mm² rot');
add('PV-Kabel 10mm² schwarz', 'E-PV-013', 'PV-KBL-10-SW', 14, 2, 'meter', 150, 75, 4.20, 'Regal N13', 'Solarleitung 10mm² schwarz');
add('PV-Ableiter Typ 1+2', 'E-PV-014', 'PV-T1T2-1000V', 14, 3, 'stueck', 15, 8, 55.00, 'Regal N14', 'Kombiableiter 1000V DC');
add('Wechselrichter 3kW', 'E-PV-015', 'WR-3K-1PH', 14, 3, 'stueck', 8, 4, 520.00, 'Regal N15', '1-phasig 3kW');
add('Wechselrichter 8kW', 'E-PV-016', 'WR-8K-3PH', 14, 3, 'stueck', 3, 2, 1200.00, 'Regal N16', '3-phasig 8kW Hybrid');
add('Mittelklemme Modul 30-50mm', 'E-PV-017', 'MK-MOD-30-50', 14, 2, 'stueck', 100, 50, 1.50, 'Regal N17', 'Modulmittelklemme verstellbar');
add('Dachhaken Aluminium', 'E-PV-018', 'DH-AL-SET-4', 14, 2, 'stueck', 50, 25, 8.50, 'Regal N18', 'Aluminium Set 4 Stück');
add('Schienenverbinder 35x35', 'E-PV-019', 'SV-35x35-AL', 14, 2, 'stueck', 80, 40, 3.20, 'Regal N19', 'Aluminium Schienenverbinder');
add('Erdungsklemme Modul', 'E-PV-020', 'EK-MOD-ERD', 14, 2, 'stueck', 60, 30, 2.20, 'Regal N20', 'Modulerdungsklemme');

// ── HEIZUNG/KLIMA (Kat 15) ──
add('Thermostat digital weiß', 'E-HK-001', 'TH-DIG-WS-PROG', 15, 3, 'stueck', 30, 15, 45.00, 'Regal O1', 'Digital programmierbar weiß');
add('Thermostat digital anthrazit', 'E-HK-002', 'TH-DIG-AN-PROG', 15, 3, 'stueck', 20, 10, 48.00, 'Regal O2', 'Digital programmierbar anthrazit');
add('Stellantrieb 230V NC', 'E-HK-003', 'SA-230V-NC-M30', 15, 3, 'stueck', 50, 25, 15.00, 'Regal O3', 'M30x1.5 NC 230V');
add('Stellantrieb 24V NC', 'E-HK-004', 'SA-24V-NC-M30', 15, 3, 'stueck', 40, 20, 18.00, 'Regal O4', 'M30x1.5 NC 24V');
add('Ventil 2-Wege DN20', 'E-HK-005', 'V-2W-DN20-IT', 15, 3, 'stueck', 25, 12, 35.00, 'Regal O5', 'Innengewinde DN20');
add('Ventil 3-Wege DN20', 'E-HK-006', 'V-3W-DN20-IT', 15, 3, 'stueck', 20, 10, 42.00, 'Regal O6', 'Innengewinde DN20');
add('Raumtemperatursensor', 'E-HK-007', 'RTS-NTC10K', 15, 3, 'stueck', 30, 15, 12.00, 'Regal O7', 'NTC 10K Aufputz');
add('Fussbodentemperatursensor', 'E-HK-008', 'FTS-NTC10K-3M', 15, 3, 'stueck', 25, 12, 15.00, 'Regal O8', 'NTC 10K 3m Kabel');
add('Klimasteckdose 16A', 'E-HK-009', 'KS-16A-WS', 15, 1, 'stueck', 40, 20, 8.50, 'Regal O9', 'Klimagerät Steckdose 16A');
add('Kondensatpumpe mini', 'E-HK-010', 'KP-MINI-230V', 15, 3, 'stueck', 15, 8, 65.00, 'Regal O10', 'Klimakondensatpumpe 230V');
add('Thermostat analog weiß', 'E-HK-011', 'TH-ANA-WS', 15, 3, 'stueck', 40, 20, 22.00, 'Regal O11', 'Analog einfach weiß');
add('Thermostat Funk', 'E-HK-012', 'TH-FUNK-SET', 15, 3, 'stueck', 15, 8, 85.00, 'Regal O12', 'Funkthermostat Set');
add('Stellantrieb 230V NO', 'E-HK-013', 'SA-230V-NO-M30', 15, 3, 'stueck', 35, 18, 15.00, 'Regal O13', 'M30x1.5 NO 230V');
add('Ventil 2-Wege DN15', 'E-HK-014', 'V-2W-DN15-IT', 15, 3, 'stueck', 30, 15, 28.00, 'Regal O14', 'Innengewinde DN15');
add('Ventil 3-Wege DN15', 'E-HK-015', 'V-3W-DN15-IT', 15, 3, 'stueck', 25, 12, 35.00, 'Regal O15', 'Innengewinde DN15');
add('Verteiler Heizkreis 4-fach', 'E-HK-016', 'VH-4F-HEIZ', 15, 3, 'stueck', 20, 10, 55.00, 'Regal O16', 'Heizkreisverteiler 4-fach');
add('Verteiler Heizkreis 6-fach', 'E-HK-017', 'VH-6F-HEIZ', 15, 3, 'stueck', 15, 8, 75.00, 'Regal O17', 'Heizkreisverteiler 6-fach');
add('Verteiler Heizkreis 8-fach', 'E-HK-018', 'VH-8F-HEIZ', 15, 3, 'stueck', 10, 5, 95.00, 'Regal O18', 'Heizkreisverteiler 8-fach');
add('Durchflussmesser', 'E-HK-019', 'DFM-HEIZ-1-4', 15, 3, 'stueck', 25, 12, 8.50, 'Regal O19', 'Heizkreis 1-4 l/min');
add('Klimagerät Split 3.5kW', 'E-HK-020', 'KG-SPLIT-3.5KW', 15, 3, 'stueck', 5, 3, 450.00, 'Regal O20', 'Split Klimagerät 3.5kW');

// ── Generator ──────────────────────────────────────────
const lines = [
  "// Alle Materialien mit Herstellernummern und Artikelnummern (Eigene Codierung: E-{KATEGORIE}-{NUMMER})",
  "export const seedMaterials = [",
];

materials.forEach(m => {
  lines.push(`  {`);
  lines.push(`    id: '${m.id}', name: '${m.name}', article_number: '${m.article_number}', manufacturer_number: '${m.manufacturer_number}',`);
  lines.push(`    category_id: '${m.category_id}', supplier_id: '${m.supplier_id}', unit: '${m.unit}',`);
  lines.push(`    min_stock: ${m.min_stock}, reorder_quantity: ${m.reorder_quantity}, price_per_unit: ${m.price_per_unit},`);
  lines.push(`    storage_location: '${m.storage_location}', description: '${m.description}', active: ${m.active},`);
  lines.push(`    image_url: '', barcode: '', ean: '${m.ean}',`);
  lines.push(`  },`);
});

lines.push("];");
lines.push("");
lines.push("export const seedCategories = [");
lines.push("  { id: '1', name: 'Kabel', color: '#3B82F6', active: true },");
lines.push("  { id: '2', name: 'Leitungen', color: '#10B981', active: true },");
lines.push("  { id: '3', name: 'Klemmen', color: '#F59E0B', active: true },");
lines.push("  { id: '4', name: 'Abzweigdosen', color: '#8B5CF6', active: true },");
lines.push("  { id: '5', name: 'Schalter/Dosen', color: '#EF4444', active: true },");
lines.push("  { id: '6', name: 'Beleuchtung', color: '#06B6D4', active: true },");
lines.push("  { id: '7', name: 'Schienen/Sicherungen', color: '#84CC16', active: true },");
lines.push("  { id: '8', name: 'Zaehlerschraenke', color: '#EC4899', active: true },");
lines.push("  { id: '9', name: 'Kabelkanaele', color: '#6366F1', active: true },");
lines.push("  { id: '10', name: 'Erdung', color: '#14B8A6', active: true },");
lines.push("  { id: '11', name: 'Werkzeug', color: '#F97316', active: true },");
lines.push("  { id: '12', name: 'Montagematerial', color: '#64748B', active: true },");
lines.push("  { id: '13', name: 'Kommunikation', color: '#A855F7', active: true },");
lines.push("  { id: '14', name: 'PV/Solar', color: '#EAB308', active: true },");
lines.push("  { id: '15', name: 'Heizung/Klima', color: '#22C55E', active: true },");
lines.push("];");
lines.push("");
lines.push("export const seedSuppliers = [");
lines.push("  { id: '1', name: 'Elektro Grosshandel GmbH', contact_person: 'Hans Mueller', phone: '+49 30 1234567', email: 'hans@elektro-gh.de', address: 'Berlin', active: true },");
lines.push("  { id: '2', name: 'Kabel \u0026 Draht AG', contact_person: 'Klaus Schmidt', phone: '+49 40 2345678', email: 'klaus@kabel-draht.de', address: 'Hamburg', active: true },");
lines.push("  { id: '3', name: 'Licht \u0026 Technik OHG', contact_person: 'Peter Weber', phone: '+49 89 3456789', email: 'peter@licht-technik.de', address: 'Muenchen', active: true },");
lines.push("];");
lines.push("");
lines.push("export const seedProjects = [");
lines.push("  { id: '1', name: 'Neubau Musterstrasse 1', customer: 'Musterbau GmbH', location: 'Berlin', status: 'aktiv', start_date: '2025-01-15', end_date: '2025-06-30', notes: 'Wohnungsbau 12 WE', active: true },");
lines.push("  { id: '2', name: 'Sanierung Altbau', customer: 'Altbausanierung eG', location: 'Hamburg', status: 'aktiv', start_date: '2025-02-01', end_date: '2025-05-15', notes: 'Komplettsanierung Elektro', active: true },");
lines.push("  { id: '3', name: 'Gewerbehalle Industrie', customer: 'Industrie AG', location: 'Muenchen', status: 'aktiv', start_date: '2025-03-01', end_date: '2025-08-31', notes: 'Hallenbeleuchtung + Starkstrom', active: true },");
lines.push("  { id: '4', name: 'Photovoltaik Anlage 30kW', customer: 'Solar GmbH', location: 'Stuttgart', status: 'geplant', start_date: '2025-05-01', end_date: '2025-07-15', notes: 'Dachmontage 30kWp', active: true },");
lines.push("  { id: '5', name: 'Ladestation E-Mobility', customer: 'Stadtwerke', location: 'Koeln', status: 'aktiv', start_date: '2025-01-20', end_date: '2025-04-30', notes: '4 Wallboxen 22kW', active: true },");
lines.push("];");
lines.push("");
lines.push("export const seedMovements = [");
lines.push("  { id: '1', material_id: '1', project_id: '1', type: 'entnahme', quantity: 50, note: 'Wohnung 1-3 Verdrahtung', created_at: new Date(Date.now() - 86400000).toISOString(), user_id: 'system' },");
lines.push("  { id: '2', material_id: '10', project_id: '1', type: 'entnahme', quantity: 30, note: 'Steckdosenklemmen', created_at: new Date(Date.now() - 172800000).toISOString(), user_id: 'system' },");
lines.push("  { id: '3', material_id: '14', project_id: '2', type: 'entnahme', quantity: 20, note: 'Hohlwanddosen Sanierung', created_at: new Date(Date.now() - 259200000).toISOString(), user_id: 'system' },");
lines.push("  { id: '4', material_id: '1', project_id: null, type: 'eingang', quantity: 500, note: 'Lieferung KW12', created_at: new Date(Date.now() - 432000000).toISOString(), user_id: 'system' },");
lines.push("  { id: '5', material_id: '23', project_id: '3', type: 'entnahme', quantity: 10, note: 'Hallenbeleuchtung', created_at: new Date(Date.now() - 518400000).toISOString(), user_id: 'system' },");
lines.push("];");

fs.writeFileSync('src/data/seedData.js', lines.join('\n'));
console.log(`Generated seedData.js with ${materials.length} materials in 15 categories`);

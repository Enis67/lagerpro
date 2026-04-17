// Seed-Daten: Typische Elektro-Artikel für einen Meisterbetrieb
import { v4 as uuid } from 'uuid';

// ── Kategorien ──────────────────────────────────────────
export const seedCategories = [
  { id: 'cat-01', name: 'Leitungsschutzschalter', color: '#3B82F6' },
  { id: 'cat-02', name: 'FI / RCD', color: '#EF4444' },
  { id: 'cat-03', name: 'Kabel & Leitungen', color: '#10B981' },
  { id: 'cat-04', name: 'Verteilungen & Gehäuse', color: '#8B5CF6' },
  { id: 'cat-05', name: 'Dosen & Schalter', color: '#F59E0B' },
  { id: 'cat-06', name: 'Klemmen & Verbinder', color: '#EC4899' },
  { id: 'cat-07', name: 'Befestigung & Kanal', color: '#6B7280' },
  { id: 'cat-08', name: 'Zähler & Messgeräte', color: '#14B8A6' },
  { id: 'cat-09', name: 'Überspannungsschutz', color: '#F97316' },
  { id: 'cat-10', name: 'Photovoltaik', color: '#84CC16' },
  { id: 'cat-11', name: 'Wallbox & E-Mobilität', color: '#06B6D4' },
  { id: 'cat-12', name: 'Kleinmaterial', color: '#A855F7' },
];

// ── Lieferanten ─────────────────────────────────────────
export const seedSuppliers = [
  { id: 'sup-01', name: 'Rexel Deutschland', contact_email: 'bestellung@rexel.de', contact_phone: '0800 123456', notes: 'Hauptlieferant' },
  { id: 'sup-02', name: 'Sonepar Deutschland', contact_email: 'order@sonepar.de', contact_phone: '0800 654321', notes: 'Zweitlieferant' },
  { id: 'sup-03', name: 'Elektro Großhandel Müller', contact_email: 'info@eg-mueller.de', contact_phone: '04321 98765', notes: 'Regionaler Lieferant' },
  { id: 'sup-04', name: 'Wago Direkt', contact_email: 'vertrieb@wago.com', contact_phone: '0571 887-0', notes: 'Klemmen & Verbinder' },
];

// ── Materialien ─────────────────────────────────────────
export const seedMaterials = [
  // LS-Schalter (Hager)
  {
    id: uuid(), article_number: 'LS-B10-1', manufacturer_number: 'MBN110', name: 'LS-Schalter B10 1-polig',
    category_id: 'cat-01', description: 'Hager MBN110 Leitungsschutzschalter B-Charakteristik 10A 1-polig',
    unit: 'stueck', current_stock: 25, reserved_stock: 4, min_stock: 10, reorder_quantity: 20,
    storage_location: 'Regal A1', supplier_id: 'sup-01', purchase_price: 4.85, packaging_unit: '1 Stück', active: true,
  },
  {
    id: uuid(), article_number: 'LS-B16-1', manufacturer_number: 'MBN116', name: 'LS-Schalter B16 1-polig',
    category_id: 'cat-01', description: 'Hager MBN116 Leitungsschutzschalter B-Charakteristik 16A 1-polig',
    unit: 'stueck', current_stock: 42, reserved_stock: 12, min_stock: 15, reorder_quantity: 30,
    storage_location: 'Regal A1', supplier_id: 'sup-01', purchase_price: 4.95, packaging_unit: '1 Stück', active: true,
  },
  {
    id: uuid(), article_number: 'LS-B20-1', manufacturer_number: 'MBN120', name: 'LS-Schalter B20 1-polig',
    category_id: 'cat-01', description: 'Hager MBN120 Leitungsschutzschalter B-Charakteristik 20A 1-polig',
    unit: 'stueck', current_stock: 8, reserved_stock: 0, min_stock: 10, reorder_quantity: 20,
    storage_location: 'Regal A1', supplier_id: 'sup-01', purchase_price: 5.20, packaging_unit: '1 Stück', active: true,
  },
  {
    id: uuid(), article_number: 'LS-C16-3', manufacturer_number: 'MCN316', name: 'LS-Schalter C16 3-polig',
    category_id: 'cat-01', description: 'Hager MCN316 Leitungsschutzschalter C-Charakteristik 16A 3-polig',
    unit: 'stueck', current_stock: 6, reserved_stock: 2, min_stock: 5, reorder_quantity: 10,
    storage_location: 'Regal A2', supplier_id: 'sup-01', purchase_price: 18.50, packaging_unit: '1 Stück', active: true,
  },
  {
    id: uuid(), article_number: 'LS-C32-3', manufacturer_number: 'MCN332', name: 'LS-Schalter C32 3-polig',
    category_id: 'cat-01', description: 'Hager MCN332 Leitungsschutzschalter C-Charakteristik 32A 3-polig für Wallbox',
    unit: 'stueck', current_stock: 3, reserved_stock: 1, min_stock: 3, reorder_quantity: 5,
    storage_location: 'Regal A2', supplier_id: 'sup-01', purchase_price: 22.80, packaging_unit: '1 Stück', active: true,
  },
  // FI / RCD (Hager)
  {
    id: uuid(), article_number: 'FI-40-30-4', manufacturer_number: 'CDA440D', name: 'FI-Schalter 40A 30mA 4-polig',
    category_id: 'cat-02', description: 'Hager CDA440D Fehlerstromschutzschalter Typ A 40A 30mA 4-polig',
    unit: 'stueck', current_stock: 7, reserved_stock: 2, min_stock: 5, reorder_quantity: 5,
    storage_location: 'Regal A3', supplier_id: 'sup-01', purchase_price: 38.90, packaging_unit: '1 Stück', active: true,
  },
  {
    id: uuid(), article_number: 'FI-25-30-2', manufacturer_number: 'CDA225D', name: 'FI-Schalter 25A 30mA 2-polig',
    category_id: 'cat-02', description: 'Hager CDA225D Fehlerstromschutzschalter Typ A 25A 30mA 2-polig',
    unit: 'stueck', current_stock: 4, reserved_stock: 0, min_stock: 3, reorder_quantity: 5,
    storage_location: 'Regal A3', supplier_id: 'sup-01', purchase_price: 28.50, packaging_unit: '1 Stück', active: true,
  },
  {
    id: uuid(), article_number: 'FI-63-30-4', manufacturer_number: 'CDA463D', name: 'FI-Schalter 63A 30mA 4-polig',
    category_id: 'cat-02', description: 'Hager CDA463D Fehlerstromschutzschalter Typ A 63A 30mA 4-polig',
    unit: 'stueck', current_stock: 2, reserved_stock: 1, min_stock: 3, reorder_quantity: 5,
    storage_location: 'Regal A3', supplier_id: 'sup-02', purchase_price: 52.60, packaging_unit: '1 Stück', active: true,
  },
  {
    id: uuid(), article_number: 'RCBO-B16-30', manufacturer_number: 'ADC916D', name: 'FI/LS-Kombi B16 30mA 1+N',
    category_id: 'cat-02', description: 'Hager ADC916D FI/LS-Kombischalter B16 30mA 1+N-polig',
    unit: 'stueck', current_stock: 5, reserved_stock: 0, min_stock: 5, reorder_quantity: 10,
    storage_location: 'Regal A3', supplier_id: 'sup-01', purchase_price: 45.00, packaging_unit: '1 Stück', active: true,
  },
  // Kabel & Leitungen
  {
    id: uuid(), article_number: 'NYM-3x1.5', manufacturer_number: 'NYM-J 3x1,5', name: 'NYM-J 3x1,5 mm²',
    category_id: 'cat-03', description: 'Mantelleitung NYM-J 3x1,5mm² grau',
    unit: 'meter', current_stock: 250, reserved_stock: 80, min_stock: 100, reorder_quantity: 500,
    storage_location: 'Kabelregal B1', supplier_id: 'sup-02', purchase_price: 0.89, packaging_unit: '100m Ring', active: true,
  },
  {
    id: uuid(), article_number: 'NYM-3x2.5', manufacturer_number: 'NYM-J 3x2,5', name: 'NYM-J 3x2,5 mm²',
    category_id: 'cat-03', description: 'Mantelleitung NYM-J 3x2,5mm² grau',
    unit: 'meter', current_stock: 180, reserved_stock: 50, min_stock: 100, reorder_quantity: 500,
    storage_location: 'Kabelregal B1', supplier_id: 'sup-02', purchase_price: 1.35, packaging_unit: '100m Ring', active: true,
  },
  {
    id: uuid(), article_number: 'NYM-5x1.5', manufacturer_number: 'NYM-J 5x1,5', name: 'NYM-J 5x1,5 mm²',
    category_id: 'cat-03', description: 'Mantelleitung NYM-J 5x1,5mm² grau',
    unit: 'meter', current_stock: 120, reserved_stock: 0, min_stock: 50, reorder_quantity: 200,
    storage_location: 'Kabelregal B2', supplier_id: 'sup-02', purchase_price: 1.50, packaging_unit: '100m Ring', active: true,
  },
  {
    id: uuid(), article_number: 'NYM-5x2.5', manufacturer_number: 'NYM-J 5x2,5', name: 'NYM-J 5x2,5 mm²',
    category_id: 'cat-03', description: 'Mantelleitung NYM-J 5x2,5mm² grau',
    unit: 'meter', current_stock: 75, reserved_stock: 30, min_stock: 50, reorder_quantity: 200,
    storage_location: 'Kabelregal B2', supplier_id: 'sup-02', purchase_price: 2.40, packaging_unit: '50m Ring', active: true,
  },
  {
    id: uuid(), article_number: 'NYM-5x6', manufacturer_number: 'NYM-J 5x6', name: 'NYM-J 5x6 mm²',
    category_id: 'cat-03', description: 'Mantelleitung NYM-J 5x6mm² grau (Herd, Wallbox)',
    unit: 'meter', current_stock: 30, reserved_stock: 10, min_stock: 20, reorder_quantity: 50,
    storage_location: 'Kabelregal B3', supplier_id: 'sup-02', purchase_price: 5.80, packaging_unit: '50m Trommel', active: true,
  },
  {
    id: uuid(), article_number: 'H07V-U-1.5-GG', manufacturer_number: 'H07V-U 1,5 gn/ge', name: 'H07V-U 1,5mm² gn/ge',
    category_id: 'cat-03', description: 'Aderleitung 1,5mm² grün/gelb PE',
    unit: 'meter', current_stock: 200, reserved_stock: 0, min_stock: 50, reorder_quantity: 200,
    storage_location: 'Kabelregal B4', supplier_id: 'sup-02', purchase_price: 0.22, packaging_unit: '100m Ring', active: true,
  },
  // Verteilungen (Hager)
  {
    id: uuid(), article_number: 'UV-3R-AP', manufacturer_number: 'VE312DN', name: 'Kleinverteiler 3-reihig AP',
    category_id: 'cat-04', description: 'Hager VE312DN Aufputz-Kleinverteiler 3-reihig 36 TE IP65',
    unit: 'stueck', current_stock: 3, reserved_stock: 1, min_stock: 2, reorder_quantity: 3,
    storage_location: 'Regal C1', supplier_id: 'sup-01', purchase_price: 48.90, packaging_unit: '1 Stück', active: true,
  },
  {
    id: uuid(), article_number: 'UV-4R-UP', manufacturer_number: 'VU48NC', name: 'Kleinverteiler 4-reihig UP',
    category_id: 'cat-04', description: 'Hager VU48NC Unterputz-Kleinverteiler 4-reihig 48 TE',
    unit: 'stueck', current_stock: 2, reserved_stock: 0, min_stock: 2, reorder_quantity: 2,
    storage_location: 'Regal C1', supplier_id: 'sup-01', purchase_price: 65.00, packaging_unit: '1 Stück', active: true,
  },
  // Dosen & Schalter
  {
    id: uuid(), article_number: 'SD-UP-68', manufacturer_number: '', name: 'Schalterdose UP Ø68mm',
    category_id: 'cat-05', description: 'Unterputz-Schalterdose Ø68mm Tiefe 47mm',
    unit: 'stueck', current_stock: 150, reserved_stock: 40, min_stock: 50, reorder_quantity: 100,
    storage_location: 'Regal D1', supplier_id: 'sup-03', purchase_price: 0.32, packaging_unit: '50er Pack', active: true,
  },
  {
    id: uuid(), article_number: 'AD-AP-IP55', manufacturer_number: '', name: 'Abzweigdose AP IP55 100x100',
    category_id: 'cat-05', description: 'Aufputz-Abzweigdose IP55 100x100x50mm grau',
    unit: 'stueck', current_stock: 25, reserved_stock: 0, min_stock: 15, reorder_quantity: 25,
    storage_location: 'Regal D1', supplier_id: 'sup-03', purchase_price: 1.80, packaging_unit: '10er Pack', active: true,
  },
  {
    id: uuid(), article_number: 'STEDO-WS', manufacturer_number: 'WNA100B', name: 'Steckdose Komplett weiß',
    category_id: 'cat-05', description: 'Berker/Hager WNA100B Schuko-Steckdose komplett UP reinweiß',
    unit: 'stueck', current_stock: 35, reserved_stock: 8, min_stock: 20, reorder_quantity: 30,
    storage_location: 'Regal D2', supplier_id: 'sup-01', purchase_price: 3.95, packaging_unit: '1 Stück', active: true,
  },
  {
    id: uuid(), article_number: 'WECHS-WS', manufacturer_number: 'WNA020B', name: 'Wechselschalter Komplett weiß',
    category_id: 'cat-05', description: 'Berker/Hager WNA020B Wechselschalter komplett UP reinweiß',
    unit: 'stueck', current_stock: 18, reserved_stock: 4, min_stock: 10, reorder_quantity: 20,
    storage_location: 'Regal D2', supplier_id: 'sup-01', purchase_price: 4.50, packaging_unit: '1 Stück', active: true,
  },
  // Klemmen & Verbinder (WAGO)
  {
    id: uuid(), article_number: 'WAGO-221-413', manufacturer_number: '221-413', name: 'WAGO 221-413 Klemme 3-fach',
    category_id: 'cat-06', description: 'WAGO 221 Hebelklemme 3-fach 0,14-4mm²',
    unit: 'stueck', current_stock: 200, reserved_stock: 30, min_stock: 50, reorder_quantity: 100,
    storage_location: 'Regal E1', supplier_id: 'sup-04', purchase_price: 0.45, packaging_unit: '50er Pack', active: true,
  },
  {
    id: uuid(), article_number: 'WAGO-221-415', manufacturer_number: '221-415', name: 'WAGO 221-415 Klemme 5-fach',
    category_id: 'cat-06', description: 'WAGO 221 Hebelklemme 5-fach 0,14-4mm²',
    unit: 'stueck', current_stock: 80, reserved_stock: 0, min_stock: 30, reorder_quantity: 50,
    storage_location: 'Regal E1', supplier_id: 'sup-04', purchase_price: 0.75, packaging_unit: '25er Pack', active: true,
  },
  // Befestigung
  {
    id: uuid(), article_number: 'KK-16-25', manufacturer_number: '', name: 'Kabelkanal 16x25mm weiß 2m',
    category_id: 'cat-07', description: 'Kabelkanal mit Deckel 16x25mm weiß, 2m Stange',
    unit: 'stueck', current_stock: 20, reserved_stock: 0, min_stock: 10, reorder_quantity: 20,
    storage_location: 'Regal F1', supplier_id: 'sup-03', purchase_price: 2.10, packaging_unit: '1 Stange', active: true,
  },
  {
    id: uuid(), article_number: 'NS-7.5', manufacturer_number: '', name: 'Nagelschelle 7-11mm grau',
    category_id: 'cat-07', description: 'Nagelschelle für NYM 3x1,5 grau',
    unit: 'stueck', current_stock: 500, reserved_stock: 0, min_stock: 100, reorder_quantity: 500,
    storage_location: 'Regal F2', supplier_id: 'sup-03', purchase_price: 0.03, packaging_unit: '100er Pack', active: true,
  },
  // Überspannungsschutz (Hager)
  {
    id: uuid(), article_number: 'SPD-T2-3+1', manufacturer_number: 'SPN415D', name: 'Überspannungsschutz Typ 2 3+1',
    category_id: 'cat-09', description: 'Hager SPN415D Überspannungsableiter Typ 2, 3+1 polig, TN-S',
    unit: 'stueck', current_stock: 2, reserved_stock: 1, min_stock: 2, reorder_quantity: 3,
    storage_location: 'Regal A4', supplier_id: 'sup-01', purchase_price: 89.00, packaging_unit: '1 Stück', active: true,
  },
  // Photovoltaik
  {
    id: uuid(), article_number: 'PV-STECKER-MC4', manufacturer_number: '', name: 'MC4 Stecker Paar',
    category_id: 'cat-10', description: 'MC4 Steckverbinder-Paar für Solarkabel',
    unit: 'paar', current_stock: 20, reserved_stock: 0, min_stock: 10, reorder_quantity: 20,
    storage_location: 'Regal G1', supplier_id: 'sup-02', purchase_price: 2.50, packaging_unit: '1 Paar', active: true,
  },
  {
    id: uuid(), article_number: 'PV-KABEL-6', manufacturer_number: '', name: 'Solarkabel 6mm² schwarz',
    category_id: 'cat-10', description: 'PV-Kabel H07RN-F 1x6mm² schwarz',
    unit: 'meter', current_stock: 60, reserved_stock: 20, min_stock: 30, reorder_quantity: 100,
    storage_location: 'Kabelregal B5', supplier_id: 'sup-02', purchase_price: 1.80, packaging_unit: '100m Rolle', active: true,
  },
  // Wallbox (Mennekes)
  {
    id: uuid(), article_number: 'WB-CEE-32', manufacturer_number: '', name: 'CEE-Steckdose 32A 5-polig',
    category_id: 'cat-11', description: 'CEE Wandsteckdose 32A 5-polig IP44 rot',
    unit: 'stueck', current_stock: 4, reserved_stock: 0, min_stock: 2, reorder_quantity: 5,
    storage_location: 'Regal G2', supplier_id: 'sup-01', purchase_price: 12.50, packaging_unit: '1 Stück', active: true,
  },
  // Kleinmaterial
  {
    id: uuid(), article_number: 'ISOLB-SW', manufacturer_number: '', name: 'Isolierband schwarz 15mm',
    category_id: 'cat-12', description: 'Elektro-Isolierband 15mm x 10m schwarz',
    unit: 'rolle', current_stock: 12, reserved_stock: 0, min_stock: 5, reorder_quantity: 10,
    storage_location: 'Regal E2', supplier_id: 'sup-03', purchase_price: 0.95, packaging_unit: '1 Rolle', active: true,
  },
  {
    id: uuid(), article_number: 'DUEBEL-6', manufacturer_number: '', name: 'Universaldübel 6mm',
    category_id: 'cat-12', description: 'Universaldübel 6x30mm mit Kragen',
    unit: 'stueck', current_stock: 300, reserved_stock: 0, min_stock: 100, reorder_quantity: 200,
    storage_location: 'Regal F3', supplier_id: 'sup-03', purchase_price: 0.04, packaging_unit: '100er Pack', active: true,
  },
  {
    id: uuid(), article_number: 'SCHRAUB-4x40', manufacturer_number: '', name: 'Spanplattenschraube 4x40',
    category_id: 'cat-12', description: 'Spanplattenschraube Senkkopf PZ2 4x40mm verzinkt',
    unit: 'stueck', current_stock: 250, reserved_stock: 0, min_stock: 100, reorder_quantity: 200,
    storage_location: 'Regal F3', supplier_id: 'sup-03', purchase_price: 0.02, packaging_unit: '200er Pack', active: true,
  },
];

// ── Beispiel-Baustellen ─────────────────────────────────
export const seedProjects = [
  {
    id: 'proj-01', name: 'UV-Erweiterung Fam. Müller', customer: 'Familie Müller',
    address: 'Mühlenweg 12, 26721 Emden', status: 'aktiv',
    planned_date: '2026-04-15', notes: 'UV von 3 auf 4 Reihen erweitern, 6 neue Stromkreise',
  },
  {
    id: 'proj-02', name: 'Wallbox-Installation Schmidt', customer: 'Herr Schmidt',
    address: 'Am Hafen 34, 26721 Emden', status: 'geplant',
    planned_date: '2026-04-22', notes: 'Wallbox 11kW, Zuleitung aus UV Keller',
  },
  {
    id: 'proj-03', name: 'PV-Anschluss Peters', customer: 'Fam. Peters',
    address: 'Deichstraße 8, 26725 Emden', status: 'aktiv',
    planned_date: '2026-04-18', notes: 'PV 10kWp AC-seitig anschließen, Zählerschrank anpassen',
  },
  {
    id: 'proj-04', name: 'Sanierung Gewerbehalle Jansen', customer: 'Jansen GmbH',
    address: 'Industriestr. 5, 26723 Emden', status: 'geplant',
    planned_date: '2026-05-02', notes: 'Komplette Neuinstallation Bürotrakt, 24 Stromkreise',
  },
];

// ── Beispiel-Lagerbewegungen ────────────────────────────
export const seedMovements = [];

// Werden beim ersten Start generiert, damit timestamps aktuell sind
export function generateSeedMovements(materials) {
  const now = new Date();
  const movements = [];
  const sampleMaterials = materials.slice(0, 8);

  sampleMaterials.forEach((mat, i) => {
    // Wareneingang vor einigen Tagen
    movements.push({
      id: uuid(),
      material_id: mat.id,
      project_id: null,
      user_id: 'user-001',
      type: 'eingang',
      quantity: mat.reorder_quantity,
      note: 'Lieferung eingegangen',
      created_at: new Date(now.getTime() - (7 - i) * 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  // Einige Entnahmen
  if (materials.length > 1) {
    movements.push({
      id: uuid(),
      material_id: materials[1].id,
      project_id: 'proj-01',
      user_id: 'user-001',
      type: 'entnahme',
      quantity: 8,
      note: 'Für UV-Erweiterung Müller',
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  if (materials.length > 5) {
    movements.push({
      id: uuid(),
      material_id: materials[5].id,
      project_id: 'proj-03',
      user_id: 'user-001',
      type: 'entnahme',
      quantity: 2,
      note: 'PV-Anschluss Peters',
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return movements;
}

// Data Service Layer – Abstraktion über localStorage
// In Phase 2 wird diese Datei gegen Supabase-Calls getauscht.

import { seedCategories, seedSuppliers, seedMaterials, seedProjects, generateSeedMovements } from '../data/seedData.js';

const STORAGE_KEYS = {
  materials: 'lagerpro_materials',
  categories: 'lagerpro_categories',
  suppliers: 'lagerpro_suppliers',
  projects: 'lagerpro_projects',
  movements: 'lagerpro_movements',
  initialized: 'lagerpro_initialized',
};

// ── Hilfsfunktionen ─────────────────────────────────────

function getStore(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Initialisierung mit Seed-Daten ──────────────────────

export function initializeData() {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (isInitialized) {
    // Immer Migrationen prüfen, auch bei bestehenden Daten
    migrateData();
    return;
  }

  setStore(STORAGE_KEYS.categories, seedCategories);
  setStore(STORAGE_KEYS.suppliers, seedSuppliers);

  // Materials mit created_at/updated_at Timestamps
  const now = new Date().toISOString();
  const materials = seedMaterials.map(m => ({
    ...m,
    created_at: now,
    updated_at: now,
  }));
  setStore(STORAGE_KEYS.materials, materials);

  // Projekte mit created_at
  const projects = seedProjects.map(p => ({
    ...p,
    created_at: now,
  }));
  setStore(STORAGE_KEYS.projects, projects);

  // Lagerbewegungen generieren
  const movements = generateSeedMovements(materials);
  setStore(STORAGE_KEYS.movements, movements);

  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

// ── Daten-Migration ─────────────────────────────────────
// Ergänzt bestehende Materialien um neue Felder (z.B. manufacturer_number)

function migrateData() {
  const materials = getStore(STORAGE_KEYS.materials);
  if (!materials.length) return;

  // Lookup: article_number → manufacturer_number aus Seed-Daten
  const seedLookup = {};
  seedMaterials.forEach(sm => {
    if (sm.manufacturer_number) {
      seedLookup[sm.article_number] = sm.manufacturer_number;
    }
  });

  let changed = false;
  const updated = materials.map(m => {
    // Nur ergänzen wenn manufacturer_number fehlt und Seed-Daten vorhanden
    if (!m.manufacturer_number && seedLookup[m.article_number]) {
      changed = true;
      return { ...m, manufacturer_number: seedLookup[m.article_number] };
    }
    return m;
  });

  if (changed) {
    setStore(STORAGE_KEYS.materials, updated);
    console.log('[LagerPro] Migration: Herstellernummern ergänzt ✓');
  }
}

// ── CRUD: Materials ─────────────────────────────────────

export function getMaterials() {
  return getStore(STORAGE_KEYS.materials);
}

export function getMaterialById(id) {
  return getMaterials().find(m => m.id === id) || null;
}

export function createMaterial(material) {
  const materials = getMaterials();
  const now = new Date().toISOString();
  const newMaterial = {
    ...material,
    created_at: now,
    updated_at: now,
  };
  materials.push(newMaterial);
  setStore(STORAGE_KEYS.materials, materials);
  return newMaterial;
}

export function updateMaterial(id, updates) {
  const materials = getMaterials();
  const index = materials.findIndex(m => m.id === id);
  if (index === -1) return null;
  materials[index] = {
    ...materials[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  setStore(STORAGE_KEYS.materials, materials);
  return materials[index];
}

export function deleteMaterial(id) {
  const materials = getMaterials().filter(m => m.id !== id);
  setStore(STORAGE_KEYS.materials, materials);
}

// ── CRUD: Projects ──────────────────────────────────────

export function getProjects() {
  return getStore(STORAGE_KEYS.projects);
}

export function getProjectById(id) {
  return getProjects().find(p => p.id === id) || null;
}

export function createProject(project) {
  const projects = getProjects();
  const newProject = {
    ...project,
    created_at: new Date().toISOString(),
  };
  projects.push(newProject);
  setStore(STORAGE_KEYS.projects, projects);
  return newProject;
}

export function updateProject(id, updates) {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  projects[index] = { ...projects[index], ...updates };
  setStore(STORAGE_KEYS.projects, projects);
  return projects[index];
}

export function deleteProject(id) {
  const projects = getProjects().filter(p => p.id !== id);
  setStore(STORAGE_KEYS.projects, projects);
}

// ── CRUD: Movements ─────────────────────────────────────

export function getMovements() {
  return getStore(STORAGE_KEYS.movements).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

export function getMovementsByMaterial(materialId) {
  return getMovements().filter(m => m.material_id === materialId);
}

export function getMovementsByProject(projectId) {
  return getMovements().filter(m => m.project_id === projectId);
}

export function createMovement(movement) {
  const movements = getStore(STORAGE_KEYS.movements);
  const newMovement = {
    ...movement,
    created_at: new Date().toISOString(),
  };
  movements.push(newMovement);
  setStore(STORAGE_KEYS.movements, movements);

  // Bestand aktualisieren
  updateStockFromMovement(movement);

  return newMovement;
}

function updateStockFromMovement(movement) {
  const material = getMaterialById(movement.material_id);
  if (!material) return;

  let stockChange = 0;
  let reservedChange = 0;

  switch (movement.type) {
    case 'eingang':
      stockChange = movement.quantity;
      break;
    case 'entnahme':
      stockChange = -movement.quantity;
      break;
    case 'rueckgabe':
      stockChange = movement.quantity;
      break;
    case 'korrektur':
      // Korrektur setzt den Bestand direkt (quantity = neuer Bestand)
      stockChange = movement.quantity - material.current_stock;
      break;
    case 'reservierung':
      reservedChange = movement.quantity;
      break;
    case 'reservierung_aufloesen':
      reservedChange = -movement.quantity;
      break;
  }

  updateMaterial(material.id, {
    current_stock: Math.max(0, material.current_stock + stockChange),
    reserved_stock: Math.max(0, material.reserved_stock + reservedChange),
  });
}

// ── CRUD: Categories ────────────────────────────────────

export function getCategories() {
  return getStore(STORAGE_KEYS.categories);
}

export function createCategory(category) {
  const categories = getCategories();
  categories.push(category);
  setStore(STORAGE_KEYS.categories, categories);
  return category;
}

export function updateCategory(id, updates) {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;
  categories[index] = { ...categories[index], ...updates };
  setStore(STORAGE_KEYS.categories, categories);
  return categories[index];
}

export function deleteCategory(id) {
  const categories = getCategories().filter(c => c.id !== id);
  setStore(STORAGE_KEYS.categories, categories);
}

// ── CRUD: Suppliers ─────────────────────────────────────

export function getSuppliers() {
  return getStore(STORAGE_KEYS.suppliers);
}

export function createSupplier(supplier) {
  const suppliers = getSuppliers();
  suppliers.push(supplier);
  setStore(STORAGE_KEYS.suppliers, suppliers);
  return supplier;
}

export function updateSupplier(id, updates) {
  const suppliers = getSuppliers();
  const index = suppliers.findIndex(s => s.id === id);
  if (index === -1) return null;
  suppliers[index] = { ...suppliers[index], ...updates };
  setStore(STORAGE_KEYS.suppliers, suppliers);
  return suppliers[index];
}

export function deleteSupplier(id) {
  const suppliers = getSuppliers().filter(s => s.id !== id);
  setStore(STORAGE_KEYS.suppliers, suppliers);
}

// ── Berechnungen ────────────────────────────────────────

export function getAvailableStock(material) {
  return Math.max(0, material.current_stock - material.reserved_stock);
}

export function needsReorder(material) {
  return material.active && material.current_stock <= material.min_stock;
}

export function getReorderList() {
  return getMaterials()
    .filter(m => needsReorder(m))
    .map(m => ({
      ...m,
      suggested_quantity: m.reorder_quantity,
      supplier_name: getSuppliers().find(s => s.id === m.supplier_id)?.name || 'Unbekannt',
    }));
}

export function getCriticalCount() {
  return getMaterials().filter(m => m.active && m.current_stock <= m.min_stock).length;
}

export function getTodaysMovements() {
  const today = new Date().toDateString();
  return getMovements().filter(m => new Date(m.created_at).toDateString() === today);
}

export function getTodaysWithdrawals() {
  return getTodaysMovements().filter(m => m.type === 'entnahme');
}

// ── Reset (Entwicklung) ─────────────────────────────────

export function resetAllData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initializeData();
}

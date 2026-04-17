// Supabase Data Service Layer – Cloud-Datenzugriff
// Ersetzt localStorage-Calls durch Supabase-Queries

import { supabase } from './supabase.js';

// ── CRUD: Materials ─────────────────────────────────────

export async function getMaterials() {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function getMaterialById(id) {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createMaterial(material) {
  const { data, error } = await supabase
    .from('materials')
    .insert(material)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMaterial(id, updates) {
  // Remove fields that shouldn't be sent in updates
  const { id: _id, created_at, ...cleanUpdates } = updates;
  const { data, error } = await supabase
    .from('materials')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMaterial(id) {
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── CRUD: Projects ──────────────────────────────────────

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getProjectById(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(id, updates) {
  const { id: _id, created_at, ...cleanUpdates } = updates;
  const { data, error } = await supabase
    .from('projects')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── CRUD: Movements ─────────────────────────────────────

export async function getMovements() {
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMovementsByMaterial(materialId) {
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .eq('material_id', materialId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMovementsByProject(projectId) {
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createMovement(movement) {
  const { data, error } = await supabase
    .from('movements')
    .insert(movement)
    .select()
    .single();
  if (error) throw error;

  // Bestand aktualisieren
  await updateStockFromMovement(movement);

  return data;
}

async function updateStockFromMovement(movement) {
  const material = await getMaterialById(movement.material_id);
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
      stockChange = movement.quantity - material.current_stock;
      break;
    case 'reservierung':
      reservedChange = movement.quantity;
      break;
    case 'reservierung_aufloesen':
      reservedChange = -movement.quantity;
      break;
  }

  await updateMaterial(material.id, {
    current_stock: Math.max(0, material.current_stock + stockChange),
    reserved_stock: Math.max(0, material.reserved_stock + reservedChange),
  });
}

// ── CRUD: Categories ────────────────────────────────────

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function createCategory(category) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, updates) {
  const { id: _id, created_at, ...cleanUpdates } = updates;
  const { data, error } = await supabase
    .from('categories')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── CRUD: Suppliers ─────────────────────────────────────

export async function getSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function createSupplier(supplier) {
  const { data, error } = await supabase
    .from('suppliers')
    .insert(supplier)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSupplier(id, updates) {
  const { id: _id, created_at, ...cleanUpdates } = updates;
  const { data, error } = await supabase
    .from('suppliers')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSupplier(id) {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── Berechnungen ────────────────────────────────────────

export function getAvailableStock(material) {
  return Math.max(0, material.current_stock - material.reserved_stock);
}

export function needsReorder(material) {
  return material.active && material.current_stock <= material.min_stock;
}

export async function getReorderList() {
  const materials = await getMaterials();
  const suppliers = await getSuppliers();

  return materials
    .filter(m => needsReorder(m))
    .map(m => ({
      ...m,
      suggested_quantity: m.reorder_quantity,
      supplier_name: suppliers.find(s => s.id === m.supplier_id)?.name || 'Unbekannt',
    }));
}

export async function getCriticalCount() {
  const materials = await getMaterials();
  return materials.filter(m => m.active && m.current_stock <= m.min_stock).length;
}

export async function getTodaysMovements() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .gte('created_at', today + 'T00:00:00')
    .lte('created_at', today + 'T23:59:59')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTodaysWithdrawals() {
  const movements = await getTodaysMovements();
  return movements.filter(m => m.type === 'entnahme');
}

// ── Seed-Daten in Supabase hochladen ────────────────────

export async function seedDatabase() {
  const { seedCategories, seedSuppliers, seedMaterials, seedProjects, generateSeedMovements } = await import('../data/seedData.js');

  // Prüfe ob bereits Daten vorhanden sind
  const { count } = await supabase
    .from('materials')
    .select('*', { count: 'exact', head: true });

  if (count > 0) {
    console.log('[LagerPro] Datenbank enthält bereits Daten – Seeding übersprungen');
    return false;
  }

  console.log('[LagerPro] Seeding Supabase-Datenbank...');

  // Kategorien einfügen
  const { error: catError } = await supabase
    .from('categories')
    .insert(seedCategories);
  if (catError) throw catError;

  // Lieferanten einfügen
  const { error: supError } = await supabase
    .from('suppliers')
    .insert(seedSuppliers);
  if (supError) throw supError;

  // Materialien einfügen
  const now = new Date().toISOString();
  const materials = seedMaterials.map(m => ({
    ...m,
    created_at: now,
    updated_at: now,
  }));
  const { error: matError } = await supabase
    .from('materials')
    .insert(materials);
  if (matError) throw matError;

  // Projekte einfügen
  const projects = seedProjects.map(p => ({
    ...p,
    created_at: now,
  }));
  const { error: projError } = await supabase
    .from('projects')
    .insert(projects);
  if (projError) throw projError;

  // Lagerbewegungen generieren und einfügen
  const movements = generateSeedMovements(materials);
  // Supabase hat ein Insert-Limit, also in Batches
  const batchSize = 50;
  for (let i = 0; i < movements.length; i += batchSize) {
    const batch = movements.slice(i, i + batchSize);
    const { error: movError } = await supabase
      .from('movements')
      .insert(batch);
    if (movError) throw movError;
  }

  console.log('[LagerPro] Seeding abgeschlossen ✓');
  return true;
}

// ── Reset ───────────────────────────────────────────────

export async function resetAllData() {
  await supabase.from('movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('suppliers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await seedDatabase();
}

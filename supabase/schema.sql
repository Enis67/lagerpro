-- ============================================================
-- LagerPro – Fix: ID-Spalten von UUID auf TEXT ändern
-- Erst altes Schema löschen, dann neu erstellen
-- ============================================================

-- Alte Tabellen löschen (in richtiger Reihenfolge wegen Foreign Keys)
DROP TABLE IF EXISTS movements CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP FUNCTION IF EXISTS update_updated_at CASCADE;

-- ── Kategorien ──────────────────────────────────────────────
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Lieferanten ─────────────────────────────────────────────
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Materialien ─────────────────────────────────────────────
CREATE TABLE materials (
  id TEXT PRIMARY KEY,
  article_number TEXT,
  manufacturer_number TEXT,
  ean_code TEXT,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  unit TEXT DEFAULT 'stueck',
  current_stock NUMERIC DEFAULT 0,
  reserved_stock NUMERIC DEFAULT 0,
  min_stock NUMERIC DEFAULT 0,
  reorder_quantity NUMERIC DEFAULT 1,
  storage_location TEXT,
  supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  purchase_price NUMERIC DEFAULT 0,
  packaging_unit TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Baustellen / Projekte ───────────────────────────────────
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  customer TEXT,
  address TEXT,
  status TEXT DEFAULT 'aktiv',
  planned_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Lagerbewegungen ─────────────────────────────────────────
CREATE TABLE movements (
  id TEXT PRIMARY KEY,
  material_id TEXT REFERENCES materials(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  user_id TEXT,
  type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indizes ─────────────────────────────────────────────────
CREATE INDEX idx_materials_category ON materials(category_id);
CREATE INDEX idx_materials_supplier ON materials(supplier_id);
CREATE INDEX idx_materials_active ON materials(active);
CREATE INDEX idx_movements_material ON movements(material_id);
CREATE INDEX idx_movements_project ON movements(project_id);
CREATE INDEX idx_movements_created ON movements(created_at DESC);

-- ── Auto-Update Trigger ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for materials" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for movements" ON movements FOR ALL USING (true) WITH CHECK (true);

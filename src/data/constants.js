// Konstanten und Enums für die LagerPro App

export const UNITS = [
  { value: 'stueck', label: 'Stück' },
  { value: 'meter', label: 'Meter' },
  { value: 'rolle', label: 'Rolle' },
  { value: 'karton', label: 'Karton' },
  { value: 'set', label: 'Set' },
  { value: 'paar', label: 'Paar' },
  { value: 'liter', label: 'Liter' },
  { value: 'kg', label: 'kg' },
  { value: 'packung', label: 'Packung' },
];

export const UNIT_LABELS = Object.fromEntries(UNITS.map(u => [u.value, u.label]));

export const MOVEMENT_TYPES = [
  { value: 'eingang', label: 'Wareneingang', icon: 'PackagePlus', color: '#10B981' },
  { value: 'entnahme', label: 'Entnahme', icon: 'PackageMinus', color: '#EF4444' },
  { value: 'rueckgabe', label: 'Rückgabe', icon: 'PackageCheck', color: '#3B82F6' },
  { value: 'korrektur', label: 'Korrektur', icon: 'PenLine', color: '#8B5CF6' },
  { value: 'reservierung', label: 'Reservierung', icon: 'BookmarkPlus', color: '#F59E0B' },
  { value: 'reservierung_aufloesen', label: 'Reservierung auflösen', icon: 'BookmarkMinus', color: '#6B7280' },
];

export const MOVEMENT_TYPE_LABELS = Object.fromEntries(MOVEMENT_TYPES.map(t => [t.value, t.label]));
export const MOVEMENT_TYPE_COLORS = Object.fromEntries(MOVEMENT_TYPES.map(t => [t.value, t.color]));

export const PROJECT_STATUSES = [
  { value: 'geplant', label: 'Geplant', color: '#6B7280' },
  { value: 'aktiv', label: 'Aktiv', color: '#10B981' },
  { value: 'pausiert', label: 'Pausiert', color: '#F59E0B' },
  { value: 'abgeschlossen', label: 'Abgeschlossen', color: '#3B82F6' },
];

export const PROJECT_STATUS_LABELS = Object.fromEntries(PROJECT_STATUSES.map(s => [s.value, s.label]));
export const PROJECT_STATUS_COLORS = Object.fromEntries(PROJECT_STATUSES.map(s => [s.value, s.color]));

export const USER_ROLES = [
  { value: 'admin', label: 'Admin / Chef' },
  { value: 'monteur', label: 'Monteur' },
];

// Default-User für MVP (kein Auth)
export const DEFAULT_USER = {
  id: 'user-001',
  name: 'Chef',
  email: 'chef@lagerpro.de',
  role: 'admin',
  active: true,
};

// Bestandsampel-Schwellen
export const STOCK_THRESHOLDS = {
  CRITICAL: 0,    // Bestand = 0
  LOW: 1.0,       // Bestand <= Mindestbestand
  WARNING: 1.5,   // Bestand <= 1.5x Mindestbestand
};

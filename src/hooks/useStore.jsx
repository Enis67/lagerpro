// Global State Management via React Context
// Unterstützt Supabase (Cloud) mit localStorage-Fallback (Offline)
import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { isSupabaseAvailable } from '../services/supabase.js';
import * as cloudDs from '../services/supabaseDataService.js';
import * as localDs from '../services/dataService.js';

const StoreContext = createContext(null);

// Prüfe ob Cloud-Modus aktiv ist
const useCloud = isSupabaseAvailable();

const initialState = {
  materials: [],
  categories: [],
  suppliers: [],
  projects: [],
  movements: [],
  loading: true,
  syncing: false,
  error: null,
  isCloud: useCloud,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload, loading: false, error: null };
    case 'REFRESH':
      return { ...state, ...action.payload, error: null };
    case 'SET_SYNCING':
      return { ...state, syncing: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, syncing: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ── Async wrapper für Cloud-Calls ───────────────────────
async function loadAllCloud() {
  const [materials, categories, suppliers, projects, movements] = await Promise.all([
    cloudDs.getMaterials(),
    cloudDs.getCategories(),
    cloudDs.getSuppliers(),
    cloudDs.getProjects(),
    cloudDs.getMovements(),
  ]);
  return { materials, categories, suppliers, projects, movements };
}

function loadAllLocal() {
  return {
    materials: localDs.getMaterials(),
    categories: localDs.getCategories(),
    suppliers: localDs.getSuppliers(),
    projects: localDs.getProjects(),
    movements: localDs.getMovements(),
  };
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const initRef = useRef(false);

  // ── Initialisierung ─────────────────────────────────
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function initCloud() {
      console.log('[LagerPro] ☁️ Cloud-Modus (Supabase)');
      await cloudDs.seedDatabase();
      const data = await loadAllCloud();
      return data;
    }

    async function initLocal() {
      console.log('[LagerPro] 💾 Offline-Modus (localStorage)');
      localDs.initializeData();
      return loadAllLocal();
    }

    async function init() {
      try {
        if (useCloud) {
          // Timeout: Falls Cloud zu langsam, Fallback auf localStorage
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Cloud-Timeout nach 8s')), 8000)
          );
          const data = await Promise.race([initCloud(), timeoutPromise]);
          dispatch({ type: 'INIT', payload: data });
        } else {
          dispatch({ type: 'INIT', payload: await initLocal() });
        }
      } catch (err) {
        console.error('[LagerPro] Init-Fehler:', err);
        // Fallback auf localStorage bei Cloud-Fehler
        console.log('[LagerPro] Fallback auf localStorage...');
        dispatch({ type: 'INIT', payload: await initLocal() });
        dispatch({ type: 'SET_ERROR', payload: 'Cloud nicht erreichbar – Offline-Modus aktiv' });
      }
    }

    init();
  }, []);

  // ── Refresh ─────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      if (useCloud) {
        dispatch({ type: 'SET_SYNCING', payload: true });
        const data = await loadAllCloud();
        dispatch({ type: 'REFRESH', payload: data });
        dispatch({ type: 'SET_SYNCING', payload: false });
      } else {
        dispatch({ type: 'REFRESH', payload: loadAllLocal() });
      }
    } catch (err) {
      console.error('[LagerPro] Refresh-Fehler:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Synchronisierung fehlgeschlagen' });
    }
  }, []);

  // ── Helper für async Actions ────────────────────────
  const asyncAction = useCallback(async (cloudFn, localFn) => {
    try {
      if (useCloud) {
        await cloudFn();
      } else {
        localFn();
      }
      await refresh();
    } catch (err) {
      console.error('[LagerPro] Aktion fehlgeschlagen:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message });
      throw err;
    }
  }, [refresh]);

  // ── Material Actions ────────────────────────────────
  const addMaterial = useCallback(async (material) => {
    await asyncAction(
      () => cloudDs.createMaterial(material),
      () => localDs.createMaterial(material)
    );
  }, [asyncAction]);

  const editMaterial = useCallback(async (id, updates) => {
    await asyncAction(
      () => cloudDs.updateMaterial(id, updates),
      () => localDs.updateMaterial(id, updates)
    );
  }, [asyncAction]);

  const removeMaterial = useCallback(async (id) => {
    await asyncAction(
      () => cloudDs.deleteMaterial(id),
      () => localDs.deleteMaterial(id)
    );
  }, [asyncAction]);

  // ── Project Actions ─────────────────────────────────
  const addProject = useCallback(async (project) => {
    await asyncAction(
      () => cloudDs.createProject(project),
      () => localDs.createProject(project)
    );
  }, [asyncAction]);

  const editProject = useCallback(async (id, updates) => {
    await asyncAction(
      () => cloudDs.updateProject(id, updates),
      () => localDs.updateProject(id, updates)
    );
  }, [asyncAction]);

  const removeProject = useCallback(async (id) => {
    await asyncAction(
      () => cloudDs.deleteProject(id),
      () => localDs.deleteProject(id)
    );
  }, [asyncAction]);

  // ── Movement Actions ────────────────────────────────
  const addMovement = useCallback(async (movement) => {
    await asyncAction(
      () => cloudDs.createMovement(movement),
      () => localDs.createMovement(movement)
    );
  }, [asyncAction]);

  // ── Category Actions ────────────────────────────────
  const addCategory = useCallback(async (category) => {
    await asyncAction(
      () => cloudDs.createCategory(category),
      () => localDs.createCategory(category)
    );
  }, [asyncAction]);

  const editCategory = useCallback(async (id, updates) => {
    await asyncAction(
      () => cloudDs.updateCategory(id, updates),
      () => localDs.updateCategory(id, updates)
    );
  }, [asyncAction]);

  const removeCategory = useCallback(async (id) => {
    await asyncAction(
      () => cloudDs.deleteCategory(id),
      () => localDs.deleteCategory(id)
    );
  }, [asyncAction]);

  // ── Supplier Actions ────────────────────────────────
  const addSupplier = useCallback(async (supplier) => {
    await asyncAction(
      () => cloudDs.createSupplier(supplier),
      () => localDs.createSupplier(supplier)
    );
  }, [asyncAction]);

  const editSupplier = useCallback(async (id, updates) => {
    await asyncAction(
      () => cloudDs.updateSupplier(id, updates),
      () => localDs.updateSupplier(id, updates)
    );
  }, [asyncAction]);

  const removeSupplier = useCallback(async (id) => {
    await asyncAction(
      () => cloudDs.deleteSupplier(id),
      () => localDs.deleteSupplier(id)
    );
  }, [asyncAction]);

  // ── Reset ───────────────────────────────────────────
  const resetData = useCallback(async () => {
    await asyncAction(
      () => cloudDs.resetAllData(),
      () => localDs.resetAllData()
    );
  }, [asyncAction]);

  // ── Error handling ──────────────────────────────────
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    refresh,
    clearError,
    addMaterial, editMaterial, removeMaterial,
    addProject, editProject, removeProject,
    addMovement,
    addCategory, editCategory, removeCategory,
    addSupplier, editSupplier, removeSupplier,
    resetData,
    // Computed
    getCategoryName: (id) => state.categories.find(c => c.id === id)?.name || '',
    getCategoryColor: (id) => state.categories.find(c => c.id === id)?.color || '#6B7280',
    getSupplierName: (id) => state.suppliers.find(s => s.id === id)?.name || '',
    getProjectName: (id) => state.projects.find(p => p.id === id)?.name || '',
    getMaterialName: (id) => state.materials.find(m => m.id === id)?.name || '',
    getReorderList: () => {
      return state.materials
        .filter(m => m.active && m.current_stock <= m.min_stock)
        .map(m => ({
          ...m,
          suggested_quantity: m.reorder_quantity,
          supplier_name: state.suppliers.find(s => s.id === m.supplier_id)?.name || 'Unbekannt',
        }));
    },
    getCriticalCount: () => state.materials.filter(m => m.active && m.current_stock <= m.min_stock).length,
    getTodaysWithdrawals: () => {
      const today = new Date().toDateString();
      return state.movements.filter(m => m.type === 'entnahme' && new Date(m.created_at).toDateString() === today);
    },
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

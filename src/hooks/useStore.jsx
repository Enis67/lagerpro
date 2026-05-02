// Global State Management via React Context
// Unterstützt Supabase (Cloud) mit localStorage-Fallback (Offline)
import { createContext, useContext, useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import { isSupabaseAvailable, supabase } from '../services/supabase.js';
import { useAuth } from './useAuth.jsx';
import * as cloudDs from '../services/supabaseDataService.js';
import * as localDs from '../services/dataService.js';
import * as offlineQueue from '../services/offlineQueue.js';

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
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  toast: null,
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
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    case 'SET_TOAST':
      return { ...state, toast: action.payload };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
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
  const { userId, isAuthenticated } = useAuth();

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
        if (useCloud && isAuthenticated) {
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
        console.log('[LagerPro] Fallback auf localStorage...');
        dispatch({ type: 'INIT', payload: await initLocal() });
        dispatch({ type: 'SET_ERROR', payload: 'Cloud nicht erreichbar – Offline-Modus aktiv' });
      }
    }

    init();
  }, [isAuthenticated]);

  // ── Refresh ─────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      if (useCloud && isAuthenticated) {
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
  }, [isAuthenticated]);

  // ── Helper für async Actions ────────────────────────
  const asyncAction = useCallback(async (cloudFn, localFn) => {
    try {
      if (useCloud && isAuthenticated) {
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
  }, [refresh, isAuthenticated]);

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
    const enriched = { ...movement, user_id: userId || movement.user_id };
    try {
      // Offline-Modus: lokal speichern + in Queue puffern
      if (!navigator.onLine) {
        localDs.createMovement(enriched);
        offlineQueue.queueAction(enriched);
        await refresh();
        dispatch({
          type: 'SET_TOAST',
          payload: {
            message: 'Offline – wird später synchronisiert',
            type: 'info',
          },
        });
        return;
      }

      if (useCloud && isAuthenticated && supabase) {
        // Prüfe ob Material in Cloud existiert (Foreign Key Check)
        const { data: matExists } = await supabase
          .from('materials')
          .select('id')
          .eq('id', enriched.material_id)
          .single();
        if (!matExists) {
          // Material nicht in Cloud – nur lokal speichern
          console.warn('[LagerPro] Material nicht in Cloud, speichere Bewegung lokal');
          localDs.createMovement(enriched);
          await refresh();
          return;
        }
        await cloudDs.createMovement(enriched);
        await refresh();
      } else {
        localDs.createMovement(enriched);
        await refresh();
      }
    } catch (err) {
      console.error('[LagerPro] Bewegung fehlgeschlagen:', err);
      // Fallback: lokal speichern + in Queue
      localDs.createMovement(enriched);
      offlineQueue.queueAction(enriched);
      await refresh();
      dispatch({
        type: 'SET_TOAST',
        payload: {
          message: 'Server nicht erreichbar – lokal zwischengespeichert',
          type: 'error',
        },
      });
      throw err;
    }
  }, [refresh, isAuthenticated, userId]);

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

  // ── Favorite ────────────────────────────────────────
  const toggleFavorite = useCallback(async (id) => {
    const material = state.materials.find(m => m.id === id);
    if (!material) return;
    const newFavorite = !material.is_favorite;
    try {
      if (useCloud && isAuthenticated && supabase) {
        await supabase.from('materials').update({ is_favorite: newFavorite }).eq('id', id);
      }
      localDs.updateMaterial(id, { is_favorite: newFavorite });
      dispatch({ type: 'REFRESH', payload: { ...state, materials: state.materials.map(m => m.id === id ? { ...m, is_favorite: newFavorite } : m) } });
    } catch (err) {
      console.error('[LagerPro] toggleFavorite fehlgeschlagen:', err);
    }
  }, [state, isAuthenticated]);

  // ── Increment usage ────────────────────────────────
  const incrementUsage = useCallback(async (id) => {
    const material = state.materials.find(m => m.id === id);
    if (!material) return;
    const newCount = (material.usage_count || 0) + 1;
    try {
      if (useCloud && isAuthenticated && supabase) {
        await supabase.from('materials').update({ usage_count: newCount, last_used: new Date().toISOString() }).eq('id', id);
      }
      localDs.updateMaterial(id, { usage_count: newCount, last_used: new Date().toISOString() });
      dispatch({ type: 'REFRESH', payload: { ...state, materials: state.materials.map(m => m.id === id ? { ...m, usage_count: newCount, last_used: new Date().toISOString() } : m) } });
    } catch (err) {
      console.error('[LagerPro] incrementUsage fehlgeschlagen:', err);
    }
  }, [state, isAuthenticated]);

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

  const clearToast = useCallback(() => {
    dispatch({ type: 'CLEAR_TOAST' });
  }, []);

  // Auto-clear errors after 8 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_ERROR' });
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  // ── Online/Offline Status ───────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE', payload: true });
      // Queue automatisch verarbeiten
      if (offlineQueue.getQueueLength() > 0) {
        offlineQueue.processQueue().then(({ processed, failed }) => {
          if (processed > 0) {
            dispatch({
              type: 'SET_TOAST',
              payload: {
                message: `${processed} Offline-Buchung(en) synchronisiert ✓`,
                type: 'success',
              },
            });
          }
          if (failed > 0) {
            dispatch({
              type: 'SET_TOAST',
              payload: {
                message: `${failed} Buchung(en) konnten nicht synchronisiert werden`,
                type: 'error',
              },
            });
          }
          refresh();
        });
      }
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE', payload: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refresh]);

  // Beim Mount: prüfe ob Queue vorhanden und online
  useEffect(() => {
    if (navigator.onLine && offlineQueue.getQueueLength() > 0) {
      offlineQueue.processQueue().then(({ processed }) => {
        if (processed > 0) {
          dispatch({
            type: 'SET_TOAST',
            payload: {
              message: `${processed} Offline-Buchung(en) nach Start synchronisiert ✓`,
              type: 'success',
            },
          });
          refresh();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toast Auto-Clear ────────────────────────────────
  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_TOAST' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  // ── Memoized Lookups (stabile Referenzen) ─────────────
  const categoryMap = useMemo(() => {
    const map = new Map();
    state.categories.forEach(c => map.set(c.id, c));
    return map;
  }, [state.categories]);

  const supplierMap = useMemo(() => {
    const map = new Map();
    state.suppliers.forEach(s => map.set(s.id, s));
    return map;
  }, [state.suppliers]);

  const projectMap = useMemo(() => {
    const map = new Map();
    state.projects.forEach(p => map.set(p.id, p));
    return map;
  }, [state.projects]);

  const materialMap = useMemo(() => {
    const map = new Map();
    state.materials.forEach(m => map.set(m.id, m));
    return map;
  }, [state.materials]);

  // ── Memoized Computed Values ────────────────────────
  const myMaterials = useMemo(() => {
    return state.materials
      .filter(m => m.active && (m.is_favorite || (m.usage_count || 0) > 0))
      .sort((a, b) => {
        if (a.is_favorite && !b.is_favorite) return -1;
        if (!a.is_favorite && b.is_favorite) return 1;
        return (b.usage_count || 0) - (a.usage_count || 0) || new Date(b.last_used || 0) - new Date(a.last_used || 0);
      });
  }, [state.materials]);

  const reorderList = useMemo(() => {
    return state.materials
      .filter(m => m.active && (m.current_stock || 0) <= m.min_stock)
      .map(m => ({
        ...m,
        suggested_quantity: m.reorder_quantity,
        supplier_name: supplierMap.get(m.supplier_id)?.name || 'Unbekannt',
      }));
  }, [state.materials, supplierMap]);

  const criticalCount = useMemo(() => {
    return state.materials.filter(m => m.active && (m.current_stock || 0) <= m.min_stock).length;
  }, [state.materials]);

  const todaysWithdrawals = useMemo(() => {
    const today = new Date().toDateString();
    return state.movements.filter(m => m.type === 'entnahme' && new Date(m.created_at).toDateString() === today);
  }, [state.movements]);

  const stockLevelMap = useMemo(() => {
    const map = new Map();
    state.materials.forEach(m => {
      const stock = m.current_stock || 0;
      const min = m.min_stock || 0;
      let level = 'ok';
      if (stock === 0) level = 'critical';
      else if (stock <= min) level = 'critical';
      else if (stock <= min * 1.5) level = 'warning';
      map.set(m.id, level);
    });
    return map;
  }, [state.materials]);

  const value = {
    ...state,
    refresh,
    clearError,
    clearToast,
    addMaterial, editMaterial, removeMaterial,
    addProject, editProject, removeProject,
    addMovement,
    addCategory, editCategory, removeCategory,
    addSupplier, editSupplier, removeSupplier,
    resetData,
    toggleFavorite,
    incrementUsage,
    // Stabile Lookups
    getCategoryName: useCallback((id) => categoryMap.get(id)?.name || '', [categoryMap]),
    getCategoryColor: useCallback((id) => categoryMap.get(id)?.color || '#6B7280', [categoryMap]),
    getSupplierName: useCallback((id) => supplierMap.get(id)?.name || '', [supplierMap]),
    getProjectName: useCallback((id) => projectMap.get(id)?.name || '', [projectMap]),
    getMaterialName: useCallback((id) => materialMap.get(id)?.name || '', [materialMap]),
    getStockLevel: useCallback((id) => stockLevelMap.get(id) || 'ok', [stockLevelMap]),
    // Memoized Arrays
    getMyMaterials: useCallback(() => myMaterials, [myMaterials]),
    getReorderList: useCallback(() => reorderList, [reorderList]),
    getCriticalCount: useCallback(() => criticalCount, [criticalCount]),
    getTodaysWithdrawals: useCallback(() => todaysWithdrawals, [todaysWithdrawals]),
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

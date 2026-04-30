// Auth Context – Supabase Auth + Benutzer-Rollen
import { createContext, useContext, useEffect, useReducer } from 'react';
import { supabase, getCurrentUser, onAuthStateChange } from '../services/supabase.js';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, loading: false, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, loading: false, isAuthenticated: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Init: Prüfe aktuellen Auth-Status
    async function init() {
      try {
        if (!supabase) {
          dispatch({ type: 'LOGOUT' });
          return;
        }
        const user = await getCurrentUser();
        if (user) {
          dispatch({ type: 'LOGIN', payload: user });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (err) {
        console.error('[Auth] Init-Fehler:', err);
        dispatch({ type: 'LOGOUT' });
      }
    }
    init();

    // Listener für Auth-Änderungen
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) {
        getCurrentUser().then(u => dispatch({ type: 'LOGIN', payload: u }));
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = state.user?.role === 'admin';

  const value = {
    ...state,
    isAdmin,
    userName: state.user?.name || state.user?.email || 'Gast',
    userId: state.user?.id || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

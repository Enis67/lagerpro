import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp } from '../services/supabase.js';
import { useAuth } from '../hooks/useAuth';
import Toast from '../components/Toast';

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Wenn bereits eingeloggt → Dashboard
  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      setToast({ message: 'Erfolgreich eingeloggt ✓', type: 'success' });
      setTimeout(() => navigate('/', { replace: true }), 800);
    } catch (err) {
      setToast({ message: err.message || 'Login fehlgeschlagen', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim()) return;
    if (password.length < 6) {
      setToast({ message: 'Passwort mindestens 6 Zeichen', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim());
      setToast({ message: 'Konto erstellt! Bitte E-Mail bestätigen.', type: 'success' });
      setMode('login');
    } catch (err) {
      setToast({ message: err.message || 'Registrierung fehlgeschlagen', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-xl)',
      background: 'var(--color-bg)',
    }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Logo */}
      <div style={{
        fontSize: '40px',
        fontWeight: 800,
        color: 'var(--color-primary)',
        letterSpacing: '-0.03em',
        marginBottom: 'var(--space-2xl)',
      }}>
        ⚡ LagerPro
      </div>

      <div className="card" style={{ width: '100%', maxWidth: 380, padding: 'var(--space-2xl)' }}>
        <h2 style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
          {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
        </h2>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Name *"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          )}
          <input
            type="email"
            placeholder="E-Mail *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus={mode === 'login'}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Passwort *"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-tertiary)',
                cursor: 'pointer',
                padding: 4,
              }}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 'var(--space-sm)' }}
          >
            {loading ? '...' : mode === 'login' ? (
              <><LogIn size={18} /> Anmelden</>
            ) : (
              <><UserPlus size={18} /> Registrieren</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          {mode === 'login' ? (
            <>
              Noch kein Konto?{' '}
              <button className="btn btn-ghost btn-sm" onClick={() => setMode('register')} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Registrieren
              </button>
            </>
          ) : (
            <>
              Bereits ein Konto?{' '}
              <button className="btn btn-ghost btn-sm" onClick={() => setMode('login')} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Anmelden
              </button>
            </>
          )}
        </div>

        {/* Demo-Hinweis für Offline-Modus */}
        {!import.meta.env.VITE_SUPABASE_URL && (
          <div style={{
            marginTop: 'var(--space-xl)',
            padding: 'var(--space-md)',
            background: 'var(--color-warning-bg)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}>
            <AlertCircle size={16} />
            Cloud nicht konfiguriert – Offline-Modus aktiv
          </div>
        )}
      </div>
    </div>
  );
}

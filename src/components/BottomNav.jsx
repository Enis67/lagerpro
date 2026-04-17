import { NavLink, useLocation } from 'react-router-dom';
import { Home, Package, Zap, HardHat, Menu } from 'lucide-react';
import { useStore } from '../hooks/useStore';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/material', icon: Package, label: 'Material' },
  { to: '/buchen', icon: Zap, label: 'Buchen', primary: true },
  { to: '/baustellen', icon: HardHat, label: 'Baustellen' },
  { to: '/mehr', icon: Menu, label: 'Mehr' },
];

export default function BottomNav() {
  const location = useLocation();
  const { getCriticalCount } = useStore();
  const criticalCount = getCriticalCount();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Hauptnavigation">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = item.to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.to);

        if (item.primary) {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="bottom-nav-item bottom-nav-item--primary"
              aria-label={item.label}
            >
              <div className="nav-icon-wrapper">
                <Icon size={24} />
              </div>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={22} />
              {item.to === '/' && criticalCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--color-danger)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>{criticalCount > 9 ? '9+' : criticalCount}</span>
              )}
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)' }}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

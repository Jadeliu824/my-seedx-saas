import { Lightbulb, Edit3, Layers, BarChart3, LogOut, User, PenTool } from 'lucide-react';
import type { ViewState } from '../App';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { translations, type Language } from '../i18n/translations';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  language?: Language;
  isMobile?: boolean;
}

export function Sidebar({ currentView, onViewChange, language = 'CN', isMobile }: SidebarProps) {
  const { user, loginWithGoogle, logout } = useAuth();
  const t = translations[language];

  const navItems: { id: ViewState; label: string; icon: React.ElementType }[] = [
    { id: 'inbox', label: t.sidebar.inbox, icon: Lightbulb },
    { id: 'style', label: t.style.title, icon: PenTool },
    { id: 'drafts', label: t.sidebar.drafts, icon: Edit3 },
    { id: 'materials', label: t.sidebar.materials, icon: Layers },
    { id: 'analytics', label: t.sidebar.analytics, icon: BarChart3 },
  ];

  if (isMobile) {
    return (
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height)',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 0.5rem',
        zIndex: 1000
      }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                flex: 1,
                padding: '0.5rem 0',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                transition: 'var(--transition)'
              }}
            >
              <Icon size={20} />
              <span style={{ fontSize: '0.625rem', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
            </button>
          );
        })}
        {user ? (
          <button 
            onClick={logout}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '0.25rem', 
              flex: 1,
              color: 'var(--text-secondary)'
            }}
          >
            <img 
              src={user.photoURL || ''} 
              alt="me" 
              style={{ width: 20, height: 20, borderRadius: '50%' }} 
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            {!user.photoURL && <User size={20} />}
            <span style={{ fontSize: '0.625rem' }}>{t.sidebar.logout}</span>
          </button>
        ) : (
          <button 
            onClick={loginWithGoogle}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '0.25rem', 
              flex: 1,
              color: 'var(--accent-primary)'
            }}
          >
            <User size={20} />
            <span style={{ fontSize: '0.625rem' }}>{t.sidebar.login}</span>
          </button>
        )}
      </nav>
    );
  }

  return (
    <aside style={{
      width: '260px',
      borderRight: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem'
    }}>
      <div 
        style={{ 
          marginBottom: '2rem', 
          paddingLeft: '0.75rem',
          borderRadius: 'var(--radius-md)',
          marginLeft: '-0.5rem',
          padding: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M12,22 Q10,14 5,6"
              stroke="var(--accent-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0.3 0.8"
            />
            <path
              d="M12,22 Q14,14 19,6"
              stroke="var(--accent-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="0.3 0.8"
            />
            <path
              d="M3,22 L8,21.5 L12,22 L16,21.5 L21,22"
              stroke="var(--accent-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="0.3 0.8"
            />
          </svg>
          <Link 
            to="/" 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              color: 'inherit', 
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit'; }}
          >
            SeedX
          </Link>
        </div>
        <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>{t.sidebar.tagline}</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const fullLabel = item.id === 'inbox' ? t.sidebar.ideaInbox :
                            item.id === 'style' ? t.style.title :
                            item.id === 'drafts' ? t.sidebar.draftGenerator :
                            item.id === 'materials' ? t.sidebar.materialLibrary :
                            t.sidebar.dataAnalytics;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={18} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              {fullLabel}
            </button>
          );
        })}
      </nav>

      {/* Auth section pinned to bottom */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=random`}
              alt="avatar"
              style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.displayName || t.sidebar.user}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={logout}
              title={t.sidebar.logout}
              style={{
                padding: '0.375rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                transition: 'var(--transition)',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            id="sidebar-google-login-btn"
            onClick={loginWithGoogle}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.625rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-primary)',
              color: '#000000',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'var(--transition)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-primary)'; }}
          >
            <User size={16} />
            {t.sidebar.continueWithGoogle}
          </button>
        )}
      </div>
    </aside>
  );
}


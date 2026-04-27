import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { IdeaInbox } from './views/IdeaInbox';
import { DraftGenerator } from './views/DraftGenerator';
import { StyleView } from './views/StyleView';
import { MaterialLibrary } from './views/MaterialLibrary';
import { AnalyticsView } from './views/AnalyticsView';
import { type Language } from './i18n/translations';

export type ViewState = 'inbox' | 'drafts' | 'style' | 'materials' | 'analytics';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('inbox');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('seedx_language') as Language) || 'EN';
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [devMode, setDevMode] = useState(() => {
    return localStorage.getItem('seedx_dev_mode') === 'true';
  });
  const [plan, setPlan] = useState(() => {
    return localStorage.getItem('seedx_plan') || 'free';
  });


  useEffect(() => {
    localStorage.setItem('seedx_language', language);
  }, [language]);

  useEffect(() => {

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);

    // Listen for navigation to style view
    const handleNavigateToStyle = () => {
      setCurrentView('style');
    };
    window.addEventListener('seedx_navigate_to_style', handleNavigateToStyle);

    // Listen for dev mode changes
    const handleDevModeChanged = () => {
      setDevMode(localStorage.getItem('seedx_dev_mode') === 'true');
      setPlan(localStorage.getItem('seedx_plan') || 'free');
    };
    window.addEventListener('seedx_dev_mode_changed', handleDevModeChanged);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('seedx_navigate_to_style', handleNavigateToStyle);
      window.removeEventListener('seedx_dev_mode_changed', handleDevModeChanged);
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden',
      backgroundColor: 'var(--bg-base)'
    }}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} language={language} isMobile={isMobile} />
      
      <main style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Global App Header with Language Switcher and Dev Mode Indicator */}
        <header style={{
          height: '56px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--page-padding)',
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          {/* Left side - Language switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface-hover)',
            padding: '2px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <button
              onClick={() => setLanguage('CN')}
              style={{
                padding: '0.25rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'calc(var(--radius-md) - 2px)',
                backgroundColor: language === 'CN' ? 'var(--accent-primary)' : 'transparent',
                color: language === 'CN' ? '#000' : 'var(--text-secondary)',
                transition: 'var(--transition)',
              }}
            >
              CN
            </button>
            <button
              onClick={() => setLanguage('EN')}
              style={{
                padding: '0.25rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'calc(var(--radius-md) - 2px)',
                backgroundColor: language === 'EN' ? 'var(--accent-primary)' : 'transparent',
                color: language === 'EN' ? '#000' : 'var(--text-secondary)',
                transition: 'var(--transition)',
              }}
            >
              EN
            </button>
          </div>

          {/* Right side - Plan/Dev mode indicator */}
          {(devMode || plan !== 'free') && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: plan !== 'free' ? 'var(--accent-primary)' : '#10b981',
              backgroundColor: plan !== 'free' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${plan !== 'free' ? 'var(--accent-primary)' : 'rgba(16, 185, 129, 0.3)'}`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: plan !== 'free' ? 'var(--accent-primary)' : '#10b981',
                animation: 'pulse 1.5s infinite'
              }} />
              <span>{plan !== 'free' ? plan : 'DEV'}</span>
            </div>
          )}
        </header>

        <div style={{ 
          flex: 1, 
          padding: 'var(--page-padding)', 
          overflowY: 'auto',
          paddingBottom: isMobile ? 'calc(var(--nav-height) + var(--safe-area-bottom) + 2rem)' : 'var(--page-padding)',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100%' }} className="view-enter">
            {currentView === 'inbox' && <IdeaInbox language={language} isMobile={isMobile} />}
            {currentView === 'drafts' && <DraftGenerator language={language} isMobile={isMobile} />}
            {currentView === 'style' && <StyleView language={language} isMobile={isMobile} />}
            {currentView === 'materials' && <MaterialLibrary language={language} isMobile={isMobile} />}
            {currentView === 'analytics' && <AnalyticsView language={language} isMobile={isMobile} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// Developer mode unlock function
declare global {
  interface Window {
    unlockDev: (password: string) => void;
  }
}

if (typeof window !== 'undefined') {
  window.unlockDev = (password: string) => {
    if (password === 'seedx0824') {
      localStorage.setItem('seedx_dev_mode', 'true');
      window.dispatchEvent(new Event('seedx_dev_mode_changed'));
      console.log('%c🚀 Developer mode unlocked!', 'color: #10b981; font-weight: bold; font-size: 14px;');
      return 'Developer mode unlocked!';
    } else {
      console.error('Invalid password');
      return 'Invalid password';
    }
  };
}


export default App;


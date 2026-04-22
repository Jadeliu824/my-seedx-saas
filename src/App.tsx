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

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('seedx_navigate_to_style', handleNavigateToStyle);
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
        {/* Global App Header with Language Switcher */}
        <header style={{
          height: '60px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 2rem',
          backgroundColor: 'var(--bg-base)',
          position: 'relative',
          zIndex: 10
        }}>
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
        </header>

        <div style={{ 
          flex: 1, 
          padding: isMobile ? '1rem' : '2rem', 
          overflowY: 'auto',
          paddingBottom: isMobile ? 'calc(var(--nav-height) + 1rem)' : '2rem'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', height: '100%' }}>
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

export default App;


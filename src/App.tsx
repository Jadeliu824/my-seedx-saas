import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { IdeaInbox } from './views/IdeaInbox';
import { DraftGenerator } from './views/DraftGenerator';
import { MaterialLibrary } from './views/MaterialLibrary';
import { AnalyticsView } from './views/AnalyticsView';

export type ViewState = 'inbox' | 'drafts' | 'materials' | 'analytics';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('inbox');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      <Sidebar currentView={currentView} onViewChange={setCurrentView} isMobile={isMobile} />
      
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '1rem' : '2rem', 
        overflowY: 'auto',
        paddingBottom: isMobile ? 'calc(var(--nav-height) + 1rem)' : '2rem'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', height: '100%' }}>
          {currentView === 'inbox' && <IdeaInbox />}
          {currentView === 'drafts' && <DraftGenerator />}
          {currentView === 'materials' && <MaterialLibrary isMobile={isMobile} />}
          {currentView === 'analytics' && <AnalyticsView />}
        </div>
      </main>
    </div>
  );
}

export default App;

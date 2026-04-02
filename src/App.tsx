import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { IdeaInbox } from './views/IdeaInbox';
import { DraftGenerator } from './views/DraftGenerator';
import { MaterialLibrary } from './views/MaterialLibrary';
import { AnalyticsView } from './views/AnalyticsView';

export type ViewState = 'inbox' | 'drafts' | 'materials' | 'analytics';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('inbox');

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', height: '100%' }}>
          {currentView === 'inbox' && <IdeaInbox />}
          {currentView === 'drafts' && <DraftGenerator />}
          {currentView === 'materials' && <MaterialLibrary />}
          {currentView === 'analytics' && <AnalyticsView />}
        </div>
      </main>
    </div>
  );
}

export default App;

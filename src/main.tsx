import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { LandingPage } from './components/LandingPage.tsx';
import App from './App.tsx';
import { AdminView } from './views/AdminView.tsx';
import { LegalPage } from './components/LegalPage.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { WorkflowProvider } from './context/WorkflowContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={
            <WorkflowProvider>
              <App />
            </WorkflowProvider>
          } />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/refund" element={<LegalPage type="refund" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);

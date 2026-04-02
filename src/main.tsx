import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { LandingPage } from './components/LandingPage.tsx';
import App from './App.tsx';
import { AdminView } from './views/AdminView.tsx';
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);

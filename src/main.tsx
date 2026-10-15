import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { SettingsProvider } from './state/SettingsContext';
import { ProgressProvider } from './state/ProgressContext';
import { SessionProvider } from './state/SessionContext';
import './styles/wb.css';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <SettingsProvider>
        <ProgressProvider>
          <SessionProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SessionProvider>
        </ProgressProvider>
      </SettingsProvider>
    </ErrorBoundary>
  </StrictMode>,
);

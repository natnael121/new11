import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CardActivationService } from './utils/cardActivationService';

// Start the midnight card deactivation service
CardActivationService.startMidnightDeactivation();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

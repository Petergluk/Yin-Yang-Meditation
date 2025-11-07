import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { LocalizationProvider } from './src/contexts/LocalizationContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LocalizationProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </LocalizationProvider>
  </React.StrictMode>
);

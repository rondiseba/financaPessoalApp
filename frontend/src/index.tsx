import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Ponto de entrada da aplicação React
 * Renderiza o componente App no elemento root do DOM
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

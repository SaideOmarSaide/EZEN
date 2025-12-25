
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usamos './sw.js' para garantir que a busca seja relativa ao diretório atual.
    // Em ambientes de preview (como AI Studio), o registro pode falhar por segurança (domínios diferentes),
    // por isso tratamos como um log de depuração apenas.
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(registration => {
        console.log('SW registrado com sucesso:', registration.scope);
      })
      .catch(err => {
        // Silencia o erro se for apenas um problema de origem em ambiente de desenvolvimento
        if (err.message.includes('origin')) {
          console.debug('Service Worker não suportado neste ambiente de preview (origem cruzada).');
        } else {
          console.warn('Falha ao registrar Service Worker:', err);
        }
      });
  });
}

// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Register SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('Service Worker registrado:', reg);
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // nueva versión disponible
              // Aquí puedes avisar al usuario con un toast y ofrecer recargar
              console.log('Nueva versión disponible — recarga para actualizar');
            }
          });
        });
      })
      .catch(err => console.error('Error registrando SW:', err));
  });
}

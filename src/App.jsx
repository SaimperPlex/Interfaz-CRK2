// src/App.jsx
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Editor from './components/Editor';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [route, setRoute] = useState('/');

  useEffect(() => {
    const readHash = () => {
      // Ejemplo: '#/admin' => '/admin'
      const hash = window.location.hash.replace('#', '') || '/';
      // Normalizar: permitir '/Interfaz-CRK2/#/admin' ó '#/admin'
      const normalized = hash.startsWith('/Interfaz-CRK2') ? hash.replace('/Interfaz-CRK2', '') : hash;
      setRoute(normalized);
    };

    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const navigate = (path) => {
    // path puede ser '/admin' o '/Interfaz-CRK2/admin'
    const short = path.startsWith('/Interfaz-CRK2') ? path.replace('/Interfaz-CRK2', '') : path;
    window.location.hash = short; // => '#/admin'
    setRoute(short);
  };

  if (route === '/admin') return <AdminPanel />;
  if (route === '/editor') return <Editor />;

  return <WelcomeScreen onEnter={() => navigate('/editor')} />;
}

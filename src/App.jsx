import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Editor from './components/Editor';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('/');

  // Detectar la ruta actual
  useEffect(() => {
    const path = window.location.pathname;
    setCurrentRoute(path);

    // Escuchar cambios de ruta
    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Función para navegar
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
  };

  // Renderizar según la ruta
  if (currentRoute === '/Interfaz-CRK2/admin') {
    return <AdminPanel />;
  }

  if (currentRoute === '/Interfaz-CRK2/editor') {
    return <Editor />;
  }

  // Ruta por defecto: WelcomeScreen (CORREGIDO: onEnter en lugar de onStart)
  return <WelcomeScreen onEnter={() => navigate('/Interfaz-CRK2/editor')} />;
}
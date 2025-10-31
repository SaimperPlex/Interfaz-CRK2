import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Editor from './components/Editor';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('redirect');

    // Si llegas desde 404.html con un redirect, corrige la URL
    if (redirectPath) {
      const newPath = `/Interfaz-CRK2${redirectPath}`;
      window.history.replaceState({}, '', newPath);
      setCurrentRoute(newPath);
    } else {
      setCurrentRoute(window.location.pathname);
    }

    // Escucha cambios en la navegación
    const handleRouteChange = () => {
      setCurrentRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Navegación manual
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
  };

  // Rutas
  if (currentRoute === '/Interfaz-CRK2/admin') {
    return <AdminPanel />;
  }

  if (currentRoute === '/Interfaz-CRK2/editor') {
    return <Editor />;
  }

  // Ruta por defecto
  return <WelcomeScreen onEnter={() => navigate('/Interfaz-CRK2/editor')} />;
}

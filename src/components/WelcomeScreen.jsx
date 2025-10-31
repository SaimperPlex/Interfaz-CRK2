import React, { useState, useEffect } from 'react';

export default function WelcomeScreen({ onEnter }) {
  const [welcomeBackground, setWelcomeBackground] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    loadWelcomeBackground();
  }, []);

  const loadWelcomeBackground = () => {
    try {
      // Cargar desde localStorage directamente
      const savedWelcomeBg = localStorage.getItem('welcome-bg');
      
      if (savedWelcomeBg) {
        setWelcomeBackground(savedWelcomeBg);
        console.log('✅ Fondo de bienvenida cargado');
      } else {
        console.log('⚠️ No hay fondo de bienvenida configurado');
      }
    } catch (error) {
      console.error('❌ Error al cargar fondo de bienvenida:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (onEnter) {
      onEnter();
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg sm:text-xl md:text-2xl font-light animate-pulse">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-screen relative overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Background Image */}
      {welcomeBackground ? (
        <img
          src={welcomeBackground}
          alt="Welcome"
          onLoad={() => setImageLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        // Fallback si no hay imagen configurada
        <div className="w-full h-full bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      )}
      
      {/* Indicador de carga de imagen */}
      {welcomeBackground && !imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
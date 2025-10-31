import React, { useState, useRef, useEffect } from 'react';
import { Home, Download, RotateCcw, Undo2, Redo2, Trash2, RotateCw, ZoomIn, ZoomOut, Sun, Moon, ChevronDown } from 'lucide-react';

export default function Editor() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('productos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedFont, setSelectedFont] = useState('Roboto');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [dragging, setDragging] = useState(null);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [productDimensions, setProductDimensions] = useState({ width: 0, height: 0 });
  const elementIdCounter = useRef(0);

  const [eventConfig, setEventConfig] = useState({
    eventName: '',
    editorBackground: null,
    products: [],
    images: [],
    cliparts: []
  });

  const [loading, setLoading] = useState(true);

  const GOOGLE_FONTS = [
    { name: 'Roboto', family: 'Roboto, sans-serif', googleName: 'Roboto' },
    { name: 'Montserrat', family: 'Montserrat, sans-serif', googleName: 'Montserrat' },
    { name: 'Poppins', family: 'Poppins, sans-serif', googleName: 'Poppins' },
    { name: 'Raleway', family: 'Raleway, sans-serif', googleName: 'Raleway' },
    { name: 'Inter', family: 'Inter, sans-serif', googleName: 'Inter' },
    { name: 'Playfair Display', family: "'Playfair Display', serif", googleName: 'Playfair+Display' },
    { name: 'Merriweather', family: 'Merriweather, serif', googleName: 'Merriweather' },
    { name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", googleName: 'Cormorant+Garamond' },
    { name: 'Cinzel', family: 'Cinzel, serif', googleName: 'Cinzel' },
    { name: 'Abril Fatface', family: "'Abril Fatface', serif", googleName: 'Abril+Fatface' },
    { name: 'Dancing Script', family: "'Dancing Script', cursive", googleName: 'Dancing+Script' },
    { name: 'Great Vibes', family: "'Great Vibes', cursive", googleName: 'Great+Vibes' },
    { name: 'Sacramento', family: 'Sacramento, cursive', googleName: 'Sacramento' },
    { name: 'Parisienne', family: 'Parisienne, cursive', googleName: 'Parisienne' },
    { name: 'Tangerine', family: 'Tangerine, cursive', googleName: 'Tangerine' },
    { name: 'Lobster', family: 'Lobster, cursive', googleName: 'Lobster' },
    { name: 'Pacifico', family: 'Pacifico, cursive', googleName: 'Pacifico' },
    { name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", googleName: 'Bebas+Neue' },
    { name: 'Oswald', family: 'Oswald, sans-serif', googleName: 'Oswald' },
    { name: 'Righteous', family: 'Righteous, cursive', googleName: 'Righteous' }
  ];

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    const fontFamilies = GOOGLE_FONTS.map(font => `family=${font.googleName}:wght@400`).join('&');
    link.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  useEffect(() => {
    loadEventConfig();
  }, []);

  const loadEventConfig = () => {
    try {
      const savedEventName = localStorage.getItem('event-name');
      const savedWelcomeBg = localStorage.getItem('welcome-bg');
      const savedEditorBg = localStorage.getItem('editor-bg');
      const savedProducts = localStorage.getItem('products');
      const savedImages = localStorage.getItem('images');
      const savedCliparts = localStorage.getItem('cliparts');

      const data = {
        eventName: savedEventName || '',
        welcomeBackground: savedWelcomeBg || null,
        editorBackground: savedEditorBg || null,
        products: [],
        images: [],
        cliparts: []
      };

      if (savedProducts) {
        try {
          data.products = JSON.parse(savedProducts);
        } catch (e) {
          console.error('Error al parsear productos:', e);
        }
      }

      if (savedImages) {
        try {
          data.images = JSON.parse(savedImages);
        } catch (e) {
          console.error('Error al parsear imágenes:', e);
        }
      }

      if (savedCliparts) {
        try {
          data.cliparts = JSON.parse(savedCliparts);
        } catch (e) {
          console.error('Error al parsear cliparts:', e);
        }
      }

      setEventConfig(data);
      
      if (data.products && data.products.length > 0) {
        setSelectedProduct(data.products[0]);
        loadProductDimensions(data.products[0]);
      }
      
      setSelectedColor('#000000');
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductDimensions = (product) => {
    const img = new window.Image();
    img.onload = () => {
      setProductDimensions({ width: img.width, height: img.height });
      console.log('Dimensiones del producto:', img.width, 'x', img.height);
    };
    img.src = product.image;
  };

  const theme = {
    dark: {
      bg: 'bg-neutral-900',
      bgSecondary: 'bg-neutral-800',
      bgTertiary: 'bg-neutral-700',
      text: 'text-white',
      textSecondary: 'text-neutral-300',
      textMuted: 'text-neutral-500',
      border: 'border-neutral-700',
      borderHover: 'border-neutral-600',
      hover: 'hover:bg-neutral-700',
      hoverSecondary: 'hover:bg-neutral-600',
      iconColor: 'text-white'
    },
    light: {
      bg: 'bg-white',
      bgSecondary: 'bg-gray-50',
      bgTertiary: 'bg-gray-100',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-500',
      border: 'border-gray-300',
      borderHover: 'border-gray-400',
      hover: 'hover:bg-gray-100',
      hoverSecondary: 'hover:bg-gray-200',
      iconColor: 'text-black'
    }
  };

  const t = isDarkMode ? theme.dark : theme.light;

  const addToHistory = (newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const addTextElement = () => {
    if (!textInput.trim()) return;
    const fontFamily = GOOGLE_FONTS.find(f => f.name === selectedFont)?.family || 'Roboto, sans-serif';
    const newElement = {
      id: ++elementIdCounter.current,
      type: 'text',
      content: textInput,
      x: 50,
      y: 50,
      fontSize: 32,
      color: selectedColor,
      fontFamily: fontFamily,
      fontName: selectedFont,
      rotation: 0,
      scale: 1
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setTextInput('');
  };

  const addClipartElement = (clipart) => {
    const newElement = {
      id: ++elementIdCounter.current,
      type: 'clipart',
      content: clipart.image,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      width: 80,
      height: 80
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
  };

  const addImageElement = (image) => {
    const newElement = {
      id: ++elementIdCounter.current,
      type: 'image',
      content: image,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1,
      width: 100,
      height: 100
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
  };

  const updateElement = (id, updates) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
  };

  const commitUpdate = () => {
    addToHistory(elements);
  };

  const deleteElement = (id) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(null);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const reset = () => {
    setElements([]);
    setHistory([]);
    setHistoryIndex(-1);
    setSelectedElement(null);
  };

  const goHome = () => {
    if (window.confirm('¿Volver a la pantalla de inicio? Se perderán los cambios no guardados.')) {
      window.location.href = '/';
    }
  };

  const rotateElement = (degrees) => {
    if (!selectedElement) return;
    const element = elements.find(el => el.id === selectedElement);
    if (element) {
      updateElement(selectedElement, { rotation: (element.rotation + degrees) % 360 });
      commitUpdate();
    }
  };

  const scaleElement = (factor) => {
    if (!selectedElement) return;
    const element = elements.find(el => el.id === selectedElement);
    if (element) {
      const newScale = Math.max(0.5, Math.min(3, element.scale + factor));
      updateElement(selectedElement, { scale: newScale });
      commitUpdate();
    }
  };

  const handleDragStart = (e, element) => {
    e.preventDefault();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    setDragging({
      id: element.id,
      startX: clientX,
      startY: clientY,
      elementX: element.x,
      elementY: element.y
    });
    setSelectedElement(element.id);
  };

  const handleDragMove = (e) => {
    if (!dragging) return;
    const rect = document.getElementById('editor-area').getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const deltaX = ((clientX - dragging.startX) / rect.width) * 100;
    const deltaY = ((clientY - dragging.startY) / rect.height) * 100;
    const newX = Math.max(0, Math.min(100, dragging.elementX + deltaX));
    const newY = Math.max(0, Math.min(100, dragging.elementY + deltaY));
    updateElement(dragging.id, { x: newX, y: newY });
  };

  const handleDragEnd = () => {
    if (dragging) {
      commitUpdate();
      setDragging(null);
    }
  };

  const saveDesign = async () => {
    if (!clientName.trim()) return;

    // Usar las dimensiones originales del producto
    const canvas = document.createElement('canvas');
    canvas.width = productDimensions.width;
    canvas.height = productDimensions.height;
    const ctx = canvas.getContext('2d');

    // Dibujar producto base con transparencia
    if (selectedProduct) {
      const img = new window.Image();
      img.src = selectedProduct.image;
      
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, productDimensions.width, productDimensions.height);
          resolve();
        };
        img.onerror = () => resolve();
      });
    }

    // Dibujar elementos personalizados sobre el producto
    for (const element of elements) {
      ctx.save();
      const x = (element.x / 100) * productDimensions.width;
      const y = (element.y / 100) * productDimensions.height;
      ctx.translate(x, y);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.scale(element.scale, element.scale);
      
      if (element.type === 'text') {
        const fontFamily = GOOGLE_FONTS.find(f => f.name === element.fontName)?.family || element.fontFamily;
        ctx.font = `${element.fontSize}px ${fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.content, 0, 0);
      } else if (element.type === 'clipart' || element.type === 'image') {
        const elementImg = new window.Image();
        elementImg.src = element.content;
        await new Promise((resolve) => {
          elementImg.onload = () => {
            ctx.drawImage(elementImg, -element.width/2, -element.height/2, element.width, element.height);
            resolve();
          };
          elementImg.onerror = () => resolve();
        });
      }
      ctx.restore();
    }

    // Guardar con transparencia (PNG)
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${clientName}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setShowSaveModal(false);
      setShowSuccessModal(true);
      setClientName('');
      setTimeout(() => setShowSuccessModal(false), 2000);
    }, 'image/png');
  };

  const getFontStyle = (fontName) => {
    const font = GOOGLE_FONTS.find(f => f.name === fontName);
    return { fontFamily: font ? font.family : 'Roboto, sans-serif' };
  };

  if (loading) {
    return (
      <div className={`w-full h-screen ${t.bg} flex items-center justify-center`}>
        <p className={`${t.text} text-xl`}>Cargando evento...</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen ${t.bg} flex flex-col overflow-hidden`}>
      <div 
        id="editor-area"
        className="flex-1 relative"
        style={{ 
          backgroundImage: eventConfig.editorBackground 
            ? `url(${eventConfig.editorBackground})` 
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onClick={(e) => {
          // Deseleccionar elemento si se hace clic en el área vacía
          if (e.target.id === 'editor-area' || e.target.classList.contains('absolute')) {
            setSelectedElement(null);
          }
        }}
      >
        {!eventConfig.editorBackground && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: isDarkMode 
                ? 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)'
                : 'linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        )}

        <button onClick={goHome} className={`absolute top-4 left-4 w-10 h-10 ${t.bgSecondary} rounded-full flex items-center justify-center shadow-lg ${t.hover} z-20`}>
          <Home className={`w-5 h-5 ${t.iconColor}`} />
        </button>
        
        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`absolute top-4 right-4 w-10 h-10 ${t.bgSecondary} rounded-full flex items-center justify-center shadow-lg ${t.hover} z-20`}>
          {isDarkMode ? <Sun className={`w-5 h-5 ${t.iconColor}`} /> : <Moon className={`w-5 h-5 ${t.iconColor}`} />}
        </button>

        {selectedProduct && (
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
            style={{ objectFit: 'contain' }}
            draggable="false"
          />
        )}

        {elements.map(element => (
          <div
            key={element.id}
            onMouseDown={(e) => handleDragStart(e, element)}
            onTouchStart={(e) => handleDragStart(e, element)}
            style={{
              position: 'absolute',
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: `translate(-50%, -50%) rotate(${element.rotation}deg) scale(${element.scale})`,
              cursor: 'move',
              fontSize: element.type === 'text' ? `${element.fontSize}px` : undefined,
              color: element.color,
              fontFamily: element.fontFamily,
              userSelect: 'none',
              touchAction: 'none',
              border: selectedElement === element.id ? '2px dashed #2196F3' : 'none',
              padding: element.type === 'text' ? '8px' : '0',
              whiteSpace: element.type === 'text' ? 'nowrap' : 'normal',
              background: selectedElement === element.id ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
              zIndex: 15
            }}
          >
            {element.type === 'text' ? (
              <span style={{ 
                fontFamily: element.fontFamily,
                color: element.color,
                fontSize: `${element.fontSize}px`,
                display: 'inline-block'
              }}>
                {element.content}
              </span>
            ) : (
              <img 
                src={element.content} 
                alt="element" 
                style={{ 
                  width: `${element.width}px`, 
                  height: `${element.height}px`, 
                  pointerEvents: 'none',
                  maxWidth: 'none'
                }} 
              />
            )}
          </div>
        ))}

        {/* Controles flotantes - solo cuando hay elemento seleccionado */}
        {selectedElement && (
          <div className={`fixed bottom-64 left-1/2 transform -translate-x-1/2 ${t.bgSecondary} rounded-xl shadow-2xl p-3 flex items-center gap-3 border-2 ${t.border} z-30`}>
            <button onClick={() => rotateElement(-15)} className={`w-10 h-10 ${t.bgTertiary} rounded-lg flex items-center justify-center ${t.hover}`}>
              <RotateCcw className={`w-5 h-5 ${t.iconColor}`} />
            </button>
            <button onClick={() => rotateElement(15)} className={`w-10 h-10 ${t.bgTertiary} rounded-lg flex items-center justify-center ${t.hover}`}>
              <RotateCw className={`w-5 h-5 ${t.iconColor}`} />
            </button>
            <button onClick={() => scaleElement(-0.1)} className={`w-10 h-10 ${t.bgTertiary} rounded-lg flex items-center justify-center ${t.hover}`}>
              <ZoomOut className={`w-5 h-5 ${t.iconColor}`} />
            </button>
            <button onClick={() => scaleElement(0.1)} className={`w-10 h-10 ${t.bgTertiary} rounded-lg flex items-center justify-center ${t.hover}`}>
              <ZoomIn className={`w-5 h-5 ${t.iconColor}`} />
            </button>
            <button onClick={() => deleteElement(selectedElement)} className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700">
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      <div className={`${t.bgSecondary} ${t.border} border-t flex flex-col`}>
        <div className="flex justify-between items-center p-3">
          <div className="flex gap-2">
            <button onClick={undo} disabled={historyIndex <= 0} className={`w-10 h-10 ${t.bgTertiary} rounded-lg flex items-center justify-center shadow-lg ${t.hover} disabled:opacity-30`}>
              <Undo2 className={`w-5 h-5 ${t.iconColor}`} />
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className={`w-10 h-10 ${t.bgTertiary} rounded-lg flex items-center justify-center shadow-lg ${t.hover} disabled:opacity-30`}>
              <Redo2 className={`w-5 h-5 ${t.iconColor}`} />
            </button>
            <button onClick={reset} className={`w-10 h-10 ${t.bgTertiary} rounded-lg flex items-center justify-center shadow-lg ${t.hover}`}>
              <RotateCcw className={`w-5 h-5 ${t.iconColor}`} />
            </button>
          </div>
          <button onClick={() => setShowSaveModal(true)} className={`w-10 h-10 ${t.bgTertiary} rounded-lg flex items-center justify-center shadow-lg ${t.hover}`}>
            <Download className={`w-5 h-5 ${t.iconColor}`} />
          </button>
        </div>

        <div className={`flex ${t.bgTertiary}`}>
          {['productos', 'cliparts', 'imágenes', 'elementos', 'texto'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium uppercase transition-colors ${
                activeTab === tab 
                  ? `${t.bg} ${t.text}` 
                  : `${t.textMuted} ${t.hover}`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-3 overflow-y-auto" style={{ height: '200px', maxHeight: '40vh' }}>
          {activeTab === 'productos' && (
            <div className="grid grid-cols-4 gap-2">
              {eventConfig.products && eventConfig.products.map(product => (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    loadProductDimensions(product);
                  }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${t.bgTertiary} ${
                    selectedProduct?.id === product.id 
                      ? 'border-blue-500 scale-95' 
                      : `${t.border} ${t.borderHover}`
                  }`}
                >
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                </button>
              ))}
              {(!eventConfig.products || eventConfig.products.length === 0) && (
                <p className={`${t.textMuted} text-center col-span-full py-8 text-sm`}>No hay productos</p>
              )}
            </div>
          )}

          {activeTab === 'cliparts' && (
            <div className="grid grid-cols-5 gap-2">
              {eventConfig.cliparts && eventConfig.cliparts.map((clipart) => (
                <button
                  key={clipart.id}
                  onClick={() => addClipartElement(clipart)}
                  className={`aspect-square ${t.bgTertiary} rounded-lg ${t.hover} transition-colors flex items-center justify-center ${t.border} border p-1`}
                >
                  <img src={clipart.image} alt={clipart.name} className="w-full h-full object-contain" />
                </button>
              ))}
              {(!eventConfig.cliparts || eventConfig.cliparts.length === 0) && (
                <p className={`${t.textMuted} text-center col-span-full py-8 text-sm`}>No hay cliparts</p>
              )}
            </div>
          )}

          {activeTab === 'imágenes' && (
            <div className="grid grid-cols-5 gap-2">
              {eventConfig.images && eventConfig.images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => addImageElement(image.image)}
                  className={`aspect-square ${t.bgTertiary} rounded-lg ${t.hover} transition-colors flex items-center justify-center ${t.border} border p-1`}
                >
                  <img src={image.image} alt={image.name} className="w-full h-full object-contain" />
                </button>
              ))}
              {(!eventConfig.images || eventConfig.images.length === 0) && (
                <p className={`${t.textMuted} text-center col-span-full py-8 text-sm`}>No hay imágenes</p>
              )}
            </div>
          )}

          {activeTab === 'elementos' && (
            <div className="space-y-2">
              {elements.length === 0 ? (
                <p className={`${t.textMuted} text-center py-8 text-sm`}>No hay elementos</p>
              ) : (
                elements.map(element => (
                  <div
                    key={element.id}
                    onClick={() => setSelectedElement(element.id)}
                    className={`${t.bgTertiary} rounded-lg p-3 flex items-center justify-between cursor-pointer border ${
                      selectedElement === element.id 
                        ? 'border-blue-500' 
                        : `${t.border} ${t.borderHover}`
                    }`}
                  >
                    <span className={`${t.text} text-sm truncate`}>
                      {element.type === 'text' ? `Texto: ${element.content}` : 
                       element.type === 'clipart' ? 'Clipart' : 'Imagen'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(element.id);
                      }}
                      className="p-1 hover:bg-red-900 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'texto' && (
            <div className="space-y-3">
              <div className="relative">
                <label className={`block text-sm font-medium mb-2 ${t.textSecondary}`}>
                  Fuente:
                </label>
                <button
                  onClick={() => setShowFontDropdown(!showFontDropdown)}
                  className={`w-full ${t.bgTertiary} ${t.border} border rounded-lg px-3 py-2 flex items-center justify-between ${t.text} text-sm`}
                  style={getFontStyle(selectedFont)}
                >
                  <span>{selectedFont}</span>
                  <ChevronDown className={`w-4 h-4 ${t.iconColor} transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showFontDropdown && (
                  <div className={`absolute z-10 w-full mt-1 ${t.bgTertiary} ${t.border} border rounded-lg shadow-lg max-h-48 overflow-y-auto`}>
                    {GOOGLE_FONTS.map(font => (
                      <button
                        key={font.name}
                        onClick={() => {
                          setSelectedFont(font.name);
                          setShowFontDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left ${t.hover} ${
                          selectedFont === font.name ? 'bg-blue-600 text-white' : t.text
                        }`}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className={`text-sm font-medium ${t.textSecondary} whitespace-nowrap`}>
                  Color del texto:
                </label>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className={`flex-1 ${t.bgTertiary} ${t.border} border rounded-lg px-3 py-2 ${t.text} text-sm font-mono`}
                  placeholder="#000000"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTextElement()}
                  placeholder="Escribir texto..."
                  className={`flex-1 ${t.bgTertiary} ${t.border} border rounded-lg px-3 py-2 ${t.text} placeholder-gray-500 text-sm`}
                />
                <button
                  onClick={addTextElement}
                  disabled={!textInput.trim()}
                  className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className={`${t.bgSecondary} rounded-lg p-6 w-full max-w-sm ${t.border} border`}>
            <h3 className={`text-xl font-medium mb-4 ${t.text}`}>Guardar diseño</h3>
            <label className={`block text-sm font-medium mb-2 ${t.textSecondary}`}>Tu nombre:</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveDesign()}
              placeholder="Escribe tu nombre"
              className={`w-full ${t.bgTertiary} ${t.border} border rounded-lg p-3 mb-4 ${t.text} placeholder-gray-500`}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className={`flex-1 py-2 ${t.border} border ${t.textSecondary} rounded-lg ${t.hover}`}
              >
                Cerrar
              </button>
              <button
                onClick={saveDesign}
                disabled={!clientName.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className={`${t.bgSecondary} rounded-lg p-8 text-center ${t.border} border`}>
            <h3 className={`text-2xl font-medium ${t.text} mb-2`}>¡Diseño guardado!</h3>
            <p className={`text-lg ${t.textSecondary}`}>Descarga completada</p>
          </div>
        </div>
      )}
    </div>
  );
}
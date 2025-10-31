import React, { useState, useRef } from 'react';
import { Home, Download, RotateCcw, Undo2, Redo2, Trash2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

const EVENT_CONFIG = {
  fonts: [
    { name: 'Sans-Serif', value: 'Arial, sans-serif' },
    { name: 'Serif', value: 'Georgia, serif' },
    { name: 'Monospace', value: 'Courier New, monospace' },
    { name: 'Cursive', value: 'Comic Sans MS, cursive' },
    { name: 'FANTASY', value: 'Impact, fantasy' },
    { name: 'Brush Script', value: 'Brush Script MT, cursive' }
  ],
  products: [
    { id: 1, name: 'Producto 1', image: '/lata.png' }
  ],
  cliparts: [
    '⭐', '❤️', '🎉', '🌟', '💎', '🎨', '🌸', '🦋', '👑', '🎁',
    '🌺', '💫', '🔥', '💝', '🌹', '✨', '🎭', '🎪', '🎯', '🏆',
    '🎸', '🎮', '⚡', '🌈', '☀️', '🌙', '⚽', '🏀', '🎵', '🍕'
  ],
  colors: ['#000000', '#4CAF50', '#FF1744', '#2196F3', '#FF9800', '#9C27B0']
};

export default function EventCustomizer() {
  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('productos');
  const [selectedProduct, setSelectedProduct] = useState(EVENT_CONFIG.products[0]);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedFont, setSelectedFont] = useState(EVENT_CONFIG.fonts[0].value);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [dragging, setDragging] = useState(null);
  const canvasRef = useRef(null);
  const elementIdCounter = useRef(0);

  const addToHistory = (newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newElements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const addTextElement = () => {
    if (!textInput.trim()) return;
    
    const newElement = {
      id: ++elementIdCounter.current,
      type: 'text',
      content: textInput,
      x: 50,
      y: 50,
      fontSize: 32,
      color: selectedColor,
      fontFamily: selectedFont,
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
      content: clipart,
      x: 50,
      y: 50,
      fontSize: 48,
      rotation: 0,
      scale: 1
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
    setStarted(false);
    reset();
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
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
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
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

    const canvas = document.createElement('canvas');
    const canvasWidth = 1920;
    const canvasHeight = 1080;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (selectedProduct) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedProduct.image;
      
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          resolve();
        };
        img.onerror = () => resolve();
      });
    }

    elements.forEach(element => {
      ctx.save();
      const x = (element.x / 100) * canvasWidth;
      const y = (element.y / 100) * canvasHeight;
      ctx.translate(x, y);
      ctx.rotate((element.rotation * Math.PI) / 180);
      ctx.scale(element.scale, element.scale);
      
      if (element.type === 'text') {
        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.content, 0, 0);
      } else if (element.type === 'clipart') {
        ctx.font = `${element.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.content, 0, 0);
      }
      
      ctx.restore();
    });

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

  if (!started) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <button
          onClick={() => setStarted(true)}
          className="text-white text-4xl font-light tracking-widest hover:scale-105 transition-transform"
        >
          TAP TO START
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-neutral-800 flex flex-col">
      {/* Canvas Area - 16:9 aspect ratio */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Top Left Controls */}
        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <button onClick={goHome} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100">
            <Home className="w-5 h-5" />
          </button>
          <button onClick={undo} disabled={historyIndex <= 0} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 disabled:opacity-30">
            <Undo2 className="w-5 h-5" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 disabled:opacity-30">
            <Redo2 className="w-5 h-5" />
          </button>
          <button onClick={reset} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 z-20">
          <button onClick={() => setShowSaveModal(true)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100">
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas */}
        <div 
          className="relative shadow-2xl"
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={{
            width: 'min(90vw, calc(90vh * 16/9))',
            aspectRatio: '16/9',
            background: 'transparent'
          }}
        >
          <div 
            ref={canvasRef}
            className="relative w-full h-full overflow-hidden" 
            style={{ 
              background: 'transparent',
              backgroundImage: 'repeating-conic-gradient(#80808020 0% 25%, transparent 0% 50%) 50% / 20px 20px'
            }}
          >
            {selectedProduct && (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="absolute inset-0 w-full h-full pointer-events-none select-none"
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
                  fontSize: `${element.fontSize}px`,
                  color: element.color,
                  fontFamily: element.fontFamily,
                  userSelect: 'none',
                  touchAction: 'none',
                  border: selectedElement === element.id ? '2px dashed #2196F3' : 'none',
                  padding: '8px',
                  whiteSpace: 'nowrap',
                  background: selectedElement === element.id ? 'rgba(33, 150, 243, 0.1)' : 'transparent'
                }}
              >
                {element.content}
              </div>
            ))}
          </div>
        </div>

        {/* Element Controls */}
        {selectedElement && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-neutral-900 rounded-lg shadow-xl p-3 flex items-center gap-3 z-30 border border-neutral-700">
            <button onClick={() => rotateElement(-15)} className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700">
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => rotateElement(15)} className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700">
              <RotateCw className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => scaleElement(-0.1)} className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700">
              <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => scaleElement(0.1)} className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700">
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => deleteElement(selectedElement)} className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center hover:bg-red-700">
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="bg-neutral-900 border-t border-neutral-700">
        {/* Tabs */}
        <div className="flex bg-neutral-800">
          {['productos', 'iconos', 'elementos', 'texto'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-medium uppercase transition-colors ${
                activeTab === tab 
                  ? 'bg-neutral-700 text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="p-3" style={{ height: '180px', overflowY: 'auto' }}>
          {activeTab === 'productos' && (
            <div className="grid grid-cols-6 gap-2">
              {EVENT_CONFIG.products.map(product => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all bg-neutral-800 ${
                    selectedProduct?.id === product.id 
                      ? 'border-blue-500 scale-95' 
                      : 'border-neutral-700 hover:border-neutral-500'
                  }`}
                >
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {activeTab === 'iconos' && (
            <div className="grid grid-cols-10 gap-2">
              {EVENT_CONFIG.cliparts.map((clipart, idx) => (
                <button
                  key={idx}
                  onClick={() => addClipartElement(clipart)}
                  className="aspect-square bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors text-2xl flex items-center justify-center border border-neutral-700"
                >
                  {clipart}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'elementos' && (
            <div className="space-y-2">
              {elements.length === 0 ? (
                <p className="text-neutral-500 text-center py-8 text-sm">No hay elementos agregados</p>
              ) : (
                elements.map(element => (
                  <div
                    key={element.id}
                    onClick={() => setSelectedElement(element.id)}
                    className={`bg-neutral-800 rounded-lg p-3 flex items-center justify-between cursor-pointer border ${
                      selectedElement === element.id 
                        ? 'border-blue-500' 
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    <span className="text-white text-sm truncate">
                      {element.type === 'text' ? element.content : element.content}
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
              {/* Font Selector */}
              <div className="grid grid-cols-3 gap-2">
                {EVENT_CONFIG.fonts.map(font => (
                  <button
                    key={font.name}
                    onClick={() => setSelectedFont(font.value)}
                    className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                      selectedFont === font.value
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>

              {/* Color Palette */}
              <div className="flex gap-2 justify-center">
                {EVENT_CONFIG.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-transform ${
                      selectedColor === color 
                        ? 'border-white scale-110' 
                        : 'border-neutral-700'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTextElement()}
                  placeholder="Escribir texto..."
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 text-sm"
                />
                <button
                  onClick={addTextElement}
                  disabled={!textInput.trim()}
                  className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-sm border border-neutral-700">
            <h3 className="text-xl font-medium mb-4 text-white">AÑADE TU INFORMACIÓN PARA GUARDAR</h3>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Nombre:</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && saveDesign()}
              placeholder="Escribe tu nombre"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 mb-4 text-white placeholder-neutral-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-800"
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg p-8 text-center border border-neutral-700">
            <h3 className="text-2xl font-medium text-white mb-2">DISEÑO GUARDADO</h3>
            <p className="text-lg text-neutral-300">CORRECTAMENTE</p>
          </div>
        </div>
      )}
    </div>
  );
}
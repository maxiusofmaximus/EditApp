import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

/**
 * Componente ImageCanvas - Canvas principal para visualización y edición de imágenes
 */
const ImageCanvas = ({
  imageUrl,
  textBoxes = [],
  selectedTextBoxId,
  onTextBoxSelect,
  onTextBoxCreate,
  onTextBoxUpdate,
  zoomLevel = 1,
  onZoomChange,
  isProcessing = false
}) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingRect, setDrawingRect] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [imageObject, setImageObject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Inicializar canvas de Fabric.js
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      selection: false,
      preserveObjectStacking: true,
      renderOnAddRemove: false,
      skipTargetFind: false,
      allowTouchScrolling: true
    });

    fabricCanvasRef.current = canvas;

    // Configurar eventos del canvas
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('object:selected', handleObjectSelected);
    canvas.on('object:modified', handleObjectModified);
    canvas.on('selection:cleared', handleSelectionCleared);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Cargar imagen
  useEffect(() => {
    console.log('ImageCanvas useEffect - imageUrl:', imageUrl, 'fabricCanvasRef.current:', fabricCanvasRef.current);
    if (!imageUrl || !fabricCanvasRef.current) return;

    console.log('Loading image from URL:', imageUrl);
    fabric.Image.fromURL(imageUrl, (img) => {
      console.log('Image loaded successfully:', img);
      const canvas = fabricCanvasRef.current;
      
      // Limpiar canvas
      canvas.clear();
      
      // Configurar imagen
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true
      });

      // Calcular tamaño del canvas basado en la imagen
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth * 0.8;
      const containerHeight = containerRef.current?.clientHeight || window.innerHeight * 0.8;
      const maxWidth = Math.min(containerWidth * 0.9, 1200); // Máximo 90% del contenedor o 1200px
      const maxHeight = Math.min(containerHeight * 0.9, 800); // Máximo 90% del contenedor o 800px
      
      const imageAspectRatio = img.width / img.height;
      const maxAspectRatio = maxWidth / maxHeight;
      
      let newWidth, newHeight;
      
      if (imageAspectRatio > maxAspectRatio) {
        newWidth = Math.min(maxWidth, img.width);
        newHeight = newWidth / imageAspectRatio;
      } else {
        newHeight = Math.min(maxHeight, img.height);
        newWidth = newHeight * imageAspectRatio;
      }

      // Escalar imagen
      const scale = newWidth / img.width;
      img.scale(scale);

      setCanvasSize({ width: newWidth, height: newHeight });
      setImageObject(img);

      canvas.setDimensions({ width: newWidth, height: newHeight });
      console.log('Adding image to canvas with dimensions:', { width: newWidth, height: newHeight });
      canvas.add(img);
      canvas.renderAll();
      console.log('Canvas rendered with image');

      // Aplicar zoom
      applyZoom(zoomLevel);
    }, { crossOrigin: 'anonymous' }, (error) => {
      console.error('Error loading image:', error);
    });
  }, [imageUrl, zoomLevel]);

  // Actualizar cajas de texto
  useEffect(() => {
    if (!fabricCanvasRef.current || !imageObject) return;

    const canvas = fabricCanvasRef.current;
    
    // Remover cajas de texto existentes
    const objects = canvas.getObjects().filter(obj => obj.type === 'rect' && obj.isTextBox);
    objects.forEach(obj => canvas.remove(obj));

    // Agregar nuevas cajas de texto
    textBoxes.forEach((textBox) => {
      if (textBox.visible === false) return;

      const rect = new fabric.Rect({
        left: textBox.x1 * imageObject.scaleX,
        top: textBox.y1 * imageObject.scaleY,
        width: (textBox.x2 - textBox.x1) * imageObject.scaleX,
        height: (textBox.y2 - textBox.y1) * imageObject.scaleY,
        fill: 'rgba(59, 130, 246, 0.2)',
        stroke: selectedTextBoxId === textBox.id ? '#ef4444' : '#3b82f6',
        strokeWidth: 2,
        strokeDashArray: selectedTextBoxId === textBox.id ? [5, 5] : null,
        selectable: true,
        evented: true,
        isTextBox: true,
        textBoxId: textBox.id,
        hasControls: true,
        hasBorders: true,
        lockRotation: true
      });

      canvas.add(rect);
    });

    canvas.renderAll();
  }, [textBoxes, selectedTextBoxId, imageObject]);

  // Aplicar zoom
  const applyZoom = useCallback((zoom) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.setZoom(zoom);
    
    const newWidth = canvasSize.width * zoom;
    const newHeight = canvasSize.height * zoom;
    
    canvas.setDimensions({ width: newWidth, height: newHeight });
    canvas.renderAll();
  }, [canvasSize]);

  // Aplicar zoom cuando cambie el nivel
  useEffect(() => {
    applyZoom(zoomLevel);
  }, [zoomLevel, applyZoom]);

  // Manejadores de eventos del mouse
  const handleMouseDown = useCallback((e) => {
    if (isProcessing) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.e);

    // Si se hace clic en un objeto existente, no crear nueva selección
    if (e.target && e.target.isTextBox) {
      return;
    }

    // Comenzar a dibujar nueva caja de texto
    setIsDrawing(true);
    
    const rect = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 0,
      height: 0,
      fill: 'rgba(59, 130, 246, 0.2)',
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      isDrawing: true
    });

    setDrawingRect(rect);
    canvas.add(rect);
    canvas.renderAll();
  }, [isProcessing]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing || !drawingRect || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(e.e);
    
    const startX = drawingRect.left;
    const startY = drawingRect.top;
    
    const width = Math.abs(pointer.x - startX);
    const height = Math.abs(pointer.y - startY);
    
    drawingRect.set({
      left: Math.min(startX, pointer.x),
      top: Math.min(startY, pointer.y),
      width: width,
      height: height
    });

    canvas.renderAll();
  }, [isDrawing, drawingRect]);

  const handleMouseUp = useCallback((e) => {
    if (!isDrawing || !drawingRect || !fabricCanvasRef.current || !imageObject) return;

    const canvas = fabricCanvasRef.current;
    
    // Verificar que la caja tenga un tamaño mínimo
    if (drawingRect.width < 10 || drawingRect.height < 10) {
      canvas.remove(drawingRect);
      canvas.renderAll();
      setIsDrawing(false);
      setDrawingRect(null);
      return;
    }

    // Convertir coordenadas del canvas a coordenadas de la imagen
    const imageScale = imageObject.scaleX;
    const x1 = Math.round(drawingRect.left / imageScale);
    const y1 = Math.round(drawingRect.top / imageScale);
    const x2 = Math.round((drawingRect.left + drawingRect.width) / imageScale);
    const y2 = Math.round((drawingRect.top + drawingRect.height) / imageScale);

    // Crear nueva caja de texto
    const newTextBox = {
      id: `manual-${Date.now()}`,
      text: '',
      x1,
      y1,
      x2,
      y2,
      confidence: 1.0,
      language: 'manual'
    };

    // Remover rectángulo temporal
    canvas.remove(drawingRect);
    
    // Notificar creación de nueva caja
    if (onTextBoxCreate) {
      onTextBoxCreate(newTextBox);
    }

    setIsDrawing(false);
    setDrawingRect(null);
    canvas.renderAll();
  }, [isDrawing, drawingRect, imageObject, onTextBoxCreate]);

  const handleObjectSelected = useCallback((e) => {
    const obj = e.target;
    if (obj && obj.isTextBox && obj.textBoxId && onTextBoxSelect) {
      onTextBoxSelect(obj.textBoxId);
    }
  }, [onTextBoxSelect]);

  const handleObjectModified = useCallback((e) => {
    const obj = e.target;
    if (!obj || !obj.isTextBox || !obj.textBoxId || !imageObject) return;

    // Convertir coordenadas modificadas de vuelta a coordenadas de imagen
    const imageScale = imageObject.scaleX;
    const x1 = Math.round(obj.left / imageScale);
    const y1 = Math.round(obj.top / imageScale);
    const x2 = Math.round((obj.left + obj.width * obj.scaleX) / imageScale);
    const y2 = Math.round((obj.top + obj.height * obj.scaleY) / imageScale);

    if (onTextBoxUpdate) {
      onTextBoxUpdate(obj.textBoxId, { x1, y1, x2, y2 });
    }
  }, [imageObject, onTextBoxUpdate]);

  const handleSelectionCleared = useCallback(() => {
    if (onTextBoxSelect) {
      onTextBoxSelect(null);
    }
  }, [onTextBoxSelect]);

  // Controles de zoom
  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel * 1.2, 5);
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.2, 0.1);
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  };

  const handleZoomReset = () => {
    if (onZoomChange) {
      onZoomChange(1);
    }
  };

  // Ajustar tamaño del contenedor
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && fabricCanvasRef.current) {
        // Recalcular tamaño si es necesario
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="image-canvas-container" ref={containerRef}>
      {/* Controles de zoom flotantes */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-1">
        <button
          onClick={handleZoomIn}
          disabled={isProcessing || zoomLevel >= 5}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50"
          title="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <div className="text-xs text-center text-gray-600 px-1">
          {Math.round(zoomLevel * 100)}%
        </div>
        
        <button
          onClick={handleZoomOut}
          disabled={isProcessing || zoomLevel <= 0.1}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50"
          title="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <button
          onClick={handleZoomReset}
          disabled={isProcessing}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded disabled:opacity-50"
          title="Zoom 100%"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Indicador de modo de dibujo */}
      {isDrawing && (
        <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm">
          <Move className="w-4 h-4 inline mr-1" />
          Arrastra para seleccionar texto
        </div>
      )}

      {/* Canvas */}
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className={`image-canvas ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        />
      </div>

      {/* Overlay de carga */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Procesando imagen...</p>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      {!imageUrl && !isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center text-center text-gray-500">
          <div>
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Move className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Carga una imagen de manga</h3>
            <p className="text-sm">
              Arrastra una imagen aquí o usa el botón "Cargar" para comenzar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCanvas;
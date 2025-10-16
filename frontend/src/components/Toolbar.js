import React, { useState } from 'react';
import { 
  Wand2,
  Languages,
  Eye,
  EyeOff,
  RotateCcw,
  RotateCw,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw as RotateLeft,
  Download
} from 'lucide-react';

/**
 * Componente Toolbar - Barra de herramientas flotante contextual
 */
const Toolbar = ({
  onAutoDetect,
  onTranslateAll,
  onPreviewRemoval,
  onUndo,
  onRedo,
  onClearSelections,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onSave,
  hasImage,
  hasTextBoxes,
  hasTranslations,
  canUndo,
  canRedo,
  isProcessing,
  zoomLevel
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!hasImage) return null;

  // Si está oculto, mostrar solo el botón de ojo
  if (!isVisible) {
    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 hover:bg-gray-50 transition-colors"
          title="Mostrar barra de herramientas"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex items-center space-x-1">
          {/* Grupo de procesamiento */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-200">
            <button
              onClick={onAutoDetect}
              disabled={isProcessing}
              className="toolbar-btn toolbar-btn-primary"
              title="Detectar texto automáticamente"
            >
              <Wand2 className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Detectar</span>
            </button>

            <button
              onClick={onTranslateAll}
              disabled={isProcessing || !hasTextBoxes}
              className="toolbar-btn toolbar-btn-primary"
              title="Traducir todo el texto"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Traducir</span>
            </button>

            <button
              onClick={onPreviewRemoval}
              disabled={isProcessing || !hasTextBoxes}
              className="toolbar-btn"
              title="Vista previa de remoción de texto"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Vista previa</span>
            </button>
          </div>

          {/* Grupo de edición */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-200">
            <button
              onClick={onUndo}
              disabled={!canUndo || isProcessing}
              className="toolbar-btn"
              title="Deshacer (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo || isProcessing}
              className="toolbar-btn"
              title="Rehacer (Ctrl+Y)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClearSelections}
              disabled={!hasTextBoxes || isProcessing}
              className="toolbar-btn"
              title="Limpiar selecciones"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Grupo de vista */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-200">
            <button
              onClick={onZoomOut}
              disabled={isProcessing}
              className="toolbar-btn"
              title="Alejar"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <div className="px-2 py-1 text-xs text-gray-600 min-w-[50px] text-center bg-gray-50 rounded">
              {Math.round(zoomLevel * 100)}%
            </div>

            <button
              onClick={onZoomIn}
              disabled={isProcessing}
              className="toolbar-btn"
              title="Acercar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={onZoomReset}
              disabled={isProcessing}
              className="toolbar-btn"
              title="Zoom 100%"
            >
              <RotateLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Guardar */}
          {hasTranslations && (
            <button
              onClick={onSave}
              disabled={isProcessing}
              className="toolbar-btn toolbar-btn-success"
              title="Guardar imagen traducida"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Guardar</span>
            </button>
          )}

          {/* Ocultar barra de herramientas */}
          <button
            onClick={() => setIsVisible(false)}
            className="toolbar-btn ml-1"
            title="Ocultar barra de herramientas"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>

        {/* Indicador de procesamiento */}
        {isProcessing && (
          <div className="mt-2 flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1">
              <div className="bg-blue-500 h-1 rounded-full animate-pulse w-1/3"></div>
            </div>
            <span className="text-xs text-gray-600">Procesando...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
import React from 'react';
import { Loader2, Upload, Eye, Languages, Download, Wand2 } from 'lucide-react';

/**
 * Componente LoadingOverlay - Overlay de carga con diferentes estados
 */
const LoadingOverlay = ({
  isVisible,
  message = 'Procesando...',
  progress = null,
  type = 'default',
  onCancel = null
}) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'upload':
        return <Upload className="w-8 h-8 text-blue-500" />;
      case 'ocr':
        return <Eye className="w-8 h-8 text-purple-500" />;
      case 'translate':
        return <Languages className="w-8 h-8 text-green-500" />;
      case 'edit':
        return <Wand2 className="w-8 h-8 text-orange-500" />;
      case 'download':
        return <Download className="w-8 h-8 text-indigo-500" />;
      default:
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'upload':
        return 'Subiendo imagen';
      case 'ocr':
        return 'Detectando texto';
      case 'translate':
        return 'Traduciendo texto';
      case 'edit':
        return 'Editando imagen';
      case 'download':
        return 'Preparando descarga';
      default:
        return 'Procesando';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'upload':
        return 'Subiendo y validando la imagen...';
      case 'ocr':
        return 'Analizando la imagen y detectando texto...';
      case 'translate':
        return 'Traduciendo el texto detectado...';
      case 'edit':
        return 'Aplicando traducciones a la imagen...';
      case 'download':
        return 'Generando archivo para descarga...';
      default:
        return 'Por favor espera mientras procesamos tu solicitud...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeInUp">
        {/* Icono y animación */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            {getIcon()}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {getTitle()}
          </h3>
          
          <p className="text-sm text-gray-600">
            {message || getDescription()}
          </p>
        </div>

        {/* Barra de progreso */}
        {progress !== null ? (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          /* Spinner animado si no hay progreso específico */
          <div className="mb-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        )}

        {/* Pasos del proceso */}
        {type === 'ocr' && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Imagen cargada</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span>Detectando texto...</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              <span>Procesando resultados</span>
            </div>
          </div>
        )}

        {type === 'translate' && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Texto detectado</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span>Traduciendo...</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              <span>Finalizando</span>
            </div>
          </div>
        )}

        {type === 'edit' && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Traducciones listas</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span>Editando imagen...</span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              <span>Generando resultado</span>
            </div>
          </div>
        )}

        {/* Botón de cancelar */}
        {onCancel && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Consejos */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="text-xs text-blue-700">
              {type === 'ocr' && (
                <span>
                  <strong>Consejo:</strong> Las imágenes con mejor calidad y contraste producen mejores resultados de detección de texto.
                </span>
              )}
              {type === 'translate' && (
                <span>
                  <strong>Consejo:</strong> Puedes editar las traducciones manualmente después del proceso automático.
                </span>
              )}
              {type === 'edit' && (
                <span>
                  <strong>Consejo:</strong> El proceso de edición puede tomar más tiempo con imágenes de alta resolución.
                </span>
              )}
              {type === 'upload' && (
                <span>
                  <strong>Consejo:</strong> Formatos soportados: JPG, PNG, BMP, TIFF, WebP. Tamaño máximo: 10MB.
                </span>
              )}
              {type === 'default' && (
                <span>
                  <strong>Consejo:</strong> Este proceso puede tomar unos momentos dependiendo del tamaño de la imagen.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para gestionar estados de carga
 */
export const useLoadingOverlay = () => {
  const [loadingState, setLoadingState] = React.useState({
    isVisible: false,
    message: '',
    progress: null,
    type: 'default'
  });

  const showLoading = (type = 'default', message = '', progress = null) => {
    setLoadingState({
      isVisible: true,
      type,
      message,
      progress
    });
  };

  const updateProgress = (progress) => {
    setLoadingState(prev => ({
      ...prev,
      progress
    }));
  };

  const updateMessage = (message) => {
    setLoadingState(prev => ({
      ...prev,
      message
    }));
  };

  const hideLoading = () => {
    setLoadingState({
      isVisible: false,
      message: '',
      progress: null,
      type: 'default'
    });
  };

  return {
    loadingState,
    showLoading,
    updateProgress,
    updateMessage,
    hideLoading
  };
};

export default LoadingOverlay;
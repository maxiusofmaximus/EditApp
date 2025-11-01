import React from 'react';
import { 
  Upload, 
  Languages,
  Settings
} from 'lucide-react';
import SecurityService from '../services/SecurityService';
import { toast } from 'react-toastify';

/**
 * Componente Header - Barra de navegación principal
 */
const Header = ({
  onImageLoad,
  onSettings,
  hasImage,
  isProcessing
}) => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Validar archivo con SecurityService
        await SecurityService.validateFile(file);
        
        // Escanear archivo con el servidor de seguridad
        const scanResult = await SecurityService.scanFile(file);
        
        if (!scanResult.safe) {
          toast.error(`Archivo no seguro: ${scanResult.reason}`);
          event.target.value = '';
          return;
        }
        
        // El toast de éxito se muestra en App.js después de cargar la imagen
        if (onImageLoad) {
          onImageLoad(file);
        }
      } catch (error) {
        toast.error(`Error de validación: ${error.message}`);
        event.target.value = '';
        return;
      }
    }
    // Limpiar el input para permitir seleccionar el mismo archivo
    event.target.value = '';
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Languages className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Manga Translator
              </h1>
            </div>
          </div>

          {/* Acciones principales */}
          <div className="flex items-center space-x-3">
            {/* Cargar imagen */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              <button
                className="btn-minimal btn-minimal-primary"
                disabled={isProcessing}
                title="Cargar imagen de manga"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Cargar</span>
              </button>
            </div>

            {/* Separador */}
            <div className="w-px h-6 bg-gray-300" />

            {/* Configuración */}
            <button
              onClick={onSettings}
              className="btn-minimal btn-minimal-ghost"
              title="Configuración"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </button>
          </div>
        </div>

        {/* Barra de estado */}
        {isProcessing && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse w-1/3"></div>
            </div>
            <span className="text-sm text-gray-600">Procesando...</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
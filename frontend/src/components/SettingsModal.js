import React, { useState, useEffect } from 'react';
import { X, Globe, Image, Zap, Save, RotateCcw } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    // Configuraciones de idioma
    language: 'es',
    
    // Configuraciones de imagen
    imageQuality: 'high',
    maxImageSize: '10',
    autoResize: true,
    
    // Configuraciones de zoom
    defaultZoom: '100',
    zoomStep: '25',
    maxZoom: '300',
    
    // Configuraciones de traducción
    translationService: 'google',
    autoDetectLanguage: true,
    sourceLanguage: 'auto',
    targetLanguage: 'es',
    
    // Configuraciones de interfaz
    theme: 'light',
    showTooltips: true,
    autoSave: false,
    
    // Configuraciones de seguridad
    enableSecurityScan: true,
    allowedFileTypes: 'jpg,jpeg,png,gif,bmp,webp'
  });

  // Cargar configuraciones desde localStorage al abrir
  useEffect(() => {
    if (isOpen) {
      const savedSettings = localStorage.getItem('editapp-settings');
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    }
  }, [isOpen]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Guardar en localStorage
    localStorage.setItem('editapp-settings', JSON.stringify(settings));
    
    // Notificar al componente padre
    if (onSave) {
      onSave(settings);
    }
    
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres restablecer todas las configuraciones a sus valores por defecto?')) {
      localStorage.removeItem('editapp-settings');
      setSettings({
        language: 'es',
        imageQuality: 'high',
        maxImageSize: '10',
        autoResize: true,
        defaultZoom: '100',
        zoomStep: '25',
        maxZoom: '300',
        translationService: 'google',
        autoDetectLanguage: true,
        sourceLanguage: 'auto',
        targetLanguage: 'es',
        theme: 'light',
        showTooltips: true,
        autoSave: false,
        enableSecurityScan: true,
        allowedFileTypes: 'jpg,jpeg,png,gif,bmp,webp'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Configuración</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Configuraciones de Idioma */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe size={20} className="text-blue-600" />
              <h3 className="text-lg font-medium text-gray-800">Idioma e Internacionalización</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma de la interfaz
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma objetivo para traducción
                </label>
                <select
                  value={settings.targetLanguage}
                  onChange={(e) => handleSettingChange('targetLanguage', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="fr">Francés</option>
                  <option value="de">Alemán</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Portugués</option>
                  <option value="ja">Japonés</option>
                  <option value="ko">Coreano</option>
                  <option value="zh">Chino</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuraciones de Imagen */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image size={20} className="text-green-600" />
              <h3 className="text-lg font-medium text-gray-800">Procesamiento de Imágenes</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calidad de imagen
                </label>
                <select
                  value={settings.imageQuality}
                  onChange={(e) => handleSettingChange('imageQuality', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Baja (más rápido)</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta (recomendado)</option>
                  <option value="ultra">Ultra (más lento)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamaño máximo (MB)
                </label>
                <select
                  value={settings.maxImageSize}
                  onChange={(e) => handleSettingChange('maxImageSize', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="5">5 MB</option>
                  <option value="10">10 MB</option>
                  <option value="20">20 MB</option>
                  <option value="50">50 MB</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zoom por defecto (%)
                </label>
                <select
                  value={settings.defaultZoom}
                  onChange={(e) => handleSettingChange('defaultZoom', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="50">50%</option>
                  <option value="75">75%</option>
                  <option value="100">100%</option>
                  <option value="125">125%</option>
                  <option value="150">150%</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incremento de zoom (%)
                </label>
                <select
                  value={settings.zoomStep}
                  onChange={(e) => handleSettingChange('zoomStep', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="10">10%</option>
                  <option value="25">25%</option>
                  <option value="50">50%</option>
                </select>
              </div>
            </div>
            
            <div className="ml-7">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.autoResize}
                  onChange={(e) => handleSettingChange('autoResize', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Redimensionar automáticamente imágenes grandes</span>
              </label>
            </div>
          </div>

          {/* Configuraciones de Traducción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap size={20} className="text-purple-600" />
              <h3 className="text-lg font-medium text-gray-800">Traducción y OCR</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servicio de traducción
                </label>
                <select
                  value={settings.translationService}
                  onChange={(e) => handleSettingChange('translationService', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="google">Google Translate</option>
                  <option value="deepl">DeepL</option>
                  <option value="microsoft">Microsoft Translator</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma de origen
                </label>
                <select
                  value={settings.sourceLanguage}
                  onChange={(e) => handleSettingChange('sourceLanguage', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="auto">Detectar automáticamente</option>
                  <option value="en">Inglés</option>
                  <option value="es">Español</option>
                  <option value="fr">Francés</option>
                  <option value="de">Alemán</option>
                  <option value="ja">Japonés</option>
                  <option value="ko">Coreano</option>
                  <option value="zh">Chino</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuraciones de Seguridad */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Save size={20} className="text-red-600" />
              <h3 className="text-lg font-medium text-gray-800">Seguridad y Archivos</h3>
            </div>
            
            <div className="ml-7 space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.enableSecurityScan}
                  onChange={(e) => handleSettingChange('enableSecurityScan', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Escanear archivos en busca de amenazas</span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipos de archivo permitidos
                </label>
                <input
                  type="text"
                  value={settings.allowedFileTypes}
                  onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value)}
                  placeholder="jpg,jpeg,png,gif,bmp,webp"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Separar con comas</p>
              </div>
            </div>
          </div>

          {/* Configuraciones Generales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Configuraciones Generales</h3>
            
            <div className="ml-7 space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.showTooltips}
                  onChange={(e) => handleSettingChange('showTooltips', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Mostrar tooltips de ayuda</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Guardado automático</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
          >
            <RotateCcw size={16} />
            <span>Restablecer</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
            >
              <Save size={16} />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
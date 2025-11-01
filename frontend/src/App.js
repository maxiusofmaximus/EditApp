import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Componentes
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import ImageCanvas from './components/ImageCanvas';
import TranslationPanel from './components/TranslationPanel';
import LoadingOverlay from './components/LoadingOverlay';
import SettingsModal from './components/SettingsModal';

// Hooks y utilidades
import { useImageProcessing } from './hooks/useImageProcessing';
import { useElectronMenu } from './hooks/useElectronMenu';
import { apiService } from './services/apiService';
import SecurityService from './services/SecurityService';

// Estilos
import './App.css';

function App() {
  // Estados principales
  const [currentImage, setCurrentImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [textBoxes, setTextBoxes] = useState([]);
  const [translations, setTranslations] = useState([]);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Estados de la interfaz
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [translationPanelOpen, setTranslationPanelOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState('select'); // 'select', 'draw', 'erase'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [appSettings, setAppSettings] = useState({});
  
  // Estados para drag & drop
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Hook personalizado para procesamiento de imágenes
  const {
    processImage,
    translateTexts,
    editImage,
    isProcessing
  } = useImageProcessing();

  // Funciones del menú (definidas antes de useElectronMenu)
  const handleSave = useCallback(async () => {
    if (!currentImage) {
      toast.warning('No hay imagen para guardar');
      return;
    }
    
    try {
      // Implementar guardado
      toast.success('Imagen guardada');
    } catch (error) {
      toast.error('Error al guardar');
    }
  }, [currentImage]);

  const handleSaveAs = useCallback(async () => {
    if (!currentImage) {
      toast.warning('No hay imagen para guardar');
      return;
    }
    
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.showSaveDialog();
        if (!result.canceled) {
          // Implementar guardado con ruta específica
          toast.success('Imagen guardada como...');
        }
      }
    } catch (error) {
      toast.error('Error al guardar');
    }
  }, [currentImage]);

  const handleUndo = useCallback(() => {
    // Implementar deshacer
    toast.info('Deshacer');
  }, []);

  const handleRedo = useCallback(() => {
    // Implementar rehacer
    toast.info('Rehacer');
  }, []);

  const handleClearSelections = useCallback(() => {
    setSelectedBoxIndex(null);
    setTextBoxes([]);
    setTranslations([]);
    toast.info('Selecciones limpiadas');
  }, []);

  const handleSettings = useCallback(() => {
    setShowSettingsModal(true);
  }, []);

  const handleSettingsSave = useCallback((newSettings) => {
    setAppSettings(newSettings);
    toast.success('Configuración guardada exitosamente');
  }, []);

  // Manejar carga de imagen
  const handleImageLoad = useCallback(async (file) => {
    console.log('🚀 handleImageLoad called with file:', file);
    console.log('📄 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    if (!file) return;
    
    setIsLoading(true);
    setLoadingMessage('Cargando imagen...');
    
    try {
      // Crear URL para mostrar la imagen
      const imageUrl = URL.createObjectURL(file);
      console.log('🔗 Created image URL:', imageUrl);
      
      // ✅ NUEVO: Convertir imagen a base64 INMEDIATAMENTE después de seleccionarla
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalBase64 = e.target.result;
        console.log('🎯 IMAGEN ORIGINAL - Base64 completo inmediatamente después de seleccionar:');
        console.log(originalBase64);
        console.log('📊 Tamaño de la imagen original en base64:', originalBase64.length, 'caracteres');
        
        // Verificar que no esté en blanco
        if (originalBase64.length < 1000) {
          console.error('⚠️ PROBLEMA: La imagen original es demasiado pequeña, posiblemente corrupta');
        } else {
          console.log('✅ La imagen original tiene un tamaño válido');
        }
      };
      reader.readAsDataURL(file);
      
      // Verificar que la URL sea válida
      const testImg = new Image();
      testImg.onload = () => {
        console.log('✅ Image URL is valid and loadable');
        console.log('📏 Image natural dimensions:', {
          width: testImg.naturalWidth,
          height: testImg.naturalHeight
        });
        
        // ✅ NUEVO: Convertir la imagen cargada a base64 para comparar
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = testImg.naturalWidth;
        canvas.height = testImg.naturalHeight;
        ctx.drawImage(testImg, 0, 0);
        const loadedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        console.log('🎯 IMAGEN DESPUÉS DE CARGAR - Base64 completo después de cargar en testImg:');
        console.log(loadedBase64);
        console.log('📊 Tamaño después de cargar:', loadedBase64.length, 'caracteres');
      };
      testImg.onerror = (error) => {
        console.error('❌ Image URL failed to load:', error);
      };
      testImg.src = imageUrl;
      
      console.log('📝 Updating state with new image...');
      setCurrentImage(imageUrl);
      setImageFile(file);
      
      // Limpiar estados anteriores
      setTextBoxes([]);
      setTranslations([]);
      setSelectedBoxIndex(null);
      
      console.log('✅ State updated successfully');
      
      // ✅ NUEVO: Probar upload al backend para rastrear el procesamiento
      try {
        console.log('🔄 PRUEBA - Enviando imagen al backend para verificar procesamiento...');
        const uploadResult = await processImage(file);
        console.log('✅ PRUEBA - Upload al backend completado:', uploadResult);
      } catch (uploadError) {
        console.log('⚠️ PRUEBA - Error en upload al backend (esto es normal si no hay endpoints OCR):', uploadError.message);
        
        // Intentar solo el upload básico
        try {
          console.log('🔄 PRUEBA - Intentando upload básico...');
          const { uploadImage } = await import('./services/apiService');
          const basicUpload = await uploadImage(file);
          console.log('✅ PRUEBA - Upload básico completado:', basicUpload);
        } catch (basicError) {
          console.log('⚠️ PRUEBA - Error en upload básico:', basicError.message);
        }
      }
      
      toast.success('Imagen validada y cargada exitosamente');
    } catch (error) {
      console.error('❌ Error cargando imagen:', error);
      toast.error('Error al cargar la imagen');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Funciones para drag & drop
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo cambiar el estado si realmente salimos del área de drop
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      // Validar el archivo con SecurityService antes de cargarlo
      try {
        setIsLoading(true);
        setLoadingMessage('Validando archivo...');
        
        // Validar archivo con SecurityService
        await SecurityService.validateFile(imageFile);
        
        // Escanear archivo con el servidor de seguridad
        const scanResult = await SecurityService.scanFile(imageFile);
        if (scanResult.safe) {
          await handleImageLoad(imageFile);
        } else {
          toast.error(`Archivo no seguro: ${scanResult.reason}`);
        }
      } catch (error) {
        console.error('Error validating dropped file:', error);
        toast.error('Error al validar el archivo');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Por favor, arrastra un archivo de imagen válido');
    }
  }, [handleImageLoad]);

  // Manejar archivo abierto desde Electron
  const handleFileOpened = useCallback(async (filePath) => {
    try {
      const response = await fetch(`file://${filePath}`);
      const blob = await response.blob();
      const file = new File([blob], filePath.split('/').pop(), { type: blob.type });
      await handleImageLoad(file);
    } catch (error) {
      console.error('Error abriendo archivo:', error);
      toast.error('Error al abrir el archivo');
    }
  }, [handleImageLoad]);

  // Detección automática de texto
  const handleAutoDetect = useCallback(async () => {
    if (!imageFile) {
      toast.warning('Primero carga una imagen');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Detectando texto en la imagen...');

    try {
      const result = await processImage(imageFile);
      setTextBoxes(result.textBoxes);
      setTranslations(new Array(result.textBoxes.length).fill(''));
      
      toast.success(`Detectados ${result.textBoxes.length} globos de texto`);
      
      if (result.textBoxes.length > 0) {
        setTranslationPanelOpen(true);
      }
    } catch (error) {
      console.error('Error en detección automática:', error);
      toast.error('Error al detectar texto');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, processImage]);

  // Traducir todos los textos
  const handleTranslateAll = useCallback(async () => {
    if (textBoxes.length === 0) {
      toast.warning('No hay texto para traducir');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Traduciendo textos...');

    try {
      const texts = textBoxes.map(box => box.text);
      const translatedTexts = await translateTexts(texts);
      setTranslations(translatedTexts);
      
      toast.success('Textos traducidos exitosamente');
      setTranslationPanelOpen(true);
    } catch (error) {
      console.error('Error en traducción:', error);
      toast.error('Error al traducir textos');
    } finally {
      setIsLoading(false);
    }
  }, [textBoxes, translateTexts]);

  // Configurar menús de Electron
  useElectronMenu({
    onSave: handleSave,
    onSaveAs: handleSaveAs,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onClearSelections: handleClearSelections,
    onAutoDetect: handleAutoDetect,
    onTranslateAll: handleTranslateAll,
    onZoomIn: () => setZoomLevel(prev => Math.min(prev + 0.25, 3)),
    onZoomOut: () => setZoomLevel(prev => Math.max(prev - 0.25, 0.25)),
    onZoomReset: () => setZoomLevel(1),
    onFileOpened: handleFileOpened
  });

  // Aplicar traducciones a la imagen
  const handleApplyTranslations = useCallback(async () => {
    if (!imageFile || textBoxes.length === 0) {
      toast.warning('No hay cambios para aplicar');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Aplicando traducciones...');

    try {
      const editedImageUrl = await editImage(imageFile, textBoxes, translations);
      setCurrentImage(editedImageUrl);
      
      toast.success('Traducciones aplicadas exitosamente');
    } catch (error) {
      console.error('Error aplicando traducciones:', error);
      toast.error('Error al aplicar traducciones');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, textBoxes, translations, editImage]);

  // Manejar selección de caja de texto
  const handleBoxSelect = useCallback((index) => {
    setSelectedBoxIndex(index);
    setTranslationPanelOpen(true);
  }, []);

  // Manejar actualización de traducción
  const handleTranslationUpdate = useCallback((index, newTranslation) => {
    setTranslations(prev => {
      const updated = [...prev];
      updated[index] = newTranslation;
      return updated;
    });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onImageLoad={handleImageLoad}
        onSettings={handleSettings}
        hasImage={!!currentImage}
        isProcessing={isLoading || isProcessing}
      />

      {/* Toolbar flotante */}
      <Toolbar 
        onAutoDetect={handleAutoDetect}
        onTranslateAll={handleTranslateAll}
        onPreviewRemoval={() => toast.info('Vista previa - Próximamente')}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearSelections={handleClearSelections}
        onZoomIn={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
        onZoomOut={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.25))}
        onZoomReset={() => setZoomLevel(1)}
        hasImage={!!currentImage}
        hasTextBoxes={textBoxes.length > 0}
        hasTranslations={translations.length > 0}
        canUndo={false} // Por implementar
        canRedo={false} // Por implementar
        isProcessing={isLoading || isProcessing}
        zoomLevel={zoomLevel}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          textBoxes={textBoxes}
          selectedIndex={selectedBoxIndex}
          onBoxSelect={handleBoxSelect}
          onImageLoad={handleImageLoad}
        />

        {/* Área principal */}
        <div className="flex-1 flex flex-col relative">

          {/* Canvas de imagen */}
          <div 
            className={`flex-1 relative main-canvas-area flex items-center justify-center ${isDragOver ? 'dropzone active' : ''} ${!currentImage ? 'dropzone' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!currentImage && !isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">📁</div>
                  <div className="text-lg font-medium mb-2">Arrastra una imagen aquí</div>
                  <div className="text-sm">o usa el botón "Cargar imagen" en la barra superior</div>
                </div>
              </div>
            )}
            
            {isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="text-center text-blue-600">
                  <div className="text-4xl mb-4">⬇️</div>
                  <div className="text-lg font-medium">Suelta la imagen aquí</div>
                </div>
              </div>
            )}
            
            <ImageCanvas
              imageUrl={currentImage}
              textBoxes={textBoxes}
              selectedTextBoxId={selectedBoxIndex}
              onTextBoxSelect={handleBoxSelect}
              onTextBoxUpdate={(index, box) => {
                setTextBoxes(prev => {
                  const updated = [...prev];
                  updated[index] = box;
                  return updated;
                });
              }}
              currentTool={currentTool}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
            />
          </div>
        </div>

        {/* Panel de traducción */}
        <TranslationPanel
          isOpen={translationPanelOpen}
          onToggle={() => setTranslationPanelOpen(!translationPanelOpen)}
          textBoxes={textBoxes}
          translations={translations}
          selectedTextBoxId={selectedBoxIndex}
          onTranslationEdit={handleTranslationUpdate}
          onRetranslate={(index) => {
            // TODO: Implementar retranslate individual
            console.log('Retranslate:', index);
          }}
          onCopyTranslation={(text) => {
            navigator.clipboard.writeText(text);
            // TODO: Mostrar notificación
          }}
          onToggleTextBox={(id) => {
            setTextBoxes(prev => prev.map(box => 
              box.id === id ? { ...box, visible: !box.visible } : box
            ));
          }}
          onDeleteTextBox={(id) => {
            setTextBoxes(prev => prev.filter(box => box.id !== id));
            setTranslations(prev => {
              const boxIndex = textBoxes.findIndex(box => box.id === id);
              if (boxIndex !== -1) {
                const updated = [...prev];
                updated.splice(boxIndex, 1);
                return updated;
              }
              return prev;
            });
          }}
          detectedLanguage="Español"
          targetLanguage="en"
          onTargetLanguageChange={(lang) => {
            // TODO: Implementar cambio de idioma objetivo
            console.log('Target language changed:', lang);
          }}
          supportedLanguages={[
            { code: 'en', name: 'Inglés' },
            { code: 'es', name: 'Español' },
            { code: 'fr', name: 'Francés' },
            { code: 'de', name: 'Alemán' },
            { code: 'it', name: 'Italiano' },
            { code: 'pt', name: 'Portugués' }
          ]}
          isTranslating={isProcessing}
          onBatchTranslate={() => {
            // TODO: Implementar traducción en lote
            console.log('Batch translate');
          }}
          onPreviewEdit={handleApplyTranslations}
        />
      </div>

      {/* Overlay de carga */}
      {(isLoading || isProcessing) && (
        <LoadingOverlay message={loadingMessage} />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSettingsSave}
      />

      {/* Botones de cortina flotantes */}
      {/* Botón de cortina izquierda */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200 ${
          sidebarOpen ? 'opacity-70 hover:opacity-100' : 'opacity-90 hover:opacity-100'
        }`}
        title={sidebarOpen ? 'Ocultar panel izquierdo' : 'Mostrar panel izquierdo'}
        style={{ left: sidebarOpen ? 'var(--sidebar-width)' : '16px' }}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Botón de cortina derecha */}
      <button
        onClick={() => setTranslationPanelOpen(!translationPanelOpen)}
        className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200 ${
          translationPanelOpen ? 'opacity-70 hover:opacity-100' : 'opacity-90 hover:opacity-100'
        }`}
        title={translationPanelOpen ? 'Ocultar panel de traducción' : 'Mostrar panel de traducción'}
        style={{ right: translationPanelOpen ? 'var(--translation-panel-width)' : '16px' }}
      >
        {translationPanelOpen ? (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Notificaciones */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
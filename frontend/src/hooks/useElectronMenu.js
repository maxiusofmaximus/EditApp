import { useEffect, useCallback } from 'react';

/**
 * Hook personalizado para la integración con el menú de Electron
 * Maneja eventos del menú y comunicación con el proceso principal
 */
export const useElectronMenu = (handlers = {}) => {
  const {
    onSave,
    onSaveAs,
    onUndo,
    onRedo,
    onClearSelections,
    onAutoDetect,
    onTranslateAll,
    onSettings,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onFullScreen,
    onFileOpen
  } = handlers;

  // Verificar si estamos en Electron
  const isElectron = useCallback(() => {
    return window.electronAPI && window.electronAPI.isElectron;
  }, []);

  // Configurar listeners del menú
  useEffect(() => {
    if (!isElectron()) return;

    const electronAPI = window.electronAPI;

    // Listeners para eventos del menú
    const removeListeners = [];

    // Archivo
    if (onSave && electronAPI.onMenuSave) {
      const removeSave = electronAPI.onMenuSave(onSave);
      removeListeners.push(removeSave);
    }

    if (onSaveAs && electronAPI.onMenuSaveAs) {
      const removeSaveAs = electronAPI.onMenuSaveAs(onSaveAs);
      removeListeners.push(removeSaveAs);
    }

    // Edición
    if (onUndo && electronAPI.onMenuUndo) {
      const removeUndo = electronAPI.onMenuUndo(onUndo);
      removeListeners.push(removeUndo);
    }

    if (onRedo && electronAPI.onMenuRedo) {
      const removeRedo = electronAPI.onMenuRedo(onRedo);
      removeListeners.push(removeRedo);
    }

    if (onClearSelections && electronAPI.onMenuClearSelections) {
      const removeClear = electronAPI.onMenuClearSelections(onClearSelections);
      removeListeners.push(removeClear);
    }

    // Herramientas
    if (onAutoDetect && electronAPI.onMenuAutoDetect) {
      const removeAutoDetect = electronAPI.onMenuAutoDetect(onAutoDetect);
      removeListeners.push(removeAutoDetect);
    }

    if (onTranslateAll && electronAPI.onMenuTranslateAll) {
      const removeTranslateAll = electronAPI.onMenuTranslateAll(onTranslateAll);
      removeListeners.push(removeTranslateAll);
    }

    if (onSettings && electronAPI.onMenuSettings) {
      const removeSettings = electronAPI.onMenuSettings(onSettings);
      removeListeners.push(removeSettings);
    }

    // Vista
    if (onZoomIn && electronAPI.onMenuZoomIn) {
      const removeZoomIn = electronAPI.onMenuZoomIn(onZoomIn);
      removeListeners.push(removeZoomIn);
    }

    if (onZoomOut && electronAPI.onMenuZoomOut) {
      const removeZoomOut = electronAPI.onMenuZoomOut(onZoomOut);
      removeListeners.push(removeZoomOut);
    }

    if (onZoomReset && electronAPI.onMenuZoomReset) {
      const removeZoomReset = electronAPI.onMenuZoomReset(onZoomReset);
      removeListeners.push(removeZoomReset);
    }

    if (onFullScreen && electronAPI.onMenuFullScreen) {
      const removeFullScreen = electronAPI.onMenuFullScreen(onFullScreen);
      removeListeners.push(removeFullScreen);
    }

    // Evento de abrir archivo
    if (onFileOpen && electronAPI.onFileOpen) {
      const removeFileOpen = electronAPI.onFileOpen(onFileOpen);
      removeListeners.push(removeFileOpen);
    }

    // Cleanup al desmontar
    return () => {
      removeListeners.forEach(remove => {
        if (typeof remove === 'function') {
          remove();
        }
      });
    };
  }, [
    onSave, onSaveAs, onUndo, onRedo, onClearSelections,
    onAutoDetect, onTranslateAll, onSettings,
    onZoomIn, onZoomOut, onZoomReset, onFullScreen,
    onFileOpen, isElectron
  ]);

  // Funciones para mostrar diálogos
  const showSaveDialog = useCallback(async (options = {}) => {
    if (!isElectron()) {
      console.warn('showSaveDialog solo está disponible en Electron');
      return null;
    }

    try {
      const defaultOptions = {
        title: 'Guardar imagen',
        defaultPath: 'manga_traducido.png',
        filters: [
          { name: 'Imágenes PNG', extensions: ['png'] },
          { name: 'Imágenes JPEG', extensions: ['jpg', 'jpeg'] },
          { name: 'Todas las imágenes', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp'] },
          { name: 'Todos los archivos', extensions: ['*'] }
        ]
      };

      const result = await window.electronAPI.showSaveDialog({
        ...defaultOptions,
        ...options
      });

      return result.canceled ? null : result.filePath;
    } catch (error) {
      console.error('Error mostrando diálogo de guardado:', error);
      return null;
    }
  }, [isElectron]);

  const showOpenDialog = useCallback(async (options = {}) => {
    if (!isElectron()) {
      console.warn('showOpenDialog solo está disponible en Electron');
      return null;
    }

    try {
      const defaultOptions = {
        title: 'Abrir imagen de manga',
        filters: [
          { name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'webp'] },
          { name: 'Todos los archivos', extensions: ['*'] }
        ],
        properties: ['openFile']
      };

      const result = await window.electronAPI.showOpenDialog({
        ...defaultOptions,
        ...options
      });

      return result.canceled ? null : result.filePaths[0];
    } catch (error) {
      console.error('Error mostrando diálogo de apertura:', error);
      return null;
    }
  }, [isElectron]);

  const showMessageBox = useCallback(async (options = {}) => {
    if (!isElectron()) {
      console.warn('showMessageBox solo está disponible en Electron');
      return { response: 0 };
    }

    try {
      const defaultOptions = {
        type: 'info',
        buttons: ['OK'],
        title: 'Manga Translator',
        message: 'Mensaje'
      };

      return await window.electronAPI.showMessageBox({
        ...defaultOptions,
        ...options
      });
    } catch (error) {
      console.error('Error mostrando mensaje:', error);
      return { response: 0 };
    }
  }, [isElectron]);

  // Funciones de utilidad para diálogos comunes
  const showErrorDialog = useCallback(async (message, detail = '') => {
    return await showMessageBox({
      type: 'error',
      title: 'Error',
      message,
      detail,
      buttons: ['OK']
    });
  }, [showMessageBox]);

  const showWarningDialog = useCallback(async (message, detail = '') => {
    return await showMessageBox({
      type: 'warning',
      title: 'Advertencia',
      message,
      detail,
      buttons: ['OK', 'Cancelar']
    });
  }, [showMessageBox]);

  const showInfoDialog = useCallback(async (message, detail = '') => {
    return await showMessageBox({
      type: 'info',
      title: 'Información',
      message,
      detail,
      buttons: ['OK']
    });
  }, [showMessageBox]);

  const showConfirmDialog = useCallback(async (message, detail = '') => {
    const result = await showMessageBox({
      type: 'question',
      title: 'Confirmar',
      message,
      detail,
      buttons: ['Sí', 'No'],
      defaultId: 0,
      cancelId: 1
    });
    return result.response === 0;
  }, [showMessageBox]);

  // Obtener información de la aplicación
  const getAppInfo = useCallback(() => {
    if (!isElectron()) {
      return {
        name: 'Manga Translator',
        version: '1.0.0',
        platform: 'web'
      };
    }

    return {
      name: window.appInfo?.name || 'Manga Translator',
      version: window.appInfo?.version || '1.0.0',
      platform: window.electronAPI?.platform || 'unknown'
    };
  }, [isElectron]);

  // Configurar atajos de teclado personalizados
  const setupKeyboardShortcuts = useCallback((shortcuts = {}) => {
    if (!isElectron()) return () => {};

    const handleKeyDown = (event) => {
      const { ctrlKey, metaKey, shiftKey, altKey, key } = event;
      const modifier = ctrlKey || metaKey;

      // Atajos comunes
      if (modifier && !shiftKey && !altKey) {
        switch (key.toLowerCase()) {
          case 's':
            event.preventDefault();
            if (shortcuts.save) shortcuts.save();
            else if (onSave) onSave();
            break;
          case 'o':
            event.preventDefault();
            if (shortcuts.open) shortcuts.open();
            else if (onFileOpen) onFileOpen();
            break;
          case 'z':
            event.preventDefault();
            if (shortcuts.undo) shortcuts.undo();
            else if (onUndo) onUndo();
            break;
          case 'y':
            event.preventDefault();
            if (shortcuts.redo) shortcuts.redo();
            else if (onRedo) onRedo();
            break;
          case 'd':
            event.preventDefault();
            if (shortcuts.autoDetect) shortcuts.autoDetect();
            else if (onAutoDetect) onAutoDetect();
            break;
          case 't':
            event.preventDefault();
            if (shortcuts.translateAll) shortcuts.translateAll();
            else if (onTranslateAll) onTranslateAll();
            break;
          case '=':
          case '+':
            event.preventDefault();
            if (shortcuts.zoomIn) shortcuts.zoomIn();
            else if (onZoomIn) onZoomIn();
            break;
          case '-':
            event.preventDefault();
            if (shortcuts.zoomOut) shortcuts.zoomOut();
            else if (onZoomOut) onZoomOut();
            break;
          case '0':
            event.preventDefault();
            if (shortcuts.zoomReset) shortcuts.zoomReset();
            else if (onZoomReset) onZoomReset();
            break;
        }
      }

      // Atajos con Shift
      if (modifier && shiftKey && !altKey) {
        switch (key.toLowerCase()) {
          case 's':
            event.preventDefault();
            if (shortcuts.saveAs) shortcuts.saveAs();
            else if (onSaveAs) onSaveAs();
            break;
          case 'z':
            event.preventDefault();
            if (shortcuts.redo) shortcuts.redo();
            else if (onRedo) onRedo();
            break;
        }
      }

      // Escape para limpiar selecciones
      if (key === 'Escape') {
        if (shortcuts.clearSelections) shortcuts.clearSelections();
        else if (onClearSelections) onClearSelections();
      }

      // F11 para pantalla completa
      if (key === 'F11') {
        event.preventDefault();
        if (shortcuts.fullScreen) shortcuts.fullScreen();
        else if (onFullScreen) onFullScreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onSave, onSaveAs, onUndo, onRedo, onClearSelections,
    onAutoDetect, onTranslateAll, onZoomIn, onZoomOut,
    onZoomReset, onFullScreen, onFileOpen
  ]);

  return {
    // Estado
    isElectron: isElectron(),

    // Diálogos
    showSaveDialog,
    showOpenDialog,
    showMessageBox,
    showErrorDialog,
    showWarningDialog,
    showInfoDialog,
    showConfirmDialog,

    // Utilidades
    getAppInfo,
    setupKeyboardShortcuts
  };
};

export default useElectronMenu;
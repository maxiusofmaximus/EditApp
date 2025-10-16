import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

// Configuración global para desarrollo
if (process.env.NODE_ENV === 'development') {
  // Habilitar React DevTools
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
}

// Crear root de React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar aplicación
root.render(
  <App />
);

// Configuración para Electron
if (window.electronAPI) {
  // Prevenir navegación externa en Electron
  window.addEventListener('beforeunload', (e) => {
    // Permitir que Electron maneje la navegación
    return undefined;
  });

  // Configurar manejo de errores para Electron
  window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
    
    if (window.electronAPI.showMessageBox) {
      window.electronAPI.showMessageBox({
        type: 'error',
        title: 'Error de la aplicación',
        message: 'Ha ocurrido un error inesperado',
        detail: e.error?.message || 'Error desconocido'
      });
    }
  });

  // Configurar manejo de promesas rechazadas
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesa rechazada no manejada:', e.reason);
    
    if (window.electronAPI.showMessageBox) {
      window.electronAPI.showMessageBox({
        type: 'warning',
        title: 'Advertencia',
        message: 'Operación no completada',
        detail: e.reason?.message || 'Error en operación asíncrona'
      });
    }
  });
}

// Configuración para desarrollo web
if (!window.electronAPI && process.env.NODE_ENV === 'development') {
  // Mock de electronAPI para desarrollo web
  window.electronAPI = {
    isElectron: false,
    platform: 'web'
  };
  
  window.appInfo = {
    name: 'Manga Translator',
    version: '1.0.0',
    isElectron: false
  };
}

// Configuración de rendimiento
if (process.env.NODE_ENV === 'production') {
  // Deshabilitar logs en producción
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

// Configuración de accesibilidad
document.addEventListener('DOMContentLoaded', () => {
  // Configurar atributos de accesibilidad
  document.documentElement.setAttribute('lang', 'es');
  
  // Configurar meta viewport si no existe
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(viewport);
  }
});

// Configuración de Service Worker (para PWA en el futuro)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registro falló: ', registrationError);
      });
  });
}
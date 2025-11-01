import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Manejar errores específicos
    if (error.response?.status === 404) {
      throw new Error('Recurso no encontrado');
    } else if (error.response?.status === 500) {
      throw new Error('Error interno del servidor');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('No se puede conectar al servidor. Asegúrate de que el backend esté ejecutándose.');
    }
    
    throw error;
  }
);

// Servicio de API
export const apiService = {
  // Verificar estado de la API
  async healthCheck() {
    try {
      const response = await axios.get('http://localhost:8000/health');
      return response.data;
    } catch (error) {
      throw new Error('No se puede conectar al servidor');
    }
  },

  // Subir imagen
  async uploadImage(file) {
    try {
      console.log('🚀 API SERVICE - Iniciando upload de imagen');
      console.log('📄 API SERVICE - Archivo a subir:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });

      // ✅ NUEVO: Convertir archivo a base64 ANTES de enviarlo
       const reader = new FileReader();
       const base64Promise = new Promise((resolve, reject) => {
         reader.onload = (e) => {
           const base64 = e.target.result;
           console.log('🎯 API SERVICE - Base64 completo ANTES de enviar al backend:');
           console.log(base64);
           console.log('📊 API SERVICE - Tamaño del base64 antes de enviar:', base64.length, 'caracteres');
           resolve(base64);
         };
         reader.onerror = reject;
         reader.readAsDataURL(file);
       });

      const base64BeforeSend = await base64Promise;

      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 API SERVICE - Enviando FormData al backend...');
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ API SERVICE - Respuesta del backend recibida:', response.data);
      console.log('📊 API SERVICE - Comparación de tamaños:', {
        'base64_frontend': base64BeforeSend.length,
        'base64_backend': response.data.base64_size || 'no reportado',
        'file_size_backend': response.data.file_size || 'no reportado'
      });

      return response.data;
    } catch (error) {
      console.error('❌ API SERVICE - Error subiendo imagen:', error);
      throw new Error(`Error subiendo imagen: ${error.message}`);
    }
  },

  // Realizar OCR en imagen completa
  async performOCR(filename) {
    try {
      const formData = new FormData();
      formData.append('filename', filename);

      const response = await apiClient.post('/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error en OCR: ${error.message}`);
    }
  },

  // Realizar OCR en región específica
  async performRegionOCR(filename, region) {
    try {
      const formData = new FormData();
      formData.append('filename', filename);
      formData.append('x1', region.x1);
      formData.append('y1', region.y1);
      formData.append('x2', region.x2);
      formData.append('y2', region.y2);

      const response = await apiClient.post('/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error en OCR de región: ${error.message}`);
    }
  },

  // Traducir texto
  async translateText(text, sourceLang = 'auto', targetLang = 'es') {
    try {
      const response = await apiClient.post('/translate', {
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error en traducción: ${error.message}`);
    }
  },

  // Traducir texto optimizado para manga
  async translateMangaText(text, detectedLanguage = 'auto') {
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('detected_language', detectedLanguage);

      const response = await apiClient.post('/translate-manga', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error en traducción de manga: ${error.message}`);
    }
  },

  // Procesar página completa de manga
  async processFullPage(filename) {
    try {
      const formData = new FormData();
      formData.append('filename', filename);

      const response = await apiClient.post('/process-full-page', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error procesando página: ${error.message}`);
    }
  },

  // Editar imagen con traducciones
  async editImage(filename, textBoxes, translations) {
    try {
      const formData = new FormData();
      formData.append('filename', filename);
      formData.append('text_boxes', JSON.stringify(textBoxes));
      formData.append('translations', JSON.stringify(translations));

      const response = await apiClient.post('/edit-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error editando imagen: ${error.message}`);
    }
  },

  // Crear vista previa de remoción de texto
  async previewTextRemoval(filename, textBoxes) {
    try {
      const formData = new FormData();
      formData.append('filename', filename);
      formData.append('text_boxes', JSON.stringify(textBoxes));

      const response = await apiClient.post('/preview-removal', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Error creando vista previa: ${error.message}`);
    }
  },

  // Descargar archivo
  async downloadFile(filename) {
    try {
      const response = await apiClient.get(`/download/${filename}`, {
        responseType: 'blob',
      });

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      throw new Error(`Error descargando archivo: ${error.message}`);
    }
  },

  // Obtener idiomas soportados
  async getSupportedLanguages() {
    try {
      const response = await apiClient.get('/languages');
      return response.data;
    } catch (error) {
      throw new Error(`Error obteniendo idiomas: ${error.message}`);
    }
  },

  // Limpiar archivos temporales
  async cleanupTempFiles() {
    try {
      const response = await apiClient.delete('/cleanup');
      return response.data;
    } catch (error) {
      throw new Error(`Error limpiando archivos: ${error.message}`);
    }
  },

  // Utilidades para manejo de archivos
  fileUtils: {
    // Convertir File a base64
    async fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    },

    // Validar tipo de archivo de imagen
    isValidImageFile(file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'];
      return validTypes.includes(file.type);
    },

    // Validar tamaño de archivo
    isValidFileSize(file, maxSizeMB = 10) {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      return file.size <= maxSizeBytes;
    },

    // Obtener dimensiones de imagen
    async getImageDimensions(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    },

    // Redimensionar imagen si es necesario
    async resizeImageIfNeeded(file, maxWidth = 2048, maxHeight = 2048) {
      const dimensions = await this.getImageDimensions(file);
      
      if (dimensions.width <= maxWidth && dimensions.height <= maxHeight) {
        return file;
      }

      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calcular nuevas dimensiones manteniendo proporción
          const ratio = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height);
          canvas.width = dimensions.width * ratio;
          canvas.height = dimensions.height * ratio;

          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convertir a blob
          canvas.toBlob((blob) => {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          }, file.type, 0.9);
        };

        img.src = URL.createObjectURL(file);
      });
    }
  }
};

export default apiService;
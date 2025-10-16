// Security Service for EditApp Frontend
import axios from 'axios';

const SECURITY_SERVER_URL = 'http://localhost:3001';

class SecurityService {
  constructor() {
    this.setupAxiosInterceptors();
  }

  setupAxiosInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        config.headers['X-App-Version'] = '1.0.0';
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 429) {
          console.warn('Rate limit exceeded. Please wait before making more requests.');
        }
        return Promise.reject(error);
      }
    );
  }

  async validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido');
    }

    if (file.size > maxSize) {
      throw new Error('Archivo demasiado grande');
    }

    return true;
  }

  async scanFile(file) {
    try {
      // El servidor de seguridad espera JSON con metadatos del archivo
      const fileData = {
        filename: file.name,
        mimetype: file.type,
        size: file.size
      };
      
      const response = await axios.post(`${SECURITY_SERVER_URL}/api/scan-file`, fileData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error scanning file:', error);
      throw error;
    }
  }
}

export default new SecurityService();

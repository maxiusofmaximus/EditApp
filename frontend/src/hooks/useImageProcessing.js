import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';

/**
 * Hook personalizado para el procesamiento de imágenes
 * Maneja OCR, traducción y edición de imágenes
 */
export const useImageProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Procesar imagen completa (OCR + detección de texto)
  const processImage = useCallback(async (imageFile) => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Subir imagen al servidor
      const uploadResult = await apiService.uploadImage(imageFile);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Error subiendo imagen');
      }

      // 2. Procesar página completa (OCR automático)
      const processResult = await apiService.processFullPage(uploadResult.filename);
      
      if (!processResult.success) {
        throw new Error(processResult.message || 'Error procesando imagen');
      }

      // 3. Formatear resultados
      const textBoxes = processResult.ocr_result.text_boxes.map((box, index) => ({
        id: `box-${index}`,
        text: box.text,
        x1: box.x1,
        y1: box.y1,
        x2: box.x2,
        y2: box.y2,
        confidence: box.confidence,
        language: processResult.ocr_result.detected_language
      }));

      return {
        filename: uploadResult.filename,
        textBoxes,
        detectedLanguage: processResult.ocr_result.detected_language,
        totalBoxes: processResult.total_text_boxes
      };

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Realizar OCR en región específica
  const processRegion = useCallback(async (filename, region) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await apiService.performRegionOCR(filename, region);
      
      if (!result.text_boxes || result.text_boxes.length === 0) {
        throw new Error('No se detectó texto en la región seleccionada');
      }

      return {
        textBoxes: result.text_boxes.map((box, index) => ({
          id: `region-box-${index}`,
          text: box.text,
          x1: box.x1,
          y1: box.y1,
          x2: box.x2,
          y2: box.y2,
          confidence: box.confidence,
          language: result.detected_language
        })),
        detectedLanguage: result.detected_language
      };

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Traducir múltiples textos
  const translateTexts = useCallback(async (texts, sourceLang = 'auto', targetLang = 'es') => {
    setIsProcessing(true);
    setError(null);

    try {
      const translations = await Promise.all(
        texts.map(async (text) => {
          if (!text || text.trim() === '') {
            return '';
          }

          const result = await apiService.translateMangaText(text, sourceLang);
          return result.translated_text || text;
        })
      );

      return translations;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Traducir texto individual
  const translateSingleText = useCallback(async (text, sourceLang = 'auto', targetLang = 'es') => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!text || text.trim() === '') {
        return '';
      }

      const result = await apiService.translateMangaText(text, sourceLang);
      return result.translated_text || text;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Editar imagen con traducciones
  const editImage = useCallback(async (imageFile, textBoxes, translations) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Asegurar que tenemos el filename
      let filename;
      if (typeof imageFile === 'string') {
        filename = imageFile;
      } else {
        // Si es un File, necesitamos subirlo primero
        const uploadResult = await apiService.uploadImage(imageFile);
        if (!uploadResult.success) {
          throw new Error('Error subiendo imagen para edición');
        }
        filename = uploadResult.filename;
      }

      // Formatear cajas de texto para la API
      const formattedTextBoxes = textBoxes.map(box => ({
        text: box.text,
        x1: box.x1,
        y1: box.y1,
        x2: box.x2,
        y2: box.y2,
        confidence: box.confidence || 1.0
      }));

      // Realizar edición
      const result = await apiService.editImage(filename, formattedTextBoxes, translations);
      
      if (!result.success) {
        throw new Error(result.message || 'Error editando imagen');
      }

      // Crear URL para la imagen editada
      const imageUrl = `${apiService.defaults?.baseURL || 'http://localhost:8000'}/api/v1/download/${result.edited_image_path.split('/').pop()}`;
      
      return imageUrl;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Crear vista previa de remoción de texto
  const previewTextRemoval = useCallback(async (filename, textBoxes) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formattedTextBoxes = textBoxes.map(box => ({
        text: box.text,
        x1: box.x1,
        y1: box.y1,
        x2: box.x2,
        y2: box.y2,
        confidence: box.confidence || 1.0
      }));

      const result = await apiService.previewTextRemoval(filename, formattedTextBoxes);
      
      if (!result.success) {
        throw new Error(result.message || 'Error creando vista previa');
      }

      // Crear URL para la vista previa
      const previewUrl = `${apiService.defaults?.baseURL || 'http://localhost:8000'}/api/v1/download/${result.preview_path.split('/').pop()}`;
      
      return previewUrl;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Validar imagen antes del procesamiento
  const validateImage = useCallback(async (file) => {
    try {
      // Validar tipo de archivo
      if (!apiService.fileUtils.isValidImageFile(file)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten imágenes JPG, PNG, BMP, TIFF y WebP.');
      }

      // Validar tamaño
      if (!apiService.fileUtils.isValidFileSize(file, 10)) {
        throw new Error('El archivo es demasiado grande. Tamaño máximo: 10MB.');
      }

      // Obtener dimensiones
      const dimensions = await apiService.fileUtils.getImageDimensions(file);
      
      // Validar dimensiones mínimas
      if (dimensions.width < 100 || dimensions.height < 100) {
        throw new Error('La imagen es demasiado pequeña. Dimensiones mínimas: 100x100 píxeles.');
      }

      // Validar dimensiones máximas
      if (dimensions.width > 4096 || dimensions.height > 4096) {
        console.warn('Imagen muy grande, se redimensionará automáticamente.');
        return await apiService.fileUtils.resizeImageIfNeeded(file, 2048, 2048);
      }

      return file;

    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Limpiar estado de error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Obtener estadísticas de procesamiento
  const getProcessingStats = useCallback((textBoxes, translations) => {
    const totalBoxes = textBoxes.length;
    const translatedBoxes = translations.filter(t => t && t.trim() !== '').length;
    const emptyBoxes = textBoxes.filter(box => !box.text || box.text.trim() === '').length;
    const lowConfidenceBoxes = textBoxes.filter(box => box.confidence < 0.7).length;

    return {
      totalBoxes,
      translatedBoxes,
      emptyBoxes,
      lowConfidenceBoxes,
      translationProgress: totalBoxes > 0 ? (translatedBoxes / totalBoxes) * 100 : 0
    };
  }, []);

  return {
    // Estados
    isProcessing,
    error,

    // Funciones principales
    processImage,
    processRegion,
    translateTexts,
    translateSingleText,
    editImage,
    previewTextRemoval,

    // Utilidades
    validateImage,
    clearError,
    getProcessingStats
  };
};

export default useImageProcessing;
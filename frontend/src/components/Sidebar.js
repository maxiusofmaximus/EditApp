import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Languages, 
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

/**
 * Componente Sidebar - Panel lateral con herramientas y configuración
 */
const Sidebar = ({
  isOpen,
  onToggle,
  textBoxes = [],
  translations = [],
  onTextBoxSelect,
  onTextBoxToggle,
  onTranslationEdit,
  selectedTextBoxId,
  detectedLanguage,
  targetLanguage,
  onTargetLanguageChange,
  supportedLanguages = [],
  processingStats = {}
}) => {
  const [editingTranslation, setEditingTranslation] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (index, currentTranslation) => {
    setEditingTranslation(index);
    setEditValue(currentTranslation || '');
  };

  const handleEditSave = (index) => {
    if (onTranslationEdit) {
      onTranslationEdit(index, editValue);
    }
    setEditingTranslation(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingTranslation(null);
    setEditValue('');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  };

  return (
    <div className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Contenido del sidebar */}
      <div className="sidebar-content">
        <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Texto Detectado</span>
          </h2>
          
          {/* Estadísticas */}
          {processingStats.totalBoxes > 0 && (
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>{processingStats.totalBoxes}</span>
              </div>
              <div className="flex justify-between">
                <span>Traducido:</span>
                <span>{processingStats.translatedBoxes}</span>
              </div>
              {processingStats.lowConfidenceBoxes > 0 && (
                <div className="flex justify-between text-yellow-600">
                  <span>Baja confianza:</span>
                  <span>{processingStats.lowConfidenceBoxes}</span>
                </div>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingStats.translationProgress || 0}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Configuración de idioma */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
            <Languages className="w-4 h-4" />
            <span>Idiomas</span>
          </h3>
          
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Detectado:
              </label>
              <div className="text-sm font-medium text-gray-900">
                {detectedLanguage || 'No detectado'}
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Traducir a:
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => onTargetLanguageChange?.(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista de texto detectado */}
        <div className="flex-1 overflow-y-auto">
          {textBoxes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No hay texto detectado</p>
              <p className="text-xs mt-1">
                Carga una imagen y usa "Detectar" para comenzar
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {textBoxes.map((textBox, index) => (
                <div
                  key={textBox.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedTextBoxId === textBox.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onTextBoxSelect?.(textBox.id)}
                >
                  {/* Header del texto */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <div className={`text-xs ${getConfidenceColor(textBox.confidence)}`}>
                        {getConfidenceLabel(textBox.confidence)}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTextBoxToggle?.(textBox.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                        title={textBox.visible !== false ? 'Ocultar' : 'Mostrar'}
                      >
                        {textBox.visible !== false ? (
                          <Eye className="w-3 h-3 text-gray-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implementar eliminación de caja de texto
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Texto original */}
                  <div className="mb-2">
                    <div className="text-xs text-gray-600 mb-1">Original:</div>
                    <div className="text-sm text-gray-900 bg-gray-50 rounded p-2 min-h-[2rem] break-words">
                      {textBox.text || 'Sin texto'}
                    </div>
                  </div>

                  {/* Traducción */}
                  <div>
                    <div className="text-xs text-gray-600 mb-1 flex items-center justify-between">
                      <span>Traducción:</span>
                      {editingTranslation !== index && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStart(index, translations[index]);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Editar traducción"
                        >
                          <Edit3 className="w-3 h-3 text-gray-600" />
                        </button>
                      )}
                    </div>
                    
                    {editingTranslation === index ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full text-sm border border-gray-300 rounded p-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Escribe la traducción..."
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSave(index);
                            }}
                            className="flex-1 bg-green-500 text-white text-xs py-1 px-2 rounded hover:bg-green-600 flex items-center justify-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Guardar</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCancel();
                            }}
                            className="flex-1 bg-gray-500 text-white text-xs py-1 px-2 rounded hover:bg-gray-600 flex items-center justify-center space-x-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancelar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`text-sm rounded p-2 min-h-[2rem] break-words ${
                        translations[index] 
                          ? 'text-gray-900 bg-green-50 border border-green-200' 
                          : 'text-gray-500 bg-gray-50 border border-gray-200'
                      }`}>
                        {translations[index] || 'Sin traducir'}
                      </div>
                    )}
                  </div>

                  {/* Información adicional */}
                  {textBox.confidence < 0.7 && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-yellow-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>Revisar manualmente</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {textBoxes.length > 0 && (
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                // TODO: Implementar traducción de todos los textos
              }}
              className="w-full btn btn-primary text-sm"
            >
              <Languages className="w-4 h-4" />
              Traducir Todo
            </button>
            
            <button
              onClick={() => {
                // TODO: Implementar limpieza de selecciones
              }}
              className="w-full btn btn-ghost text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar Todo
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
import React, { useState, useEffect } from 'react';
import { 
  Languages, 
  Edit3, 
  Check, 
  X, 
  Copy, 
  Download, 
  Eye, 
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Trash2
} from 'lucide-react';

/**
 * Componente TranslationPanel - Panel de traducción y edición de texto
 */
const TranslationPanel = ({
  isOpen = true,
  onToggle,
  textBoxes = [],
  translations = [],
  selectedTextBoxId,
  onTranslationEdit,
  onRetranslate,
  onCopyTranslation,
  onToggleTextBox,
  onDeleteTextBox,
  detectedLanguage,
  targetLanguage,
  onTargetLanguageChange,
  supportedLanguages = [],
  isTranslating = false,
  onBatchTranslate,
  onPreviewEdit
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [filter, setFilter] = useState('all'); // all, translated, untranslated, low-confidence

  // Encontrar el índice del textBox seleccionado
  const selectedIndex = selectedTextBoxId 
    ? textBoxes.findIndex(box => box.id === selectedTextBoxId)
    : -1;

  // Filtrar cajas de texto según el filtro activo
  const filteredTextBoxes = textBoxes.filter((textBox, index) => {
    switch (filter) {
      case 'translated':
        return translations[index] && translations[index].trim() !== '';
      case 'untranslated':
        return !translations[index] || translations[index].trim() === '';
      case 'low-confidence':
        return textBox.confidence < 0.7;
      default:
        return true;
    }
  });

  const handleEditStart = (index, currentTranslation) => {
    setEditingIndex(index);
    setEditValue(currentTranslation || '');
  };

  const handleEditSave = (index) => {
    if (onTranslationEdit) {
      onTranslationEdit(index, editValue);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleEditSave(index);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  };

  const getTranslationStats = () => {
    const total = textBoxes.length;
    const translated = translations.filter(t => t && t.trim() !== '').length;
    const lowConfidence = textBoxes.filter(box => box.confidence < 0.7).length;
    
    return { total, translated, lowConfidence };
  };

  const stats = getTranslationStats();

  return (
    <div className={`translation-panel ${isOpen ? 'translation-panel-open' : 'translation-panel-closed'} bg-white border-l border-gray-200 flex flex-col h-full`}>
      <div className="translation-panel-content">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Languages className="w-5 h-5" />
            <span>Traducciones</span>
          </h2>
          
          {textBoxes.length > 0 && (
            <button
              onClick={onBatchTranslate}
              disabled={isTranslating}
              className="btn btn-primary btn-sm"
              title="Traducir todo el texto"
            >
              {isTranslating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Languages className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isTranslating ? 'Traduciendo...' : 'Traducir Todo'}
              </span>
            </button>
          )}
        </div>

        {/* Estadísticas */}
        {stats.total > 0 && (
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-semibold text-blue-600">{stats.total}</div>
              <div className="text-blue-600 text-xs">Total</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-semibold text-green-600">{stats.translated}</div>
              <div className="text-green-600 text-xs">Traducido</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="font-semibold text-yellow-600">{stats.lowConfidence}</div>
              <div className="text-yellow-600 text-xs">Revisar</div>
            </div>
          </div>
        )}

        {/* Configuración de idioma */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Detectado:</span>
            <span className="font-medium">{detectedLanguage || 'Desconocido'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
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

        {/* Filtros */}
        {textBoxes.length > 0 && (
          <div className="mt-3">
            <div className="flex space-x-1 text-xs">
              {[
                { key: 'all', label: 'Todos', count: stats.total },
                { key: 'translated', label: 'Traducidos', count: stats.translated },
                { key: 'untranslated', label: 'Sin traducir', count: stats.total - stats.translated },
                { key: 'low-confidence', label: 'Revisar', count: stats.lowConfidence }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    filter === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lista de traducciones */}
      <div className="flex-1 overflow-y-auto">
        {filteredTextBoxes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {textBoxes.length === 0 ? (
              <>
                <Languages className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 className="font-medium mb-1">No hay texto detectado</h3>
                <p className="text-sm">Carga una imagen y detecta texto para comenzar</p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 className="font-medium mb-1">No hay elementos que mostrar</h3>
                <p className="text-sm">Cambia el filtro para ver otros elementos</p>
              </>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredTextBoxes.map((textBox, filteredIndex) => {
              const originalIndex = textBoxes.findIndex(box => box.id === textBox.id);
              const isSelected = selectedTextBoxId === textBox.id;
              const translation = translations[originalIndex];
              const isEditing = editingIndex === originalIndex;

              return (
                <div
                  key={textBox.id}
                  className={`border rounded-lg p-3 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">
                        #{originalIndex + 1}
                      </span>
                      <div className={`text-xs px-2 py-1 rounded ${getConfidenceColor(textBox.confidence)}`}>
                        {getConfidenceLabel(textBox.confidence)}
                      </div>
                      {textBox.visible === false && (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onToggleTextBox?.(textBox.id)}
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
                        onClick={() => onRetranslate?.(originalIndex)}
                        disabled={isTranslating}
                        className="p-1 hover:bg-blue-100 rounded"
                        title="Volver a traducir"
                      >
                        <RefreshCw className={`w-3 h-3 text-blue-600 ${isTranslating ? 'animate-spin' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => onDeleteTextBox?.(textBox.id)}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Texto original */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-1">Texto original:</div>
                    <div className="text-sm text-gray-900 bg-gray-50 rounded p-2 min-h-[2rem] break-words">
                      {textBox.text || 'Sin texto detectado'}
                    </div>
                  </div>

                  {/* Traducción */}
                  <div>
                    <div className="text-xs text-gray-600 mb-1 flex items-center justify-between">
                      <span>Traducción:</span>
                      <div className="flex items-center space-x-1">
                        {translation && !isEditing && (
                          <button
                            onClick={() => onCopyTranslation?.(translation)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Copiar traducción"
                          >
                            <Copy className="w-3 h-3 text-gray-600" />
                          </button>
                        )}
                        {!isEditing && (
                          <button
                            onClick={() => handleEditStart(originalIndex, translation)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Editar traducción"
                          >
                            <Edit3 className="w-3 h-3 text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, originalIndex)}
                          className="w-full text-sm border border-gray-300 rounded p-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Escribe la traducción..."
                          autoFocus
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditSave(originalIndex)}
                            className="flex-1 bg-green-500 text-white text-xs py-1 px-2 rounded hover:bg-green-600 flex items-center justify-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Guardar</span>
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="flex-1 bg-gray-500 text-white text-xs py-1 px-2 rounded hover:bg-gray-600 flex items-center justify-center space-x-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancelar</span>
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          Tip: Ctrl+Enter para guardar, Esc para cancelar
                        </div>
                      </div>
                    ) : (
                      <div className={`text-sm rounded p-2 min-h-[2rem] break-words ${
                        translation && translation.trim() !== ''
                          ? 'text-gray-900 bg-green-50 border border-green-200' 
                          : 'text-gray-500 bg-gray-50 border border-gray-200 italic'
                      }`}>
                        {translation && translation.trim() !== '' ? translation : 'Sin traducir'}
                      </div>
                    )}
                  </div>

                  {/* Advertencias */}
                  {textBox.confidence < 0.7 && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-yellow-600 bg-yellow-50 rounded p-2">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Baja confianza en la detección - revisar manualmente</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      {textBoxes.length > 0 && (
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={onPreviewEdit}
              disabled={!translations.some(t => t && t.trim() !== '')}
              className="flex-1 btn btn-secondary btn-sm"
            >
              <Eye className="w-4 h-4" />
              Vista Previa
            </button>
            
            <button
              onClick={() => {
                const translatedText = translations.filter(t => t && t.trim() !== '').join('\n');
                if (translatedText && onCopyTranslation) {
                  onCopyTranslation(translatedText);
                }
              }}
              disabled={!translations.some(t => t && t.trim() !== '')}
              className="flex-1 btn btn-ghost btn-sm"
            >
              <Copy className="w-4 h-4" />
              Copiar Todo
            </button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            {stats.translated} de {stats.total} textos traducidos
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TranslationPanel;
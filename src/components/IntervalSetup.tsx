import React, { useState } from 'react';
import { Plus, Trash2, Play, Clock, Palette, BookOpen, Download, Upload } from 'lucide-react';
import { Interval, IntervalType, INTERVAL_COLORS, COLOR_OPTIONS } from '../types';
import { useTraining } from '../contexts/TrainingContext';
import { useSavedSets } from '../hooks/useSavedSets';
import { SavedSetsModal } from './SavedSetsModal';

interface IntervalSetupProps {
  onStartTraining: () => void;
}

export function IntervalSetup({ onStartTraining }: IntervalSetupProps) {
  const { state, dispatch } = useTraining();
  const { savedSets, saveSet, deleteSet, loadSet } = useSavedSets();
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [showSavedSetsModal, setShowSavedSetsModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [newInterval, setNewInterval] = useState({
    name: '',
    minutes: '',
    seconds: '',
    type: 'calentamiento' as IntervalType,
    customColor: INTERVAL_COLORS.calentamiento
  });

  const addInterval = () => {
    if (!newInterval.name || (!newInterval.minutes && !newInterval.seconds)) return;

    const duration = (parseInt(newInterval.minutes) || 0) * 60 + (parseInt(newInterval.seconds) || 0);
    if (duration <= 0) return;

    const interval: Interval = {
      id: Date.now().toString(),
      name: newInterval.name,
      duration,
      type: newInterval.type,
      color: newInterval.customColor,
      customColor: newInterval.customColor
    };

    setIntervals([...intervals, interval]);
    setNewInterval({ 
      name: '', 
      minutes: '', 
      seconds: '', 
      type: 'calentamiento',
      customColor: INTERVAL_COLORS.calentamiento
    });
  };

  const removeInterval = (id: string) => {
    setIntervals(intervals.filter(interval => interval.id !== id));
  };

  const startTraining = () => {
    if (intervals.length === 0) return;
    dispatch({ type: 'SET_INTERVALS', payload: intervals });
    onStartTraining();
  };

  const handleLoadSet = (id: string) => {
    const loadedIntervals = loadSet(id);
    if (loadedIntervals) {
      setIntervals(loadedIntervals);
    }
  };

  const handleSaveCurrentSet = (name: string, description: string) => {
    if (intervals.length > 0) {
      saveSet(name, description, intervals);
    }
  };

  const exportTraining = () => {
    if (intervals.length === 0) {
      alert('No hay intervalos para exportar');
      return;
    }

    const exportData = {
      name: "Entrenamiento Exportado",
      description: "Entrenamiento exportado desde Bike Training Timer",
      intervals: intervals.map(interval => ({
        name: interval.name,
        duration: interval.duration,
        type: interval.type,
        color: interval.customColor || interval.color
      })),
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `entrenamiento-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTraining = () => {
    try {
      const data = JSON.parse(importText);
      
      if (!data.intervals || !Array.isArray(data.intervals)) {
        throw new Error('Formato JSON inválido: debe contener un array de intervalos');
      }

      const importedIntervals: Interval[] = data.intervals.map((interval: any, index: number) => {
        if (!interval.name || !interval.duration) {
          throw new Error(`Intervalo ${index + 1}: debe tener nombre y duración`);
        }

        return {
          id: Date.now().toString() + index,
          name: interval.name,
          duration: parseInt(interval.duration),
          type: interval.type || 'custom',
          color: interval.color || INTERVAL_COLORS.custom,
          customColor: interval.color || INTERVAL_COLORS.custom
        };
      });

      setIntervals(importedIntervals);
      setImportText('');
      setShowImportModal(false);
      alert(`Se importaron ${importedIntervals.length} intervalos correctamente`);
    } catch (error) {
      alert(`Error al importar: ${error instanceof Error ? error.message : 'Formato JSON inválido'}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = intervals.reduce((sum, interval) => sum + interval.duration, 0);

  const handleColorSelect = (color: string) => {
    setNewInterval({ ...newInterval, customColor: color });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Clock className="text-blue-500" size={32} />
              Bike Training Timer
            </h1>
            <p className="text-gray-600 mb-6">Configura tus intervalos de entrenamiento</p>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setShowSavedSetsModal(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen size={20} />
                Sets Guardados ({savedSets.length})
              </button>
              
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={20} />
                Importar JSON
              </button>
              
              <button
                onClick={exportTraining}
                disabled={intervals.length === 0}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Exportar JSON
              </button>
            </div>

            {/* Add New Interval Form */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-700 mb-4">Agregar Intervalo</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nombre del intervalo"
                  value={newInterval.name}
                  onChange={(e) => setNewInterval({ ...newInterval, name: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={newInterval.type}
                  onChange={(e) => {
                    const type = e.target.value as IntervalType;
                    setNewInterval({ 
                      ...newInterval, 
                      type,
                      customColor: INTERVAL_COLORS[type]
                    });
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="calentamiento">Calentamiento</option>
                  <option value="intenso">Intenso</option>
                  <option value="medio">Medio</option>
                  <option value="enfriamiento">Enfriamiento</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="number"
                  placeholder="Min"
                  value={newInterval.minutes}
                  onChange={(e) => setNewInterval({ ...newInterval, minutes: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                  min="0"
                />
                <span className="flex items-center text-gray-500 font-medium">:</span>
                <input
                  type="number"
                  placeholder="Seg"
                  value={newInterval.seconds}
                  onChange={(e) => setNewInterval({ ...newInterval, seconds: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
                  min="0"
                  max="59"
                />
              </div>

              {/* Color Selector */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Palette size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-700">Color del Intervalo</span>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {COLOR_OPTIONS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      onClick={() => handleColorSelect(colorOption.value)}
                      className={`w-12 h-12 rounded-lg transition-all duration-200 hover:scale-110 ${
                        newInterval.customColor === colorOption.value 
                          ? 'ring-4 ring-blue-300 ring-offset-2' 
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      style={{ backgroundColor: colorOption.value }}
                      title={colorOption.name}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newInterval.customColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">O elige un color personalizado</span>
                </div>
              </div>

              <button
                onClick={addInterval}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Agregar Intervalo
              </button>
            </div>

            {/* Intervals List */}
            {intervals.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">Intervalos Configurados</h3>
                <div className="space-y-3">
                  {intervals.map((interval, index) => (
                    <div
                      key={interval.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: interval.customColor || interval.color }}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-800">{interval.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{interval.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-gray-700">
                          {formatTime(interval.duration)}
                        </span>
                        <button
                          onClick={() => removeInterval(interval.id)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-800">Duración Total:</span>
                    <span className="font-mono font-bold text-blue-800 text-lg">
                      {formatTime(totalDuration)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Start Button */}
            {intervals.length > 0 && (
              <button
                onClick={startTraining}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 text-lg"
              >
                <Play size={24} />
                Iniciar Entrenamiento
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Importar Entrenamiento</h2>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportText('');
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <Trash2 size={24} />
                </button>
              </div>
              <p className="text-blue-100 mt-2">Pega el JSON de tu entrenamiento aquí</p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON del Entrenamiento:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`{
  "name": "Mi Entrenamiento",
  "intervals": [
    {
      "name": "Calentamiento",
      "duration": 240,
      "type": "calentamiento",
      "color": "#3B82F6"
    },
    {
      "name": "Intenso",
      "duration": 120,
      "type": "intenso", 
      "color": "#EF4444"
    }
  ]
}`}
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Formato esperado:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <code>name</code>: Nombre del intervalo</li>
                  <li>• <code>duration</code>: Duración en segundos</li>
                  <li>• <code>type</code>: Tipo de intervalo (opcional)</li>
                  <li>• <code>color</code>: Color en formato hex (opcional)</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={importTraining}
                  disabled={!importText.trim()}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  Importar
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportText('');
                  }}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Sets Modal */}
      <SavedSetsModal
        isOpen={showSavedSetsModal}
        onClose={() => setShowSavedSetsModal(false)}
        savedSets={savedSets}
        onLoadSet={handleLoadSet}
        onDeleteSet={deleteSet}
        onSaveCurrentSet={handleSaveCurrentSet}
        hasCurrentIntervals={intervals.length > 0}
      />
    </>
  );
}
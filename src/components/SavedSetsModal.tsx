import React, { useState } from 'react';
import { X, Play, Trash2, Clock, Calendar, Edit3, Save, Plus } from 'lucide-react';
import { SavedSet } from '../types';

interface SavedSetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSets: SavedSet[];
  onLoadSet: (id: string) => void;
  onDeleteSet: (id: string) => void;
  onSaveCurrentSet: (name: string, description: string) => void;
  hasCurrentIntervals: boolean;
}

export function SavedSetsModal({ 
  isOpen, 
  onClose, 
  savedSets, 
  onLoadSet, 
  onDeleteSet, 
  onSaveCurrentSet,
  hasCurrentIntervals 
}: SavedSetsModalProps) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [setName, setSetName] = useState('');
  const [setDescription, setSetDescription] = useState('');

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSaveSet = () => {
    if (setName.trim()) {
      onSaveCurrentSet(setName.trim(), setDescription.trim());
      setSetName('');
      setSetDescription('');
      setShowSaveForm(false);
    }
  };

  const handleLoadSet = (id: string) => {
    onLoadSet(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Sets Guardados</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-blue-100 mt-2">Gestiona tus entrenamientos favoritos</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Save Current Set Button */}
          {hasCurrentIntervals && !showSaveForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowSaveForm(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Guardar Set Actual
              </button>
            </div>
          )}

          {/* Save Form */}
          {showSaveForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-4">Guardar Set Actual</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre del set (ej: Entrenamiento HIIT)"
                  value={setName}
                  onChange={(e) => setSetName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Descripción opcional"
                  value={setDescription}
                  onChange={(e) => setSetDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSet}
                    disabled={!setName.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveForm(false);
                      setSetName('');
                      setSetDescription('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Sets List */}
          {savedSets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Edit3 size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay sets guardados</h3>
              <p className="text-gray-500">
                Crea algunos intervalos y guárdalos para usarlos más tarde
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedSets.map((set) => (
                <div
                  key={set.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 text-lg">{set.name}</h3>
                      {set.description && (
                        <p className="text-gray-600 text-sm mt-1">{set.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleLoadSet(set.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                        title="Cargar set"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteSet(set.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        title="Eliminar set"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatTime(set.totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{set.intervals.length} intervalos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(set.createdAt)}</span>
                    </div>
                    {set.lastUsed && (
                      <div className="text-green-600">
                        <span>Usado: {formatDate(set.lastUsed)}</span>
                      </div>
                    )}
                  </div>

                  {/* Intervals Preview */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {set.intervals.slice(0, 5).map((interval, index) => (
                      <div
                        key={interval.id}
                        className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-md text-xs"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: interval.customColor || interval.color }}
                        ></div>
                        <span>{interval.name}</span>
                      </div>
                    ))}
                    {set.intervals.length > 5 && (
                      <div className="bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-500">
                        +{set.intervals.length - 5} más
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
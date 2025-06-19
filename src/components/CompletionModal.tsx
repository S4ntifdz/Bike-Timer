import React from 'react';
import { CheckCircle, Trophy, Clock, Target } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalTime: number;
  totalIntervals: number;
}

export function CompletionModal({ isOpen, onClose, totalTime, totalIntervals }: CompletionModalProps) {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 text-center text-white">
          <div className="mb-4">
            <Trophy className="mx-auto mb-2" size={48} />
            <CheckCircle className="mx-auto" size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">¡Entrenamiento Completado!</h2>
          <p className="text-green-100 text-lg">¡Excelente trabajo!</p>
        </div>

        {/* Stats section */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-blue-50 rounded-full p-4 mb-3 inline-block">
                <Clock className="text-blue-500" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-800">{formatTime(totalTime)}</div>
              <div className="text-gray-600 text-sm">Tiempo Total</div>
            </div>
            <div className="text-center">
              <div className="bg-green-50 rounded-full p-4 mb-3 inline-block">
                <Target className="text-green-500" size={24} />
              </div>
              <div className="text-2xl font-bold text-gray-800">{totalIntervals}</div>
              <div className="text-gray-600 text-sm">Intervalos</div>
            </div>
          </div>

          {/* Motivational message */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ¡Misión Cumplida! 🎯
            </h3>
            <p className="text-gray-600">
              Has completado todos los intervalos de tu entrenamiento. 
              ¡Sigue así y alcanzarás tus objetivos!
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, RotateCcw, ArrowLeft, SkipForward } from 'lucide-react';
import { useTraining } from '../contexts/TrainingContext';
import { CompletionModal } from './CompletionModal';

interface TrainingTimerProps {
  onBackToSetup: () => void;
}

export function TrainingTimer({ onBackToSetup }: TrainingTimerProps) {
  const { state, dispatch } = useTraining();
  const [currentIntervalElapsed, setCurrentIntervalElapsed] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.isRunning && !state.isPaused) {
      interval = setInterval(() => {
        const newElapsedTime = state.elapsedTime + 1;
        dispatch({ type: 'UPDATE_TIME', payload: newElapsedTime });

        // Calculate current interval elapsed time
        let totalPassed = 0;
        let currentIntervalStart = 0;
        
        for (let i = 0; i < state.currentIntervalIndex; i++) {
          totalPassed += state.intervals[i].duration;
        }
        
        currentIntervalStart = totalPassed;
        const currentElapsed = newElapsedTime - currentIntervalStart;
        setCurrentIntervalElapsed(currentElapsed);

        // Check if current interval is finished
        if (currentElapsed >= state.intervals[state.currentIntervalIndex].duration) {
          if (state.currentIntervalIndex < state.intervals.length - 1) {
            dispatch({ type: 'NEXT_INTERVAL' });
            setCurrentIntervalElapsed(0);
            // Play notification sound (if available)
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
          } else {
            // Training finished
            dispatch({ type: 'COMPLETE_TRAINING' });
            setShowCompletionModal(true);
            if ('vibrate' in navigator) {
              navigator.vibrate([500, 200, 500, 200, 500]);
            }
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.isRunning, state.isPaused, state.elapsedTime, state.currentIntervalIndex, state.intervals, dispatch]);

  const handlePlayPause = () => {
    if (!state.isRunning && !state.isPaused) {
      dispatch({ type: 'START_TRAINING' });
    } else if (state.isRunning) {
      dispatch({ type: 'PAUSE_TRAINING' });
    } else if (state.isPaused) {
      dispatch({ type: 'RESUME_TRAINING' });
    }
  };

  const handleStop = () => {
    dispatch({ type: 'STOP_TRAINING' });
    setCurrentIntervalElapsed(0);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_TRAINING' });
    setCurrentIntervalElapsed(0);
  };

  const handleNextInterval = () => {
    if (state.currentIntervalIndex < state.intervals.length - 1) {
      // Calculate elapsed time up to the end of current interval
      let totalElapsedToNextInterval = 0;
      for (let i = 0; i <= state.currentIntervalIndex; i++) {
        totalElapsedToNextInterval += state.intervals[i].duration;
      }
      
      dispatch({ type: 'UPDATE_TIME', payload: totalElapsedToNextInterval });
      dispatch({ type: 'NEXT_INTERVAL' });
      setCurrentIntervalElapsed(0);
      
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      // If it's the last interval, complete the training
      dispatch({ type: 'COMPLETE_TRAINING' });
      setShowCompletionModal(true);
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
    }
  };

  const handleCloseModal = () => {
    setShowCompletionModal(false);
    handleReset();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentInterval = state.intervals[state.currentIntervalIndex];
  const remainingTime = state.totalDuration - state.elapsedTime;
  const currentIntervalRemaining = currentInterval ? currentInterval.duration - currentIntervalElapsed : 0;
  const progress = currentInterval ? (currentIntervalElapsed / currentInterval.duration) * 100 : 0;

  if (!currentInterval) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No hay intervalos configurados</p>
          <button
            onClick={onBackToSetup}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Volver a Configuración
          </button>
        </div>
      </div>
    );
  }

  const currentIntervalColor = currentInterval.customColor || currentInterval.color;

  return (
    <>
      <div 
        className="min-h-screen transition-colors duration-1000"
        style={{ 
          backgroundColor: `${currentIntervalColor}15` // 15 is hex for ~8% opacity
        }}
      >
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBackToSetup}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                Volver
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Entrenamiento</h1>
              <div></div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all duration-1000 shadow-sm"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: currentIntervalColor
                }}
              ></div>
            </div>

            {/* Current Interval Info */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentInterval.name}</h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentIntervalColor }}
                ></div>
                <p className="text-lg text-gray-600 capitalize">{currentInterval.type}</p>
              </div>
              
              {/* Current Interval Time */}
              <div className="mb-6">
                <div className="text-6xl font-mono font-bold text-gray-800 mb-2">
                  {formatTime(currentIntervalRemaining)}
                </div>
                <p className="text-gray-600">Tiempo restante del intervalo</p>
              </div>

              {/* Main Controls - Moved to main card */}
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={handlePlayPause}
                  className={`flex items-center justify-center w-16 h-16 rounded-full text-white font-bold transition-transform hover:scale-105 ${
                    state.isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {state.isRunning ? <Pause size={24} /> : <Play size={24} />}
                </button>
                
                <button
                  onClick={handleStop}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-transform hover:scale-105"
                >
                  <Square size={24} />
                </button>
                
                <button
                  onClick={handleNextInterval}
                  disabled={state.currentIntervalIndex >= state.intervals.length - 1 && currentIntervalRemaining <= 0}
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold transition-transform hover:scale-105"
                >
                  <SkipForward size={24} />
                </button>
              </div>
              
              <div className="flex justify-center gap-8 text-sm text-gray-600">
                <span>Play/Pause</span>
                <span>Stop</span>
                <span>Siguiente</span>
              </div>
            </div>
          </div>

          {/* Time Display */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-mono font-bold text-blue-600">
                  {formatTime(remainingTime)}
                </div>
                <p className="text-gray-600">Tiempo Total Restante</p>
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-green-600">
                  {formatTime(state.elapsedTime)}
                </div>
                <p className="text-gray-600">Tiempo Transcurrido</p>
              </div>
            </div>
          </div>

          {/* Interval Progress */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-700">Progreso</span>
              <span className="text-sm text-gray-500">
                {state.currentIntervalIndex + 1} de {state.intervals.length}
              </span>
            </div>
            
            <div className="space-y-2">
              {state.intervals.map((interval, index) => (
                <div
                  key={interval.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    index === state.currentIntervalIndex ? 'bg-blue-50 border-2 border-blue-200' : 
                    index < state.currentIntervalIndex ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: index < state.currentIntervalIndex ? '#10B981' :
                        index === state.currentIntervalIndex ? (interval.customColor || interval.color) : '#D1D5DB'
                    }}
                  ></div>
                  <span className={`flex-1 ${index === state.currentIntervalIndex ? 'font-semibold' : ''}`}>
                    {interval.name}
                  </span>
                  <span className="text-sm text-gray-500 font-mono">
                    {formatTime(interval.duration)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Controls */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
              >
                <RotateCcw size={20} />
                Reiniciar Entrenamiento
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={handleCloseModal}
        totalTime={state.totalDuration}
        totalIntervals={state.intervals.length}
      />
    </>
  );
}
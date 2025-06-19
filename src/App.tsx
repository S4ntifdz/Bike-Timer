import React, { useState } from 'react';
import { TrainingProvider } from './contexts/TrainingContext';
import { IntervalSetup } from './components/IntervalSetup';
import { TrainingTimer } from './components/TrainingTimer';

type AppView = 'setup' | 'training';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('setup');

  const handleStartTraining = () => {
    setCurrentView('training');
  };

  const handleBackToSetup = () => {
    setCurrentView('setup');
  };

  return (
    <TrainingProvider>
      <div className="app">
        {currentView === 'setup' && (
          <IntervalSetup onStartTraining={handleStartTraining} />
        )}
        {currentView === 'training' && (
          <TrainingTimer onBackToSetup={handleBackToSetup} />
        )}
      </div>
    </TrainingProvider>
  );
}

export default App;
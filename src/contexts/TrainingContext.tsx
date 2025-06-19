import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TrainingSession, Interval } from '../types';

interface TrainingState extends TrainingSession {}

type TrainingAction =
  | { type: 'SET_INTERVALS'; payload: Interval[] }
  | { type: 'START_TRAINING' }
  | { type: 'PAUSE_TRAINING' }
  | { type: 'RESUME_TRAINING' }
  | { type: 'STOP_TRAINING' }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'NEXT_INTERVAL' }
  | { type: 'RESET_TRAINING' }
  | { type: 'COMPLETE_TRAINING' };

const initialState: TrainingState = {
  intervals: [],
  totalDuration: 0,
  currentIntervalIndex: 0,
  elapsedTime: 0,
  isRunning: false,
  isPaused: false,
  isCompleted: false,
};

function trainingReducer(state: TrainingState, action: TrainingAction): TrainingState {
  switch (action.type) {
    case 'SET_INTERVALS':
      const totalDuration = action.payload.reduce((sum, interval) => sum + interval.duration, 0);
      return {
        ...state,
        intervals: action.payload,
        totalDuration,
        currentIntervalIndex: 0,
        elapsedTime: 0,
        isRunning: false,
        isPaused: false,
        isCompleted: false,
      };
    case 'START_TRAINING':
      return {
        ...state,
        isRunning: true,
        isPaused: false,
        isCompleted: false,
      };
    case 'PAUSE_TRAINING':
      return {
        ...state,
        isRunning: false,
        isPaused: true,
      };
    case 'RESUME_TRAINING':
      return {
        ...state,
        isRunning: true,
        isPaused: false,
      };
    case 'STOP_TRAINING':
      return {
        ...state,
        isRunning: false,
        isPaused: false,
        elapsedTime: 0,
        currentIntervalIndex: 0,
        isCompleted: false,
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        elapsedTime: action.payload,
      };
    case 'NEXT_INTERVAL':
      return {
        ...state,
        currentIntervalIndex: Math.min(state.currentIntervalIndex + 1, state.intervals.length - 1),
      };
    case 'RESET_TRAINING':
      return {
        ...state,
        currentIntervalIndex: 0,
        elapsedTime: 0,
        isRunning: false,
        isPaused: false,
        isCompleted: false,
      };
    case 'COMPLETE_TRAINING':
      return {
        ...state,
        isRunning: false,
        isPaused: false,
        isCompleted: true,
      };
    default:
      return state;
  }
}

const TrainingContext = createContext<{
  state: TrainingState;
  dispatch: React.Dispatch<TrainingAction>;
} | null>(null);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(trainingReducer, initialState);

  return (
    <TrainingContext.Provider value={{ state, dispatch }}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}
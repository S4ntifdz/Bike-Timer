export interface Interval {
  id: string;
  name: string;
  duration: number; // in seconds
  type: IntervalType;
  color: string;
  customColor?: string; // New field for custom colors
}

export type IntervalType = 'calentamiento' | 'intenso' | 'medio' | 'enfriamiento' | 'custom';

export interface TrainingSession {
  intervals: Interval[];
  totalDuration: number;
  currentIntervalIndex: number;
  elapsedTime: number;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean; // New field for completion state
}

export interface SavedSet {
  id: string;
  name: string;
  description?: string;
  intervals: Interval[];
  totalDuration: number;
  createdAt: Date;
  lastUsed?: Date;
}

export const INTERVAL_COLORS: Record<IntervalType, string> = {
  calentamiento: '#3B82F6', // Blue
  intenso: '#EF4444',       // Red
  medio: '#F59E0B',         // Yellow
  enfriamiento: '#10B981',  // Green
  custom: '#8B5CF6'         // Purple
};

export const INTERVAL_BG_COLORS: Record<IntervalType, string> = {
  calentamiento: 'bg-blue-500',
  intenso: 'bg-red-500',
  medio: 'bg-yellow-500',
  enfriamiento: 'bg-green-500',
  custom: 'bg-purple-500'
};

// Predefined color options for easy selection
export const COLOR_OPTIONS = [
  { name: 'Azul', value: '#3B82F6', bg: 'bg-blue-500' },
  { name: 'Rojo', value: '#EF4444', bg: 'bg-red-500' },
  { name: 'Verde', value: '#10B981', bg: 'bg-green-500' },
  { name: 'Amarillo', value: '#F59E0B', bg: 'bg-yellow-500' },
  { name: 'Púrpura', value: '#8B5CF6', bg: 'bg-purple-500' },
  { name: 'Rosa', value: '#EC4899', bg: 'bg-pink-500' },
  { name: 'Índigo', value: '#6366F1', bg: 'bg-indigo-500' },
  { name: 'Naranja', value: '#F97316', bg: 'bg-orange-500' },
  { name: 'Cian', value: '#06B6D4', bg: 'bg-cyan-500' },
  { name: 'Esmeralda', value: '#059669', bg: 'bg-emerald-500' },
];
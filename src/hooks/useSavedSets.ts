import { useState, useEffect } from 'react';
import { SavedSet, Interval } from '../types';

const STORAGE_KEY = 'bike-training-saved-sets';

export function useSavedSets() {
  const [savedSets, setSavedSets] = useState<SavedSet[]>([]);

  // Load saved sets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const setsWithDates = parsed.map((set: any) => ({
          ...set,
          createdAt: new Date(set.createdAt),
          lastUsed: set.lastUsed ? new Date(set.lastUsed) : undefined
        }));
        setSavedSets(setsWithDates);
      }
    } catch (error) {
      console.error('Error loading saved sets:', error);
    }
  }, []);

  // Save sets to localStorage whenever savedSets changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSets));
    } catch (error) {
      console.error('Error saving sets:', error);
    }
  }, [savedSets]);

  const saveSet = (name: string, description: string, intervals: Interval[]) => {
    const totalDuration = intervals.reduce((sum, interval) => sum + interval.duration, 0);
    
    const newSet: SavedSet = {
      id: Date.now().toString(),
      name,
      description,
      intervals: intervals.map(interval => ({ ...interval })), // Deep copy
      totalDuration,
      createdAt: new Date(),
    };

    setSavedSets(prev => [newSet, ...prev]);
    return newSet;
  };

  const deleteSet = (id: string) => {
    setSavedSets(prev => prev.filter(set => set.id !== id));
  };

  const loadSet = (id: string) => {
    const set = savedSets.find(s => s.id === id);
    if (set) {
      // Update last used date
      setSavedSets(prev => prev.map(s => 
        s.id === id ? { ...s, lastUsed: new Date() } : s
      ));
      return set.intervals;
    }
    return null;
  };

  const updateSet = (id: string, name: string, description: string, intervals: Interval[]) => {
    const totalDuration = intervals.reduce((sum, interval) => sum + interval.duration, 0);
    
    setSavedSets(prev => prev.map(set => 
      set.id === id 
        ? { 
            ...set, 
            name, 
            description, 
            intervals: intervals.map(interval => ({ ...interval })),
            totalDuration 
          }
        : set
    ));
  };

  return {
    savedSets,
    saveSet,
    deleteSet,
    loadSet,
    updateSet
  };
}
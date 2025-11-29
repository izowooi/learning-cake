'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Theme = 'minimal' | 'retro' | 'neon' | 'cute';

interface GameState {
  theme: Theme;
  results: number[];
  currentRound: number;
  animationEnabled: boolean;
}

interface GameContextType {
  gameState: GameState;
  setTheme: (theme: Theme) => void;
  setAnimationEnabled: (enabled: boolean) => void;
  addResult: (time: number) => void;
  resetGame: () => void;
  nextRound: () => void;
}

const initialState: GameState = {
  theme: 'minimal',
  results: [],
  currentRound: 1,
  animationEnabled: false,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const setTheme = useCallback((theme: Theme) => {
    setGameState(prev => ({ ...prev, theme }));
  }, []);

  const setAnimationEnabled = useCallback((enabled: boolean) => {
    setGameState(prev => ({ ...prev, animationEnabled: enabled }));
  }, []);

  const addResult = useCallback((time: number) => {
    setGameState(prev => ({
      ...prev,
      results: [...prev.results, time],
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      results: [],
      currentRound: 1,
    }));
  }, []);

  const nextRound = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
    }));
  }, []);

  return (
    <GameContext.Provider value={{ gameState, setTheme, setAnimationEnabled, addResult, resetGame, nextRound }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}


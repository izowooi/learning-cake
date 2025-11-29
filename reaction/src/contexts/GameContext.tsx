'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Theme = 'minimal' | 'retro' | 'neon' | 'cute';

interface GameState {
  theme: Theme;
  results: number[];
  currentRound: number;
}

interface GameContextType {
  gameState: GameState;
  setTheme: (theme: Theme) => void;
  addResult: (time: number) => void;
  resetGame: () => void;
  nextRound: () => void;
}

const initialState: GameState = {
  theme: 'minimal',
  results: [],
  currentRound: 1,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const setTheme = useCallback((theme: Theme) => {
    setGameState(prev => ({ ...prev, theme }));
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
    <GameContext.Provider value={{ gameState, setTheme, addResult, resetGame, nextRound }}>
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


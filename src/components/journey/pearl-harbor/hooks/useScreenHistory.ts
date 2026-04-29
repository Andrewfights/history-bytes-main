/**
 * useScreenHistory - Manage screen navigation with back support
 * Tracks screen history for proper back navigation within beats
 */

import { useState, useCallback } from 'react';

interface UseScreenHistoryOptions<T extends string> {
  initialScreen: T;
  screens: readonly T[];
  onExit?: () => void;  // Called when going back from first screen
}

interface UseScreenHistoryReturn<T extends string> {
  screen: T;
  screenHistory: T[];
  canGoBack: boolean;
  isFirstScreen: boolean;
  goToScreen: (nextScreen: T) => void;
  goBack: () => void;
  goNext: (skipScreens?: T[]) => void;
  resetHistory: (toScreen?: T) => void;
  getProgress: () => { current: number; total: number; percent: number };
}

export function useScreenHistory<T extends string>({
  initialScreen,
  screens,
  onExit,
}: UseScreenHistoryOptions<T>): UseScreenHistoryReturn<T> {
  const [screen, setScreen] = useState<T>(initialScreen);
  const [screenHistory, setScreenHistory] = useState<T[]>([initialScreen]);

  // Can go back if there's more than one screen in history
  const canGoBack = screenHistory.length > 1;
  const isFirstScreen = screenHistory.length === 1;

  // Navigate to a specific screen (adds to history)
  const goToScreen = useCallback((nextScreen: T) => {
    setScreen(nextScreen);
    setScreenHistory(prev => [...prev, nextScreen]);
  }, []);

  // Go back to previous screen in history
  const goBack = useCallback(() => {
    if (screenHistory.length > 1) {
      // Remove current screen from history
      const newHistory = screenHistory.slice(0, -1);
      const previousScreen = newHistory[newHistory.length - 1];
      setScreen(previousScreen);
      setScreenHistory(newHistory);
    } else if (onExit) {
      // At first screen, call exit handler
      onExit();
    }
  }, [screenHistory, onExit]);

  // Go to next screen in the defined screens array (skipping specified screens)
  const goNext = useCallback((skipScreens: T[] = []) => {
    const currentIndex = screens.indexOf(screen);
    if (currentIndex < screens.length - 1) {
      let nextIndex = currentIndex + 1;
      // Skip any screens in the skipScreens array
      while (nextIndex < screens.length && skipScreens.includes(screens[nextIndex])) {
        nextIndex++;
      }
      if (nextIndex < screens.length) {
        const nextScreen = screens[nextIndex];
        setScreen(nextScreen);
        setScreenHistory(prev => [...prev, nextScreen]);
      }
    }
  }, [screen, screens]);

  // Reset history to initial or specified screen
  const resetHistory = useCallback((toScreen?: T) => {
    const resetScreen = toScreen || initialScreen;
    setScreen(resetScreen);
    setScreenHistory([resetScreen]);
  }, [initialScreen]);

  // Get current progress through screens
  const getProgress = useCallback(() => {
    const currentIndex = screens.indexOf(screen);
    const total = screens.length;
    return {
      current: currentIndex + 1,
      total,
      percent: ((currentIndex + 1) / total) * 100,
    };
  }, [screen, screens]);

  return {
    screen,
    screenHistory,
    canGoBack,
    isFirstScreen,
    goToScreen,
    goBack,
    goNext,
    resetHistory,
    getProgress,
  };
}

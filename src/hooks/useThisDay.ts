import { useState, useEffect, useCallback, useMemo } from 'react';
import { getEventsForToday, HistoricalEvent } from '@/data/thisDayData';

interface UseThisDayReturn {
  events: HistoricalEvent[];
  currentEvent: HistoricalEvent | null;
  currentIndex: number;
  nextEvent: () => void;
  prevEvent: () => void;
  goToEvent: (index: number) => void;
  hasMultiple: boolean;
  dateDisplay: string;
  isLoading: boolean;
}

export function useThisDay(autoRotateMs: number = 8000): UseThisDayReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const events = useMemo(() => getEventsForToday(), []);
  const hasMultiple = events.length > 1;

  // Mark loading complete after initial mount
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Auto-rotate every N milliseconds if multiple events
  useEffect(() => {
    if (!hasMultiple || autoRotateMs <= 0) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % events.length);
    }, autoRotateMs);

    return () => clearInterval(timer);
  }, [events.length, hasMultiple, autoRotateMs]);

  const nextEvent = useCallback(() => {
    if (events.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % events.length);
  }, [events.length]);

  const prevEvent = useCallback(() => {
    if (events.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + events.length) % events.length);
  }, [events.length]);

  const goToEvent = useCallback((index: number) => {
    if (index >= 0 && index < events.length) {
      setCurrentIndex(index);
    }
  }, [events.length]);

  const dateDisplay = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  }, []);

  return {
    events,
    currentEvent: events[currentIndex] || null,
    currentIndex,
    nextEvent,
    prevEvent,
    goToEvent,
    hasMultiple,
    dateDisplay,
    isLoading,
  };
}

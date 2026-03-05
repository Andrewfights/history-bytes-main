import { useApp } from '@/context/AppContext';
import { getSpiritGuideById } from '@/data/spiritGuidesData';
import type { SpiritGuide } from '@/types';

export function useOnboarding() {
  const {
    isOnboarded,
    completeOnboarding,
    selectedGuideId,
    setSelectedGuide,
    isHydrated,
  } = useApp();

  const currentGuide: SpiritGuide | null = selectedGuideId
    ? getSpiritGuideById(selectedGuideId) || null
    : null;

  return {
    isOnboarded,
    isHydrated,
    completeOnboarding,
    selectedGuideId,
    setSelectedGuide,
    currentGuide,
  };
}

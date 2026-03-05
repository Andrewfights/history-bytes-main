import { motion, AnimatePresence } from 'framer-motion';
import { VideoIntroScreen } from './VideoIntroScreen';
import { getHostById } from '@/data/hostsData';
import type { JourneyChapter } from '@/types';

interface ChapterIntroVideoProps {
  chapter: JourneyChapter;
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function ChapterIntroVideo({
  chapter,
  isOpen,
  onComplete,
  onSkip,
}: ChapterIntroVideoProps) {
  // Get host info for messaging
  const host = getHostById(chapter.arcId === 'world-war-2' ? 'correspondent' : 'historian');

  const hostMessages: Record<string, string> = {
    'ww2-c1': 'Let me set the stage for you. This is how the war began - with invasions, declarations, and the start of the deadliest conflict in human history.',
    'ww2-c2': 'The war has spread across the globe. From the frozen streets of Stalingrad to the Pacific islands, millions are fighting on every continent.',
    'ww2-c3': 'This is it - the final chapter. D-Day, liberation, and the dawn of the atomic age. History\'s deadliest war comes to an end.',
  };

  if (!chapter.aiVideoUrl) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <VideoIntroScreen
          videoUrl={chapter.aiVideoUrl}
          title={chapter.title}
          hostName={host?.name}
          hostAvatar={host?.avatar}
          hostMessage={hostMessages[chapter.id] || 'Let me introduce you to this chapter...'}
          onComplete={onComplete}
          onSkip={onSkip}
        />
      )}
    </AnimatePresence>
  );
}

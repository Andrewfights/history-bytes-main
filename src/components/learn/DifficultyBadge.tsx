import { CourseDifficulty } from '@/types';

interface DifficultyBadgeProps {
  difficulty: CourseDifficulty;
  size?: 'sm' | 'md';
}

const difficultyConfig = {
  beginner: {
    label: 'Beginner',
    className: 'badge-beginner',
  },
  intermediate: {
    label: 'Intermediate',
    className: 'badge-intermediate',
  },
  advanced: {
    label: 'Advanced',
    className: 'badge-advanced',
  },
};

export function DifficultyBadge({ difficulty, size = 'sm' }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${config.className}`}
    >
      {config.label}
    </span>
  );
}

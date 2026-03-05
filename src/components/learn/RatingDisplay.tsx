import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  ratingsCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md';
}

export function RatingDisplay({ rating, ratingsCount, showCount = true, size = 'sm' }: RatingDisplayProps) {
  const iconSize = size === 'sm' ? 12 : 14;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={`inline-flex items-center gap-1 ${textSize}`}>
      <Star size={iconSize} className="text-gold-highlight fill-gold-highlight" />
      <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
      {showCount && ratingsCount && (
        <span className="text-muted-foreground">({formatCount(ratingsCount)})</span>
      )}
    </div>
  );
}

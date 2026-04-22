/**
 * CampaignSelector - Horizontal scrolling campaign tabs for Trophy Room
 * Shows campaign icon, name, and earned/total count
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Landmark, Pyramid, Flag, Swords } from 'lucide-react';

export interface Campaign {
  id: string;
  name: string;
  era: string;
  icon?: React.ReactNode;
  earned: number;
  total: number;
}

interface CampaignSelectorProps {
  campaigns: Campaign[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

// Default era icons
const eraIcons: Record<string, React.ReactNode> = {
  ww2: <Shield size={16} />,
  modern: <Shield size={16} />,
  classical: <Landmark size={16} />,
  ancient: <Pyramid size={16} />,
  revolution: <Flag size={16} />,
  medieval: <Swords size={16} />,
};

export function CampaignSelector({
  campaigns,
  selectedId,
  onSelect,
  className,
}: CampaignSelectorProps) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar',
        className
      )}
    >
      {campaigns.map((campaign) => {
        const isSelected = campaign.id === selectedId;
        const icon = campaign.icon || eraIcons[campaign.era.toLowerCase()] || <Shield size={16} />;

        return (
          <button
            key={campaign.id}
            onClick={() => onSelect(campaign.id)}
            className={cn(
              'flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200',
              'font-mono text-[9px] tracking-wide uppercase',
              isSelected
                ? 'bg-ink-lift border-gold-2 text-gold-2'
                : 'bg-transparent border-off-white/10 text-text-3 hover:border-off-white/20'
            )}
          >
            <span className={cn(isSelected ? 'text-gold-2' : 'text-text-3')}>
              {icon}
            </span>
            <span className="font-semibold">{campaign.name}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[8px] font-bold',
                isSelected ? 'bg-gold-2/20 text-gold-2' : 'bg-off-white/5 text-text-3'
              )}
            >
              {campaign.earned}/{campaign.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default CampaignSelector;

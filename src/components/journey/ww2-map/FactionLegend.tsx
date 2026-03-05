/**
 * FactionLegend - Color legend and progress for factions
 */

import { FACTION_COLORS, WW2Faction, getProgressForFaction, WW2_COUNTRIES } from '@/data/ww2Countries';

interface FactionLegendProps {
  completedCountries: string[];
  selectedFaction: WW2Faction | 'all';
  onSelectFaction: (faction: WW2Faction | 'all') => void;
}

export function FactionLegend({
  completedCountries,
  selectedFaction,
  onSelectFaction,
}: FactionLegendProps) {
  const factions: { id: WW2Faction; label: string }[] = [
    { id: 'allies', label: 'Allies' },
    { id: 'axis', label: 'Axis' },
    { id: 'neutral', label: 'Neutral' },
  ];

  return (
    <div className="flex items-center gap-2 p-2 bg-card/80 backdrop-blur-sm rounded-xl border border-border">
      {/* All filter */}
      <button
        onClick={() => onSelectFaction('all')}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          selectedFaction === 'all'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
        }`}
      >
        All
      </button>

      {/* Faction filters */}
      {factions.map((faction) => {
        const progress = getProgressForFaction(faction.id, completedCountries);
        const isSelected = selectedFaction === faction.id;

        return (
          <button
            key={faction.id}
            onClick={() => onSelectFaction(faction.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {/* Color dot */}
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: FACTION_COLORS[faction.id].base }}
            />
            <span>{faction.label}</span>
            <span className="text-muted-foreground">
              ({progress.completed}/{progress.total})
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Compact version for mobile
export function FactionLegendCompact({
  completedCountries,
}: {
  completedCountries: string[];
}) {
  const factions: { id: WW2Faction; label: string }[] = [
    { id: 'allies', label: 'Allies' },
    { id: 'axis', label: 'Axis' },
    { id: 'neutral', label: 'Neutral' },
  ];

  return (
    <div className="flex items-center justify-center gap-4 p-2">
      {factions.map((faction) => {
        const progress = getProgressForFaction(faction.id, completedCountries);

        return (
          <div key={faction.id} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: FACTION_COLORS[faction.id].base }}
            />
            <span className="text-xs text-muted-foreground">
              {faction.label} ({progress.completed}/{progress.total})
            </span>
          </div>
        );
      })}
    </div>
  );
}

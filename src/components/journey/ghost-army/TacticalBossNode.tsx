import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertTriangle, CheckCircle2, XCircle, ChevronRight, Target } from 'lucide-react';
import { TacticalBossContent, DeceptionAsset, MapZone } from '@/data/ghostArmyStory';
import { useGhostArmyNodeMedia } from './useGhostArmyMedia';

interface TacticalBossNodeProps {
  content: TacticalBossContent;
  xpReward: number;
  onComplete: (xp: number, stats: { correct: number; total: number }) => void;
}

type Phase = 'briefing' | 'mission' | 'result';

interface PlacedAsset {
  assetId: string;
  zoneId: string;
}

export function TacticalBossNode({ content, xpReward, onComplete }: TacticalBossNodeProps) {
  const [phase, setPhase] = useState<Phase>('briefing');
  const [timeRemaining, setTimeRemaining] = useState(content.timeLimit);
  const [placedAssets, setPlacedAssets] = useState<PlacedAsset[]>([]);
  const [draggedAsset, setDraggedAsset] = useState<string | null>(null);
  const [threatLevel, setThreatLevel] = useState(100);
  const [isSuccess, setIsSuccess] = useState(false);
  const [correctPlacements, setCorrectPlacements] = useState(0);

  // Get stored media for this node
  const media = useGhostArmyNodeMedia('node-4-boss');

  // Calculate available assets (not yet placed)
  const getAvailableCount = (assetId: string) => {
    const asset = content.assets.find(a => a.id === assetId);
    if (!asset) return 0;
    const placedCount = placedAssets.filter(p => p.assetId === assetId).length;
    return asset.count - placedCount;
  };

  // Timer effect
  useEffect(() => {
    if (phase !== 'mission') return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleMissionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Update threat level based on correct placements
  useEffect(() => {
    if (phase !== 'mission') return;

    let correct = 0;
    const totalRequired = content.zones.reduce((sum, zone) => sum + zone.correctAssets.length, 0);

    content.zones.forEach(zone => {
      const assetsInZone = placedAssets.filter(p => p.zoneId === zone.id);
      zone.correctAssets.forEach(correctAssetId => {
        if (assetsInZone.some(a => a.assetId === correctAssetId)) {
          correct++;
        }
      });
    });

    setCorrectPlacements(correct);
    const newThreatLevel = Math.max(0, 100 - (correct / totalRequired) * 100);
    setThreatLevel(newThreatLevel);

    // Auto-complete if all placements are correct
    if (correct === totalRequired) {
      setTimeout(() => handleMissionEnd(), 500);
    }
  }, [placedAssets, content.zones, phase]);

  const handleStartMission = () => {
    setPhase('mission');
  };

  const handleMissionEnd = useCallback(() => {
    const totalRequired = content.zones.reduce((sum, zone) => sum + zone.correctAssets.length, 0);
    const success = correctPlacements === totalRequired;
    setIsSuccess(success);
    setPhase('result');
  }, [correctPlacements, content.zones]);

  const handleAssetDragStart = (assetId: string) => {
    if (getAvailableCount(assetId) > 0) {
      setDraggedAsset(assetId);
    }
  };

  const handleZoneDrop = (zoneId: string) => {
    if (draggedAsset && getAvailableCount(draggedAsset) > 0) {
      setPlacedAssets(prev => [...prev, { assetId: draggedAsset, zoneId }]);
    }
    setDraggedAsset(null);
  };

  const handleRemoveAsset = (index: number) => {
    setPlacedAssets(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    const totalRequired = content.zones.reduce((sum, zone) => sum + zone.correctAssets.length, 0);
    const earnedXP = Math.floor(xpReward * (correctPlacements / totalRequired));
    // Add time bonus if completed quickly
    const timeBonus = isSuccess && timeRemaining > 30 ? Math.floor(timeRemaining / 10) * 5 : 0;
    onComplete(earnedXP + timeBonus, { correct: isSuccess ? 1 : 0, total: 1 });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      <AnimatePresence mode="wait">
        {/* Briefing Phase */}
        {phase === 'briefing' && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] flex flex-col"
          >
            {/* Boss intro header */}
            <div className="bg-gradient-to-b from-amber-500/20 to-transparent p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Target className="text-amber-400" size={24} />
                <span className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Boss Battle
                </span>
              </div>
              <h2 className="font-editorial text-2xl font-bold text-center">
                {content.operationName}
              </h2>
              <p className="text-center text-muted-foreground mt-2">
                {content.title}
              </p>
            </div>

            {/* Briefing content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
              <div className="p-6 rounded-2xl bg-card border border-border max-w-sm mb-8">
                <p className="text-center leading-relaxed">
                  {content.briefing}
                </p>
              </div>

              {/* Mission parameters */}
              <div className="flex items-center gap-6 mb-8">
                <div className="text-center">
                  <Timer size={24} className="mx-auto mb-1 text-amber-400" />
                  <p className="text-xs text-muted-foreground">Time Limit</p>
                  <p className="font-bold">{formatTime(content.timeLimit)}</p>
                </div>
                <div className="text-center">
                  <Target size={24} className="mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Assets</p>
                  <p className="font-bold">{content.assets.reduce((sum, a) => sum + a.count, 0)}</p>
                </div>
                <div className="text-center">
                  <AlertTriangle size={24} className="mx-auto mb-1 text-gold-highlight" />
                  <p className="text-xs text-muted-foreground">XP Reward</p>
                  <p className="font-bold text-gold-highlight">{xpReward}</p>
                </div>
              </div>

              <button
                onClick={handleStartMission}
                className="px-8 py-4 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
              >
                Begin Mission
              </button>
            </div>
          </motion.div>
        )}

        {/* Mission Phase */}
        {phase === 'mission' && (
          <motion.div
            key="mission"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)]"
          >
            {/* Timer and threat meter */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Timer size={18} className={timeRemaining <= 30 ? 'text-red-400 animate-pulse' : 'text-muted-foreground'} />
                  <span className={`font-mono font-bold ${timeRemaining <= 30 ? 'text-red-400' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Threat Level</span>
                  <span className={`font-bold ${threatLevel < 30 ? 'text-success' : threatLevel < 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {Math.round(threatLevel)}%
                  </span>
                </div>
              </div>
              {/* Threat meter bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${threatLevel < 30 ? 'bg-success' : threatLevel < 70 ? 'bg-amber-400' : 'bg-red-400'}`}
                  animate={{ width: `${threatLevel}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Tactical Map */}
            <div className="p-4">
              {/* Map visualization */}
              <div className="relative bg-obsidian-900 rounded-xl p-4 mb-4 overflow-hidden">
                {/* Background image if available */}
                {media?.backgroundImage && (
                  <img
                    src={media.backgroundImage}
                    alt="Tactical Map"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}
                {/* Rhine River representation */}
                <div className="absolute left-0 right-0 top-1/2 h-3 bg-blue-500/30 -translate-y-1/2 z-0" />
                <p className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 z-10">Rhine River</p>

                {/* Drop zones */}
                <div className="relative z-10 space-y-3 py-8">
                  {content.zones.map(zone => {
                    const assetsInZone = placedAssets.filter(p => p.zoneId === zone.id);
                    const isComplete = zone.correctAssets.every(assetId =>
                      assetsInZone.some(p => p.assetId === assetId)
                    );

                    return (
                      <div
                        key={zone.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleZoneDrop(zone.id)}
                        onClick={() => draggedAsset && handleZoneDrop(zone.id)}
                        className={`p-4 rounded-lg border-2 border-dashed transition-all min-h-[80px] ${
                          draggedAsset
                            ? 'border-primary bg-primary/10 cursor-pointer'
                            : isComplete
                            ? 'border-success/50 bg-success/5'
                            : 'border-muted bg-card/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold">{zone.name}</span>
                          {isComplete && <CheckCircle2 size={16} className="text-success" />}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{zone.description}</p>

                        {/* Placed assets in zone */}
                        <div className="flex flex-wrap gap-2">
                          {assetsInZone.map((placed, index) => {
                            const asset = content.assets.find(a => a.id === placed.assetId);
                            const globalIndex = placedAssets.findIndex(
                              (p, i) => p.assetId === placed.assetId && p.zoneId === placed.zoneId && i === placedAssets.indexOf(placed)
                            );
                            return (
                              <motion.button
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={() => handleRemoveAsset(globalIndex)}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-sm hover:bg-red-500/20 hover:text-red-400 transition-colors"
                              >
                                <span>{asset?.icon}</span>
                                <span className="text-xs">x</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deception assets */}
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-sm font-bold mb-3">Deception Assets</h3>
                <div className="grid grid-cols-3 gap-3">
                  {content.assets.map(asset => {
                    const available = getAvailableCount(asset.id);
                    const isAvailable = available > 0;

                    return (
                      <button
                        key={asset.id}
                        onClick={() => handleAssetDragStart(asset.id)}
                        disabled={!isAvailable}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          draggedAsset === asset.id
                            ? 'bg-primary/20 border-primary scale-105'
                            : isAvailable
                            ? 'bg-card border-border hover:border-primary cursor-pointer'
                            : 'bg-muted/50 border-muted/50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-2xl mb-1">{asset.icon}</div>
                        <p className="text-xs font-medium truncate">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">x{available}</p>
                      </button>
                    );
                  })}
                </div>
                {draggedAsset && (
                  <p className="text-xs text-primary text-center mt-3 animate-pulse">
                    Tap a zone to place asset
                  </p>
                )}
              </div>

              {/* Execute button */}
              <button
                onClick={handleMissionEnd}
                className="w-full mt-4 py-4 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
              >
                Execute Plan
              </button>
            </div>
          </motion.div>
        )}

        {/* Result Phase */}
        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                isSuccess ? 'bg-success/20' : 'bg-amber-500/20'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 size={40} className="text-success" />
              ) : (
                <AlertTriangle size={40} className="text-amber-400" />
              )}
            </motion.div>

            <h2 className="font-editorial text-2xl font-bold text-center mb-2">
              {isSuccess ? 'Mission Accomplished!' : 'Mission Incomplete'}
            </h2>

            <p className="text-muted-foreground text-center mb-6">
              {isSuccess
                ? `Time remaining: ${formatTime(timeRemaining)}`
                : `${correctPlacements} correct placements`}
            </p>

            {/* Outcome narration */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6 max-w-sm">
              <p className="font-editorial italic text-center">
                "{isSuccess ? content.successNarration : content.failureNarration}"
              </p>
            </div>

            {/* XP earned */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-gold-highlight font-bold text-lg">
                +{(() => {
                  const totalRequired = content.zones.reduce((sum, zone) => sum + zone.correctAssets.length, 0);
                  const earnedXP = Math.floor(xpReward * (correctPlacements / totalRequired));
                  const timeBonus = isSuccess && timeRemaining > 30 ? Math.floor(timeRemaining / 10) * 5 : 0;
                  return earnedXP + timeBonus;
                })()} XP
              </span>
              {isSuccess && timeRemaining > 30 && (
                <span className="text-xs text-success">(+time bonus!)</span>
              )}
            </div>

            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              Continue
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * WW2PathSelection - Choose between WW2 Map or Pearl Harbor Module
 */

import { motion } from 'framer-motion';
import { Globe, Anchor, ArrowLeft } from 'lucide-react';
import { WW2Host } from '@/types';

interface WW2PathSelectionProps {
  host: WW2Host;
  onSelectMap: () => void;
  onSelectPearlHarbor: () => void;
  onBack: () => void;
}

export function WW2PathSelection({
  host,
  onSelectMap,
  onSelectPearlHarbor,
  onBack,
}: WW2PathSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black"
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </div>
          <div>
            <h1 className="font-editorial text-lg font-bold text-white">
              World War II
            </h1>
            <p className="text-sm text-white/60">with {host.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-2xl font-editorial font-bold text-white mb-2"
        >
          Choose Your Path
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-white/60 mb-8 max-w-md"
        >
          Explore the entire war or dive deep into a specific event
        </motion.p>

        {/* Path Cards */}
        <div className="w-full max-w-md space-y-4">
          {/* WW2 Map Option */}
          <PathCard
            icon={<Globe size={32} className="text-blue-400" />}
            title="WW2 World Map"
            description="Explore the entire war by region. Navigate through Europe, Asia, and the Pacific."
            onSelect={onSelectMap}
            delay={0.4}
            accentColor="from-blue-500/20 to-blue-600/20"
            borderColor="border-blue-500/30 hover:border-blue-400/50"
          />

          {/* Pearl Harbor Option */}
          <PathCard
            icon={<Anchor size={32} className="text-red-400" />}
            title="Pearl Harbor"
            subtitle="Day of Infamy"
            description="December 7, 1941. Experience the attack that brought America into the war through interactive games and stories."
            onSelect={onSelectPearlHarbor}
            delay={0.5}
            accentColor="from-red-500/20 to-orange-600/20"
            borderColor="border-red-500/30 hover:border-red-400/50"
            isHighlighted
          />
        </div>
      </div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 text-center text-white/40 text-sm pb-4 px-4"
      >
        Your guide preference is saved for future visits
      </motion.p>
    </motion.div>
  );
}

interface PathCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  description: string;
  onSelect: () => void;
  delay: number;
  accentColor: string;
  borderColor: string;
  isHighlighted?: boolean;
}

function PathCard({
  icon,
  title,
  subtitle,
  description,
  onSelect,
  delay,
  accentColor,
  borderColor,
  isHighlighted,
}: PathCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${borderColor} bg-gradient-to-br ${accentColor}`}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="shrink-0 w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white text-lg">{title}</h3>
            {isHighlighted && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                Featured
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-white/80 text-sm font-medium mb-1">{subtitle}</p>
          )}
          <p className="text-white/50 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}

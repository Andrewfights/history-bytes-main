/**
 * WW2WorldMap - Main interactive world map component
 * Design: History Academy Dark v2 - European Theater Campaign Map
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, ZoomIn, ZoomOut, Maximize2, Star, Clock } from 'lucide-react';
import { WW2_MAP_CONFIG, WW2_COUNTRIES, WW2Faction, getCountryById } from '@/data/ww2Countries';
import { useWW2MapProgress } from './useWW2MapProgress';
import { CountryPath, CompletionOverlay, AvailablePulse } from './CountryPath';
import { CountryTooltip } from './CountryTooltip';
import { CountryModal } from './CountryModal';
import { FactionLegend, FactionLegendCompact } from './FactionLegend';
import { MapControls, MapControlsHorizontal } from './MapControls';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface WW2WorldMapProps {
  onSelectCountry: (countryId: string) => void;
  onBack: () => void;
}

export function WW2WorldMap({ onSelectCountry, onBack }: WW2WorldMapProps) {
  const isMobile = useIsMobile();
  const { progress, isLoading, getCountryStatus, setCurrentCountry } = useWW2MapProgress();

  // Map state
  const [zoom, setZoom] = useState(WW2_MAP_CONFIG.defaultZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedFaction, setSelectedFaction] = useState<WW2Faction | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch/drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter countries by selected faction
  const visibleCountries = selectedFaction === 'all'
    ? WW2_COUNTRIES
    : WW2_COUNTRIES.filter(c => c.faction === selectedFaction);

  // Handle country click
  const handleCountrySelect = useCallback((countryId: string) => {
    setSelectedCountry(countryId);
    setIsModalOpen(true);
  }, []);

  // Handle country hover
  const handleCountryHover = useCallback((countryId: string | null) => {
    setHoveredCountry(countryId);

    if (countryId && svgRef.current && containerRef.current) {
      const country = getCountryById(countryId);
      if (country) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const svgRect = svgRef.current.getBoundingClientRect();

        // Calculate tooltip position based on country center
        const scaleX = svgRect.width / 700;
        const scaleY = svgRect.height / 750;

        const x = svgRect.left - containerRect.left + country.centerPoint.x * scaleX * zoom + pan.x;
        const y = svgRect.top - containerRect.top + country.centerPoint.y * scaleY * zoom + pan.y;

        setTooltipPosition({ x, y });
      }
    } else {
      setTooltipPosition(null);
    }
  }, [zoom, pan]);

  // Start journey for a country
  const handleStartJourney = useCallback(async (countryId: string) => {
    await setCurrentCountry(countryId);
    onSelectCountry(countryId);
  }, [setCurrentCountry, onSelectCountry]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, WW2_MAP_CONFIG.maxZoom));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, WW2_MAP_CONFIG.minZoom));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(WW2_MAP_CONFIG.defaultZoom);
    setPan({ x: 0, y: 0 });
  }, []);

  // Mouse/touch pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleReset]);

  // Scroll wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(Math.max(prev + delta, WW2_MAP_CONFIG.minZoom), WW2_MAP_CONFIG.maxZoom));
  }, []);

  // Stats
  const totalCountries = WW2_COUNTRIES.filter(c => c.moduleId).length;
  const completedCount = progress.completedCountries.length;
  const progressPercent = totalCountries > 0 ? Math.round((completedCount / totalCountries) * 100) : 0;
  const alliesCount = WW2_COUNTRIES.filter(c => c.faction === 'allies' && c.moduleId).length;
  const axisCount = WW2_COUNTRIES.filter(c => c.faction === 'axis' && c.moduleId).length;
  const neutralCount = WW2_COUNTRIES.filter(c => c.faction === 'neutral' && c.moduleId).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_center,rgba(19,34,52,0.9),rgba(5,7,9,0.98))] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          {/* Animated seal */}
          <div className="w-[70px] h-[70px] relative">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-spin" style={{ animationDuration: '8s' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="#B2641F" strokeWidth="1.5"/>
              <circle cx="50" cy="50" r="38" fill="none" stroke="#E6AB2A" strokeWidth="0.5" strokeDasharray="2,3"/>
              <polygon points="50,18 53,44 78,44 58,60 65,84 50,70 35,84 42,60 22,44 47,44" fill="#E6AB2A"/>
              <circle cx="50" cy="50" r="4" fill="#F6E355"/>
            </svg>
          </div>
          <div className="font-display text-[16px] font-bold text-off-white uppercase tracking-[0.2em] italic">
            Deploying Cartographers
          </div>
          <div className="font-mono text-[10px] text-gold-2 tracking-[0.3em] uppercase font-semibold">
            Loading Theater<span className="inline-flex gap-[3px] ml-1">
              <span className="animate-pulse" style={{ animationDelay: '0s' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  const hoveredCountryData = hoveredCountry ? getCountryById(hoveredCountry) : null;
  const selectedCountryData = selectedCountry ? getCountryById(selectedCountry) : null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-void overflow-hidden">
      {/* Top Bar */}
      <header className="h-[56px] bg-void border-b border-gold-2/15 flex items-center px-5 gap-7 relative z-20 flex-shrink-0">
        {/* Red accent line */}
        <div className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-gradient-to-r from-transparent via-ha-red to-transparent opacity-30" />

        {/* Back + Brand */}
        <button
          onClick={onBack}
          className="text-off-white/70 hover:text-off-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="font-display font-bold text-off-white uppercase leading-[0.95]">
            <div className="text-[12px] tracking-[0.01em]">History</div>
            <div className="text-[8.5px] tracking-[0.22em] font-semibold text-gold-2 mt-[1px]">Academy</div>
          </div>
        </div>

        {/* Nav - Desktop only */}
        <nav className="hidden md:flex gap-5 items-center flex-1 justify-center">
          {['Home', 'Campaign', 'Learn', 'Arcade', 'Watch'].map((item) => (
            <span
              key={item}
              className={cn(
                'font-mono text-[10.5px] font-semibold tracking-[0.25em] text-off-white/50 uppercase cursor-pointer relative py-1 px-0.5 hover:text-off-white/70 transition-colors',
                item === 'Campaign' && 'text-gold-2 after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:w-[22px] after:h-[2px] after:bg-gold-2'
              )}
            >
              {item}
            </span>
          ))}
        </nav>

        {/* Theater pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-ink border border-gold-2/15 font-mono text-[9px] text-off-white/70 tracking-[0.2em] uppercase font-semibold">
          <span className="w-[6px] h-[6px] bg-[#3DD67A] rounded-full shadow-[0_0_6px_rgba(61,214,122,0.6)]" />
          <span className="text-[#3DD67A]">Live</span>
          <span>· European Theater</span>
        </div>
      </header>

      {/* Map Container */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 48%, #1b3048 0%, #132234 50%, #070e18 100%)' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', background: 'radial-gradient(ellipse at 50% 48%, #1b3048 0%, #132234 50%, #070e18 100%)' }}
      >
        {/* Campaign Header Overlay */}
        <div className="absolute top-4 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
          {/* Left - Title */}
          <div className="pointer-events-auto">
            <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.35em] text-ha-red font-semibold uppercase mb-1">
              <span className="w-[18px] h-[1px] bg-ha-red" />
              Campaign 02 · WWII Europe
            </div>
            <h2 className="font-display text-[26px] font-bold text-off-white uppercase tracking-[-0.005em] leading-none mb-1 italic">
              Theater Of <em className="text-gold-2 italic">Operations</em>
            </h2>
            <div className="font-mono text-[10px] text-off-white/50 tracking-[0.15em] uppercase">
              <span className="text-gold-1">{totalCountries}</span> Missions · <span className="text-gold-1">Sep 1939 – May 1945</span>
            </div>
          </div>

          {/* Right - Legend */}
          <div className="hidden md:flex pointer-events-auto bg-[rgba(10,13,18,0.85)] backdrop-blur-sm border border-gold-2/15 py-2.5 px-3.5 gap-3.5 items-center">
            <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-off-white/70 uppercase font-semibold">
              <span className="w-[10px] h-[10px] bg-[#2A5580] border border-[#6A9FD0]" />
              Allied Powers
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-off-white/70 uppercase font-semibold">
              <span className="w-[10px] h-[10px] bg-[#7A2218] border border-ha-red" />
              Axis Powers
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-off-white/70 uppercase font-semibold">
              <span className="w-[10px] h-[10px] bg-[#4d4230] border border-[#8A7550]" />
              Neutral
            </div>
          </div>
        </div>

        {/* SVG Map */}
        <svg
          ref={svgRef}
          viewBox={WW2_MAP_CONFIG.viewBox}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            willChange: 'transform',
          }}
        >
          {/* Ocean gradient background */}
          <defs>
            <radialGradient id="seaRadial" cx="50%" cy="48%" r="72%">
              <stop offset="0%" stopColor="#1b3048"/>
              <stop offset="50%" stopColor="#132234"/>
              <stop offset="100%" stopColor="#070e18"/>
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="700" height="750" fill="url(#seaRadial)" />

          {/* Country paths */}
          {visibleCountries.map((country) => {
            const status = getCountryStatus(country.id);
            const isSelected = selectedCountry === country.id;
            const isHovered = hoveredCountry === country.id;

            return (
              <g key={country.id}>
                <CountryPath
                  country={country}
                  status={status}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  onSelect={handleCountrySelect}
                  onHover={handleCountryHover}
                />
                <AvailablePulse
                  country={country}
                  isAvailable={status === 'available'}
                />
                <CompletionOverlay
                  country={country}
                  isComplete={status === 'complete'}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {!isMobile && hoveredCountryData && (
          <CountryTooltip
            country={hoveredCountryData}
            status={getCountryStatus(hoveredCountryData.id)}
            position={tooltipPosition}
          />
        )}

        {/* Zoom Panel - Right side */}
        <div className="absolute top-1/2 right-5 -translate-y-1/2 bg-[rgba(10,13,18,0.88)] backdrop-blur-sm border border-gold-2/15 flex flex-col items-center p-2.5 gap-2 z-10">
          {/* Corner accents */}
          <div className="absolute -top-[1px] -left-[1px] w-[7px] h-[7px] border-t border-l border-gold-2" />
          <div className="absolute -bottom-[1px] -right-[1px] w-[7px] h-[7px] border-b border-r border-gold-2" />

          <button
            onClick={handleZoomIn}
            disabled={zoom >= WW2_MAP_CONFIG.maxZoom}
            className="w-8 h-8 flex items-center justify-center text-off-white/70 hover:text-gold-2 hover:bg-gold-2/[0.08] transition-all disabled:opacity-30"
          >
            <ZoomIn size={14} />
          </button>

          <div className="font-mono text-[9.5px] text-gold-2 font-bold tracking-[0.12em] py-1 border-t border-b border-off-white/[0.08] w-full text-center">
            {Math.round(zoom * 100)}%
          </div>

          <button
            onClick={handleZoomOut}
            disabled={zoom <= WW2_MAP_CONFIG.minZoom}
            className="w-8 h-8 flex items-center justify-center text-off-white/70 hover:text-gold-2 hover:bg-gold-2/[0.08] transition-all disabled:opacity-30"
          >
            <ZoomOut size={14} />
          </button>

          <div className="w-5 h-[1px] bg-off-white/[0.08]" />

          <button
            onClick={handleReset}
            className="w-8 h-8 flex items-center justify-center text-off-white/70 hover:text-gold-2 hover:bg-gold-2/[0.08] transition-all"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Command Bar */}
      <div className="flex-shrink-0 bg-[rgba(5,7,9,0.96)] backdrop-blur-xl border-t border-gold-2/15 py-3.5 px-6 flex items-center gap-5 relative z-20">
        {/* Gold accent line */}
        <div className="absolute top-[-1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-2 to-transparent opacity-35" />

        {/* Filter label */}
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-off-white/50 tracking-[0.3em] uppercase font-semibold">
          <span className="text-ha-red text-[7px]">◆</span>
          Filter
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-1">
          {/* All chip */}
          <button
            onClick={() => setSelectedFaction('all')}
            className={cn(
              'flex items-center gap-2.5 px-3.5 py-2 border transition-all',
              selectedFaction === 'all'
                ? 'bg-gold-2 border-gold-1'
                : 'bg-ink border-gold-2/15 hover:border-gold-2/30'
            )}
          >
            <span className={cn(
              'font-display text-[12px] font-bold uppercase tracking-[0.06em]',
              selectedFaction === 'all' ? 'text-[#1a1008]' : 'text-off-white'
            )}>
              All
            </span>
            <span className={cn(
              'font-mono text-[9px] tracking-[0.1em] font-semibold pl-2 border-l',
              selectedFaction === 'all' ? 'text-[#1a1008]/60 border-[#1a1008]/30' : 'text-off-white/50 border-off-white/[0.08]'
            )}>
              <span className={selectedFaction === 'all' ? 'text-[#1a1008]' : 'text-gold-1'}>{completedCount}</span> / {totalCountries}
            </span>
          </button>

          {/* Allies chip */}
          <button
            onClick={() => setSelectedFaction('allies')}
            className={cn(
              'flex items-center gap-2.5 px-3.5 py-2 border transition-all',
              selectedFaction === 'allies'
                ? 'border-[#6A9FD0]'
                : 'bg-ink border-gold-2/15 hover:border-gold-2/30'
            )}
          >
            <span className="w-2 h-2 bg-[#6A9FD0] border border-[#6A9FD0] shadow-[0_0_6px_rgba(106,159,208,0.5)]" />
            <span className="font-display text-[12px] font-bold text-off-white uppercase tracking-[0.06em]">Allies</span>
            <span className="font-mono text-[9px] text-off-white/50 tracking-[0.1em] font-semibold pl-2 border-l border-off-white/[0.08]">
              <span className="text-gold-1">{progress.completedCountries.filter(id => WW2_COUNTRIES.find(c => c.id === id)?.faction === 'allies').length}</span> / {alliesCount}
            </span>
          </button>

          {/* Axis chip */}
          <button
            onClick={() => setSelectedFaction('axis')}
            className={cn(
              'flex items-center gap-2.5 px-3.5 py-2 border transition-all',
              selectedFaction === 'axis'
                ? 'border-ha-red'
                : 'bg-ink border-gold-2/15 hover:border-gold-2/30'
            )}
          >
            <span className="w-2 h-2 bg-ha-red border border-[#E84046] shadow-[0_0_6px_rgba(205,14,20,0.5)]" />
            <span className="font-display text-[12px] font-bold text-off-white uppercase tracking-[0.06em]">Axis</span>
            <span className="font-mono text-[9px] text-off-white/50 tracking-[0.1em] font-semibold pl-2 border-l border-off-white/[0.08]">
              <span className="text-gold-1">{progress.completedCountries.filter(id => WW2_COUNTRIES.find(c => c.id === id)?.faction === 'axis').length}</span> / {axisCount}
            </span>
          </button>

          {/* Neutral chip */}
          <button
            onClick={() => setSelectedFaction('neutral')}
            className={cn(
              'flex items-center gap-2.5 px-3.5 py-2 border transition-all',
              selectedFaction === 'neutral'
                ? 'border-[#8A7550]'
                : 'bg-ink border-gold-2/15 hover:border-gold-2/30'
            )}
          >
            <span className="w-2 h-2 bg-[#8A7550] border border-[#8A7550]" />
            <span className="font-display text-[12px] font-bold text-off-white uppercase tracking-[0.06em]">Neutral</span>
            <span className="font-mono text-[9px] text-off-white/50 tracking-[0.1em] font-semibold pl-2 border-l border-off-white/[0.08]">
              <span className="text-gold-1">{progress.completedCountries.filter(id => WW2_COUNTRIES.find(c => c.id === id)?.faction === 'neutral').length}</span> / {neutralCount}
            </span>
          </button>
        </div>

        {/* Right side - Progress & XP */}
        <div className="hidden md:flex items-center gap-3.5">
          {/* Progress */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2.5 font-mono text-[9px] text-off-white/50 tracking-[0.2em] uppercase font-semibold">
              <span>Campaign Progress</span>
              <span className="text-gold-1 text-[11px] tracking-[0.05em]">{progressPercent}%</span>
            </div>
            <div className="w-40 h-[3px] bg-off-white/[0.08] relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold-3 to-gold-1"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* XP Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1F1810] border border-[rgba(178,100,31,0.4)] relative">
            <div className="absolute inset-[2px] border border-dashed border-[rgba(178,100,31,0.3)] pointer-events-none" />
            <Star size={12} className="text-gold-1 relative z-[2]" fill="currentColor" />
            <span className="font-display text-[13px] font-bold text-gold-1 tracking-[0.02em] relative z-[2]">
              {progress.totalXP || 0}
            </span>
            <span className="font-mono text-[8.5px] text-off-white/70 tracking-[0.2em] uppercase font-semibold relative z-[2]">
              XP
            </span>
          </div>
        </div>
      </div>

      {/* Country Modal */}
      <CountryModal
        country={selectedCountryData}
        status={selectedCountryData ? getCountryStatus(selectedCountryData.id) : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartJourney={handleStartJourney}
      />
    </div>
  );
}

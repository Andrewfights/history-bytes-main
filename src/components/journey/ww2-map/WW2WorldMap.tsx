/**
 * WW2WorldMap - Main interactive world map component
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe } from 'lucide-react';
import { WW2_MAP_CONFIG, WW2_COUNTRIES, WW2Faction, getCountryById } from '@/data/ww2Countries';
import { useWW2MapProgress } from './useWW2MapProgress';
import { CountryPath, CompletionOverlay, AvailablePulse } from './CountryPath';
import { CountryTooltip } from './CountryTooltip';
import { CountryModal } from './CountryModal';
import { FactionLegend, FactionLegendCompact } from './FactionLegend';
import { MapControls, MapControlsHorizontal } from './MapControls';
import { useIsMobile } from '@/hooks/use-mobile';

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Globe size={48} className="mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  const hoveredCountryData = hoveredCountry ? getCountryById(hoveredCountry) : null;
  const selectedCountryData = selectedCountry ? getCountryById(selectedCountry) : null;

  return (
    <div className="relative h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="font-editorial text-xl font-bold">WW2 Theater</h1>
          <p className="text-sm text-muted-foreground">
            {progress.completedCountries.length}/{WW2_COUNTRIES.filter(c => c.moduleId).length} countries explored
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-slate-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
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
          {/* Ocean/background */}
          <rect x="0" y="0" width="700" height="750" fill="#1E3A5F" />

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

        {/* Map Controls */}
        <div className="absolute top-4 right-4">
          <MapControls
            zoom={zoom}
            minZoom={WW2_MAP_CONFIG.minZoom}
            maxZoom={WW2_MAP_CONFIG.maxZoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* Bottom Legend/Filter */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm p-3">
        {isMobile ? (
          <div className="space-y-2">
            <FactionLegendCompact completedCountries={progress.completedCountries} />
            <div className="flex justify-center">
              <MapControlsHorizontal
                zoom={zoom}
                minZoom={WW2_MAP_CONFIG.minZoom}
                maxZoom={WW2_MAP_CONFIG.maxZoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <FactionLegend
              completedCountries={progress.completedCountries}
              selectedFaction={selectedFaction}
              onSelectFaction={setSelectedFaction}
            />
          </div>
        )}
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

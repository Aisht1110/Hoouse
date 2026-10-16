import React from 'react';
import { Volume2, VolumeX, Sun, Droplets, BatteryCharging } from 'lucide-react';
import { TourPresetId } from '../scene/VillaCanvas.tsx';

interface TopBarProps {
  solarKw: number;
  batterySoc: number;
  isSprinklerActive: boolean;
  timeHours: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onSelectNavPreset: (presetId: TourPresetId) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  solarKw,
  batterySoc,
  isSprinklerActive,
  timeHours,
  isMuted,
  onToggleMute,
  onSelectNavPreset,
}) => {
  // Format time display
  const hourInt = Math.floor(timeHours);
  const minInt = Math.floor((timeHours - hourInt) * 60);
  const timeStr = `${hourInt.toString().padStart(2, '0')}:${minInt.toString().padStart(2, '0')}`;

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-auto">
      {/* Primary Top Bar matching the 3-Zone Top Bar Contract */}
      <div className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0b0f19]/90 border-b border-white/10">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-base font-bold tracking-tight text-white uppercase whitespace-nowrap">
            Solaris Villa
          </span>
          <span className="text-xs text-amber-400/80 font-mono tracking-wider hidden sm:inline">
            // Smart Eco-Estate
          </span>
        </div>

        {/* Zone 2: 4-5 Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <button
            onClick={() => onSelectNavPreset('facade')}
            className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            Architecture
          </button>
          <button
            onClick={() => onSelectNavPreset('garden')}
            className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            Smart Garden
          </button>
          <button
            onClick={() => onSelectNavPreset('solar')}
            className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            Solar Matrix
          </button>
          <button
            onClick={() => onSelectNavPreset('party')}
            className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            Party Pavilion
          </button>
          <button
            onClick={() => onSelectNavPreset('garage')}
            className="hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            Back Garage
          </button>
        </nav>

        {/* Zone 3: Primary Action & Audio Mute Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute procedural sound' : 'Mute procedural sound'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Sound Off' : 'Sound On'}</span>
          </button>

          <button
            onClick={() => onSelectNavPreset('overview')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-md shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Aerial Tour
          </button>
        </div>
      </div>

      {/* Clean Unboxed Estate Telemetry Strip (Zero-Pill Discipline with · separators) */}
      <div className="px-6 py-1.5 bg-[#080d16]/95 border-b border-white/5 flex items-center justify-between overflow-x-auto text-[11px] text-slate-400">
        <div className="flex items-center gap-3 whitespace-nowrap font-mono-numbers">
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <Sun className="w-3.5 h-3.5" />
            <span>{solarKw.toFixed(1)} kW</span>
          </span>
          <span className="text-slate-600" aria-hidden="true">·</span>

          <span className="flex items-center gap-1 text-sky-400">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>Storage: {batterySoc.toFixed(0)}%</span>
          </span>
          <span className="text-slate-600" aria-hidden="true">·</span>

          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span className={isSprinklerActive ? 'text-cyan-300 font-medium' : 'text-slate-400'}>
              Irrigation: {isSprinklerActive ? 'Spraying Active' : 'Standby'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3 whitespace-nowrap font-mono-numbers">
          <span>Time: {timeStr}</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span>Ambient: 26°C</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="text-emerald-400">100% Clean Solar Power</span>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  Compass,
  Droplets,
  Sun,
  Moon,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { TourPresetId, TOUR_PRESETS } from '../scene/VillaCanvas.tsx';
import { IrrigationZone, SolarTelemetry } from '../utils/estateLogic.ts';

interface ControlDockProps {
  activePreset: TourPresetId;
  onSelectPreset: (id: TourPresetId) => void;
  // Irrigation state
  zones: IrrigationZone[];
  isSprinklerActive: boolean;
  autoIrrigationEnabled: boolean;
  onToggleSprinklers: () => void;
  onToggleAutoIrrigation: () => void;
  // Solar state
  solarTelemetry: SolarTelemetry;
  // Lighting & Atmosphere
  timeHours: number;
  onChangeTimeHours: (hours: number) => void;
  interiorLightsOn: boolean;
  poolLightsOn: boolean;
  isPartyActive: boolean;
  onToggleInteriorLights: () => void;
  onTogglePoolLights: () => void;
  onToggleParty: () => void;
}

type DockTab = 'tour' | 'irrigation' | 'solar' | 'atmosphere';

export const ControlDock: React.FC<ControlDockProps> = ({
  activePreset,
  onSelectPreset,
  zones,
  isSprinklerActive,
  autoIrrigationEnabled,
  onToggleSprinklers,
  onToggleAutoIrrigation,
  solarTelemetry,
  timeHours,
  onChangeTimeHours,
  interiorLightsOn,
  poolLightsOn,
  isPartyActive,
  onToggleInteriorLights,
  onTogglePoolLights,
  onToggleParty,
}) => {
  const [activeTab, setActiveTab] = useState<DockTab>('tour');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const currentPresetObj = TOUR_PRESETS.find((p) => p.id === activePreset);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[94vw] max-w-4xl z-30 pointer-events-auto transition-transform duration-300">
      {/* Collapse / Expand Tab Toggle */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0e1422] border border-white/15 border-b-0 rounded-t-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-md"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Show Controls Dock' : 'Hide Controls Dock'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Show Estate Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Zen Mode / Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {/* Main Opaque Panel (Zero backdrop-filter for WebGL render safety) */}
      {!isCollapsed && (
        <div className="bg-[#0b0f19] border border-white/15 rounded-xl shadow-2xl p-4 text-slate-200">
          {/* Header row: Tab Bar & Active Location descriptor */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            {/* Functional Segmented Tab Buttons */}
            <div className="flex items-center gap-1 bg-[#131b2e] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveTab('tour')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'tour'
                    ? 'bg-amber-400 text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Camera Tour</span>
              </button>

              <button
                onClick={() => setActiveTab('irrigation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'irrigation'
                    ? 'bg-cyan-500 text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Smart Irrigation</span>
              </button>

              <button
                onClick={() => setActiveTab('solar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'solar'
                    ? 'bg-amber-400 text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Solar &amp; Energy</span>
              </button>

              <button
                onClick={() => setActiveTab('atmosphere')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'atmosphere'
                    ? 'bg-amber-400 text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Atmosphere</span>
              </button>
            </div>

            {/* Current View Subtitle */}
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400 font-medium">
                {currentPresetObj?.tagline}
              </span>
            </div>
          </div>

          {/* TAB CONTENT 1: CAMERA TOUR */}
          {activeTab === 'tour' && (
            <div className="pt-3">
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                {TOUR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset.id)}
                    className={`px-2 py-2 text-xs rounded-lg border transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      activePreset === preset.id
                        ? 'bg-amber-400/20 border-amber-400 text-amber-200 font-semibold'
                        : 'bg-[#131b2e]/80 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="whitespace-nowrap">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: SMART IRRIGATION SYSTEM */}
          {activeTab === 'irrigation' && (
            <div className="pt-3 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131b2e] p-3 rounded-lg border border-white/10">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <span>Lush Garden Moisture Telemetry &amp; 3D Sprinklers</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Real-time multi-zone soil probes with automated replenishment threshold (Target: 65%)
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onToggleAutoIrrigation}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                      autoIrrigationEnabled
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Auto-Schedule: {autoIrrigationEnabled ? 'Enabled' : 'Manual'}
                  </button>

                  <button
                    onClick={onToggleSprinklers}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer ${
                      isSprinklerActive
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900'
                        : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {isSprinklerActive ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Stop Sprinklers</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Sprinklers</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 4 Irrigation Zones */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {zones.map((zone) => {
                  const isLow = zone.moisturePercent < 45;
                  const isOptimal = zone.moisturePercent >= 55 && zone.moisturePercent <= 80;
                  return (
                    <div
                      key={zone.id}
                      className="bg-[#101726] border border-white/10 rounded-lg p-2.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-300 truncate">{zone.name}</span>
                        <span className="font-mono-numbers text-cyan-400 font-bold">
                          {zone.moisturePercent.toFixed(1)}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isLow ? 'bg-amber-500' : isOptimal ? 'bg-cyan-400' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, zone.moisturePercent)}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 font-mono-numbers">
                        <span>Flow: {isSprinklerActive ? `${zone.flowRateLitersPerMin}L/m` : '0L/m'}</span>
                        <span className={isLow ? 'text-amber-400' : 'text-emerald-400'}>
                          {isLow ? 'Needs Water' : 'Optimal'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: SOLAR & STORAGE TELEMETRY */}
          {activeTab === 'solar' && (
            <div className="pt-3 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-numbers">
                <div className="bg-[#101726] border border-white/10 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider">PV Generation</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    {solarTelemetry.solarGenerationKw.toFixed(2)} kW
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Peak Capacity: 18.5 kWp</div>
                </div>

                <div className="bg-[#101726] border border-white/10 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider">Battery Storage</div>
                  <div className="text-xl font-bold text-sky-400 mt-1">
                    {solarTelemetry.batterySocPercent.toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">30.0 kWh Lith-Ion Bank</div>
                </div>

                <div className="bg-[#101726] border border-white/10 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider">Estate Load</div>
                  <div className="text-xl font-bold text-slate-200 mt-1">
                    {solarTelemetry.houseLoadKw.toFixed(2)} kW
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Lighting, Pumps, AC</div>
                </div>

                <div className="bg-[#101726] border border-white/10 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider">Net Grid Feed</div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      solarTelemetry.netGridKw >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {solarTelemetry.netGridKw >= 0
                      ? `+${solarTelemetry.netGridKw.toFixed(2)} kW`
                      : `${solarTelemetry.netGridKw.toFixed(2)} kW`}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {solarTelemetry.netGridKw >= 0 ? 'Exporting Surplus' : 'Importing Draw'}
                  </div>
                </div>
              </div>

              {/* Sustainability metric strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 bg-[#131b2e] p-2.5 rounded-lg border border-white/10">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Est. Daily Generation: 92.4 kWh</span>
                </span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span>CO2 Offset Today: 44.2 kg</span>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-amber-300">Daily Savings: ~$28.50</span>
              </div>
            </div>
          )}

          {/* TAB CONTENT 4: ATMOSPHERE & LIGHTING */}
          {activeTab === 'atmosphere' && (
            <div className="pt-3 space-y-3">
              {/* Sun Position / Time Slider */}
              <div className="bg-[#131b2e] p-3 rounded-lg border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Time of Day &amp; Sun Position</span>
                  </span>
                  <span className="font-mono-numbers text-amber-400 font-bold">
                    {Math.floor(timeHours).toString().padStart(2, '0')}:
                    {Math.floor((timeHours % 1) * 60).toString().padStart(2, '0')}
                    {timeHours >= 17.5 && timeHours <= 19.5 ? ' (Golden Sunset)' : ''}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="24"
                  step="0.25"
                  value={timeHours}
                  onChange={(e) => onChangeTimeHours(parseFloat(e.target.value))}
                  aria-label="Time of Day Slider"
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <button
                    onClick={() => onChangeTimeHours(6.5)}
                    className="hover:text-amber-300 cursor-pointer"
                  >
                    Sunrise (06:30)
                  </button>
                  <button
                    onClick={() => onChangeTimeHours(13.0)}
                    className="hover:text-amber-300 cursor-pointer"
                  >
                    Midday (13:00)
                  </button>
                  <button
                    onClick={() => onChangeTimeHours(18.5)}
                    className="text-amber-300 font-bold underline cursor-pointer"
                  >
                    Golden Hour (18:30)
                  </button>
                  <button
                    onClick={() => onChangeTimeHours(22.5)}
                    className="hover:text-amber-300 cursor-pointer"
                  >
                    Midnight (22:30)
                  </button>
                </div>
              </div>

              {/* Architectural Light Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={onToggleInteriorLights}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer ${
                    interiorLightsOn
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                      : 'bg-[#101726] border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-medium flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Interior &amp; Ceiling Strips</span>
                  </span>
                  <span className="text-[11px] font-mono-numbers">
                    {interiorLightsOn ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={onTogglePoolLights}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer ${
                    poolLightsOn
                      ? 'bg-sky-950/60 border-sky-500/50 text-sky-200'
                      : 'bg-[#101726] border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-medium flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Underwater Pool Glow</span>
                  </span>
                  <span className="text-[11px] font-mono-numbers">
                    {poolLightsOn ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  onClick={onToggleParty}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer ${
                    isPartyActive
                      ? 'bg-orange-950/60 border-orange-500/50 text-orange-200'
                      : 'bg-[#101726] border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Party Grill &amp; String Lights</span>
                  </span>
                  <span className="text-[11px] font-mono-numbers">
                    {isPartyActive ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

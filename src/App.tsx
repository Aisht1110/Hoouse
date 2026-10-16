import React, { useState, useEffect, useCallback } from 'react';
import { VillaCanvas, TourPresetId, TOUR_PRESETS } from './scene/VillaCanvas.tsx';
import { TopBar } from './components/TopBar.tsx';
import { ControlDock } from './components/ControlDock.tsx';
import { soundEngine } from './scene/audio.ts';
import {
  calculateSolarPower,
  calculateHouseLoad,
  updateBatteryStorage,
  updateZoneMoisture,
  type IrrigationZone,
  type SolarTelemetry,
} from './utils/estateLogic.ts';

const INITIAL_ZONES: IrrigationZone[] = [
  {
    id: 'z1',
    name: 'Front Entrance Lawn',
    moisturePercent: 48.0,
    targetMoisturePercent: 65.0,
    areaSqMeters: 140,
    flowRateLitersPerMin: 32,
    active: true,
  },
  {
    id: 'z2',
    name: 'Ornamental Shrub Bed',
    moisturePercent: 54.0,
    targetMoisturePercent: 65.0,
    areaSqMeters: 65,
    flowRateLitersPerMin: 18,
    active: true,
  },
  {
    id: 'z3',
    name: 'Specimen Cloud Trees',
    moisturePercent: 58.5,
    targetMoisturePercent: 65.0,
    areaSqMeters: 45,
    flowRateLitersPerMin: 14,
    active: true,
  },
  {
    id: 'z4',
    name: 'Perimeter Hedge Line',
    moisturePercent: 62.0,
    targetMoisturePercent: 65.0,
    areaSqMeters: 90,
    flowRateLitersPerMin: 22,
    active: true,
  },
];

export default function App() {
  // Preset waypoint state
  const [activePreset, setActivePreset] = useState<TourPresetId>('facade');

  // Time of Day (18.5 = 6:30 PM Golden Hour Sunset matching reference image)
  const [timeHours, setTimeHours] = useState<number>(18.5);

  // Irrigation system state
  const [zones, setZones] = useState<IrrigationZone[]>(INITIAL_ZONES);
  const [isSprinklerActive, setIsSprinklerActive] = useState<boolean>(false);
  const [autoIrrigationEnabled, setAutoIrrigationEnabled] = useState<boolean>(true);

  // Lighting & Appliances state
  const [interiorLightsOn, setInteriorLightsOn] = useState<boolean>(true);
  const [poolLightsOn, setPoolLightsOn] = useState<boolean>(true);
  const [isPartyActive, setIsPartyActive] = useState<boolean>(false);

  // Audio mute state
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Solar & Battery state
  const [batterySoc, setBatterySoc] = useState<number>(88.0);
  const [solarTelemetry, setSolarTelemetry] = useState<SolarTelemetry>({
    sunElevationDeg: 28,
    solarGenerationKw: 11.2,
    peakCapacityKw: 18.5,
    houseLoadKw: 3.45,
    batterySocPercent: 88.0,
    netGridKw: 7.75,
    dailyEnergyGeneratedKwh: 92.4,
    co2OffsetKg: 44.2,
    dailySavingsUsd: 28.5,
  });

  // Handle Sprinkler Toggle
  const handleToggleSprinklers = useCallback(() => {
    soundEngine.playUiClick();
    setIsSprinklerActive((prev) => {
      const next = !prev;
      soundEngine.updateSprinklerSound(next);
      return next;
    });
  }, []);

  const handleToggleAutoIrrigation = useCallback(() => {
    soundEngine.playUiClick();
    setAutoIrrigationEnabled((prev) => !prev);
  }, []);

  // Handle Audio Mute
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  // Handle Preset Change
  const handleSelectPreset = useCallback((presetId: TourPresetId) => {
    soundEngine.playCameraWhoosh();
    setActivePreset(presetId);
  }, []);

  // Handle Lighting Toggles
  const handleToggleInteriorLights = useCallback(() => {
    soundEngine.playUiClick();
    setInteriorLightsOn((prev) => !prev);
  }, []);

  const handleTogglePoolLights = useCallback(() => {
    soundEngine.playUiClick();
    setPoolLightsOn((prev) => !prev);
  }, []);

  const handleToggleParty = useCallback(() => {
    soundEngine.playUiClick();
    setIsPartyActive((prev) => !prev);
  }, []);

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleToggleSprinklers();
      } else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (TOUR_PRESETS[idx]) {
          handleSelectPreset(TOUR_PRESETS[idx].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleSprinklers, handleSelectPreset]);

  // Telemetry Simulation Loop (runs once per second)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Calculate solar power
      const { powerKw, elevationDeg } = calculateSolarPower(timeHours, 18.5, 30);

      // 2. Calculate house consumption
      const loadKw = calculateHouseLoad({
        interiorLightsOn,
        poolHeaterPumpOn: poolLightsOn,
        partyGrillLightsOn: isPartyActive,
        gymActive: activePreset === 'gym',
        irrigationPumpsActive: isSprinklerActive,
        activeSprinklerCount: isSprinklerActive ? 4 : 0,
      });

      // 3. Update battery & grid
      const { newSocPercent, netGridKw } = updateBatteryStorage(
        batterySoc,
        powerKw,
        loadKw,
        30.0,
        1 / 60 // 1 second step in hours
      );
      setBatterySoc(newSocPercent);

      setSolarTelemetry((prev) => ({
        ...prev,
        sunElevationDeg: elevationDeg,
        solarGenerationKw: powerKw,
        houseLoadKw: loadKw,
        batterySocPercent: newSocPercent,
        netGridKw,
      }));

      // 4. Update zone soil moistures
      setZones((prevZones) => {
        let avgMoisture = 0;
        const updated = prevZones.map((zone) => {
          const newMoisture = updateZoneMoisture(zone, 26, isSprinklerActive, 1 / 60);
          avgMoisture += newMoisture;
          return { ...zone, moisturePercent: newMoisture };
        });
        avgMoisture /= updated.length;

        // Auto-Irrigation logic
        if (autoIrrigationEnabled) {
          if (!isSprinklerActive && avgMoisture < 45) {
            setIsSprinklerActive(true);
            soundEngine.updateSprinklerSound(true);
          } else if (isSprinklerActive && avgMoisture >= 65) {
            setIsSprinklerActive(false);
            soundEngine.updateSprinklerSound(false);
          }
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    timeHours,
    interiorLightsOn,
    poolLightsOn,
    isPartyActive,
    activePreset,
    isSprinklerActive,
    autoIrrigationEnabled,
    batterySoc,
  ]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0f19] select-none">
      {/* Three.js 3D Viewport (Full Bleed) */}
      <VillaCanvas
        activePreset={activePreset}
        timeHours={timeHours}
        isSprinklerActive={isSprinklerActive}
        isPartyActive={isPartyActive}
        interiorLightsOn={interiorLightsOn}
        poolLightsOn={poolLightsOn}
      />

      {/* 3-Zone Clean Top Navigation & Telemetry Strip */}
      <TopBar
        solarKw={solarTelemetry.solarGenerationKw}
        batterySoc={solarTelemetry.batterySocPercent}
        isSprinklerActive={isSprinklerActive}
        timeHours={timeHours}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onSelectNavPreset={handleSelectPreset}
      />

      {/* Floating Collapsible Bottom Control Dock */}
      <ControlDock
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        zones={zones}
        isSprinklerActive={isSprinklerActive}
        autoIrrigationEnabled={autoIrrigationEnabled}
        onToggleSprinklers={handleToggleSprinklers}
        onToggleAutoIrrigation={handleToggleAutoIrrigation}
        solarTelemetry={solarTelemetry}
        timeHours={timeHours}
        onChangeTimeHours={setTimeHours}
        interiorLightsOn={interiorLightsOn}
        poolLightsOn={poolLightsOn}
        isPartyActive={isPartyActive}
        onToggleInteriorLights={handleToggleInteriorLights}
        onTogglePoolLights={handleTogglePoolLights}
        onToggleParty={handleToggleParty}
      />
    </div>
  );
}

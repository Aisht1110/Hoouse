/**
 * Pure estate logic and mathematical models for Solaris Villa:
 * - High-efficiency photovoltaic solar generation & battery telemetry
 * - Smart multi-zone irrigation flow & soil moisture physics
 * - Sun lighting & chromatic calculations
 */

export interface IrrigationZone {
  id: string;
  name: string;
  moisturePercent: number; // 0 - 100%
  targetMoisturePercent: number; // optimal target e.g. 65%
  areaSqMeters: number;
  flowRateLitersPerMin: number;
  active: boolean;
}

export interface SolarTelemetry {
  sunElevationDeg: number;
  solarGenerationKw: number;
  peakCapacityKw: number;
  houseLoadKw: number;
  batterySocPercent: number; // 0 - 100%
  netGridKw: number; // positive = exporting to grid, negative = importing
  dailyEnergyGeneratedKwh: number;
  co2OffsetKg: number;
  dailySavingsUsd: number;
}

export interface LightingEnvironment {
  timeHours: number; // 0 - 24
  sunPosition: [number, number, number];
  sunIntensity: number;
  sunColor: string; // hex
  ambientColor: string; // hex
  ambientIntensity: number;
  skyColor: string;
  fogColor: string;
  isNight: boolean;
}

/**
 * Calculates solar photovoltaic generation (kW)
 * Standard test conditions: 18.5 kWp system with 22.4% cell efficiency
 */
export function calculateSolarPower(
  timeHours: number,
  systemCapacityKw = 18.5,
  tiltDegrees = 30
): { powerKw: number; elevationDeg: number } {
  // Sunrise at 6.0, Solar Noon at 13.0, Sunset at 19.5
  if (timeHours < 6.0 || timeHours > 19.5) {
    return { powerKw: 0, elevationDeg: -10 };
  }

  // Solar angle normalized to [-1, 1] between sunrise and sunset
  const dayProgress = (timeHours - 6.0) / (19.5 - 6.0); // 0 at dawn, 1 at dusk
  const sunElevationRad = Math.sin(dayProgress * Math.PI);
  const elevationDeg = Math.max(0, sunElevationRad * 75);

  // Optical tilt factor (panels angled at tiltDegrees towards south)
  const tiltFactor = Math.cos(((elevationDeg - (90 - tiltDegrees)) * Math.PI) / 180);
  const efficiencyModifier = Math.max(0, tiltFactor * 0.95);

  const rawKw = systemCapacityKw * sunElevationRad * efficiencyModifier;
  const powerKw = Math.round(Math.max(0, rawKw) * 100) / 100;

  return { powerKw, elevationDeg };
}

/**
 * Calculates dynamic house power consumption based on active appliances
 */
export function calculateHouseLoad(options: {
  baseLoadKw?: number;
  interiorLightsOn?: boolean;
  poolHeaterPumpOn?: boolean;
  partyGrillLightsOn?: boolean;
  gymActive?: boolean;
  irrigationPumpsActive?: boolean;
  activeSprinklerCount?: number;
}): number {
  const {
    baseLoadKw = 1.4, // baseline smart home, servers, refrigeration
    interiorLightsOn = true,
    poolHeaterPumpOn = true,
    partyGrillLightsOn = false,
    gymActive = false,
    irrigationPumpsActive = false,
    activeSprinklerCount = 0,
  } = options;

  let totalKw = baseLoadKw;
  if (interiorLightsOn) totalKw += 0.85;
  if (poolHeaterPumpOn) totalKw += 2.2;
  if (partyGrillLightsOn) totalKw += 1.8;
  if (gymActive) totalKw += 1.6;
  if (irrigationPumpsActive && activeSprinklerCount > 0) {
    totalKw += 0.45 * activeSprinklerCount;
  }

  return Math.round(totalKw * 100) / 100;
}

/**
 * Simulates battery charge / discharge over time step dt (in minutes)
 */
export function updateBatteryStorage(
  currentSocPercent: number,
  solarKw: number,
  loadKw: number,
  capacityKwh = 30.0,
  dtMinutes = 1.0
): { newSocPercent: number; netGridKw: number } {
  const deltaPowerKw = solarKw - loadKw;
  const energyKwhDelta = (deltaPowerKw * (dtMinutes / 60)) * 0.94; // 94% round-trip efficiency

  const currentEnergyKwh = (currentSocPercent / 100) * capacityKwh;
  let newEnergyKwh = currentEnergyKwh + energyKwhDelta;
  let netGridKw = 0;

  if (newEnergyKwh > capacityKwh) {
    // Battery full, export excess to grid
    const excessKwh = newEnergyKwh - capacityKwh;
    netGridKw = (excessKwh / (dtMinutes / 60));
    newEnergyKwh = capacityKwh;
  } else if (newEnergyKwh < 0) {
    // Battery empty, import deficit from grid
    const deficitKwh = -newEnergyKwh;
    netGridKw = -(deficitKwh / (dtMinutes / 60));
    newEnergyKwh = 0;
  }

  const newSocPercent = Math.min(100, Math.max(0, Math.round((newEnergyKwh / capacityKwh) * 1000) / 10));
  return { newSocPercent, netGridKw: Math.round(netGridKw * 100) / 100 };
}

/**
 * Updates soil moisture for an irrigation zone
 */
export function updateZoneMoisture(
  zone: IrrigationZone,
  ambientTempC = 26,
  isSprinklerActive = false,
  dtMinutes = 1.0
): number {
  let moisture = zone.moisturePercent;

  if (isSprinklerActive) {
    // Sprinkler applies water: rate proportional to flow rate / area
    const absorptionRate = (zone.flowRateLitersPerMin / zone.areaSqMeters) * 1.8 * dtMinutes;
    moisture = Math.min(100, moisture + absorptionRate);
  } else {
    // Natural evaporation based on temperature
    const evaporationRate = (0.04 + (ambientTempC / 100) * 0.05) * dtMinutes;
    moisture = Math.max(10, moisture - evaporationRate);
  }

  return Math.round(moisture * 10) / 10;
}

/**
 * Computes 3D sun coordinates and lighting colors for time of day (0 - 24 hours)
 */
export function getLightingEnvironment(timeHours: number): LightingEnvironment {
  // Normalize time 0-24
  const hour = ((timeHours % 24) + 24) % 24;

  // Day progress angle: 12.0 = Noon (highest sun), 0.0 = Midnight
  const angle = ((hour - 6.0) / 12.0) * Math.PI; // 0 at 6AM, PI/2 at 12PM, PI at 6PM

  const sunDistance = 90;
  const x = Math.cos(angle) * sunDistance;
  const y = Math.sin(angle) * sunDistance;
  const z = 45; // slight angle towards front facade

  const isNight = hour < 5.8 || hour > 19.5;
  const isGoldenHour = (hour >= 6.0 && hour <= 7.5) || (hour >= 17.5 && hour <= 19.3);

  let sunColor = '#fff5e6';
  let sunIntensity = 1.6;
  let ambientColor = '#c7d2fe';
  let ambientIntensity = 0.6;
  let skyColor = '#38bdf8';
  let fogColor = '#94a3b8';

  if (isNight) {
    sunIntensity = 0.08;
    sunColor = '#3b82f6';
    ambientColor = '#1e1b4b';
    ambientIntensity = 0.25;
    skyColor = '#050814';
    fogColor = '#0b0f1a';
  } else if (isGoldenHour) {
    // Warm golden sunset
    sunIntensity = 1.9;
    sunColor = '#f97316';
    ambientColor = '#fed7aa';
    ambientIntensity = 0.7;
    skyColor = '#f59e0b';
    fogColor = '#fb923c';
  } else {
    // Bright midday
    sunIntensity = 2.2;
    sunColor = '#ffffff';
    ambientColor = '#dbeafe';
    ambientIntensity = 0.75;
    skyColor = '#38bdf8';
    fogColor = '#bae6fd';
  }

  return {
    timeHours: hour,
    sunPosition: [x, Math.max(-10, y), z],
    sunIntensity,
    sunColor,
    ambientColor,
    ambientIntensity,
    skyColor,
    fogColor,
    isNight,
  };
}

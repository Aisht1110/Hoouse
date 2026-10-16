import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSolarPower,
  calculateHouseLoad,
  updateBatteryStorage,
  updateZoneMoisture,
  getLightingEnvironment,
  type IrrigationZone,
} from './estateLogic.ts';

test('calculateSolarPower returns 0 kW at night and peak near noon', () => {
  const night = calculateSolarPower(2.0);
  assert.equal(night.powerKw, 0);

  const midday = calculateSolarPower(13.0);
  assert.ok(midday.powerKw > 12, `Expected > 12kW at noon, got ${midday.powerKw}`);
  assert.ok(midday.elevationDeg > 60);

  const sunset = calculateSolarPower(21.0);
  assert.equal(sunset.powerKw, 0);
});

test('calculateHouseLoad scales with active luxury systems', () => {
  const baseLoad = calculateHouseLoad({
    interiorLightsOn: false,
    poolHeaterPumpOn: false,
    partyGrillLightsOn: false,
    gymActive: false,
    irrigationPumpsActive: false,
    activeSprinklerCount: 0,
  });
  assert.equal(baseLoad, 1.4);

  const fullLoad = calculateHouseLoad({
    interiorLightsOn: true,
    poolHeaterPumpOn: true,
    partyGrillLightsOn: true,
    gymActive: true,
    irrigationPumpsActive: true,
    activeSprinklerCount: 4,
  });
  assert.ok(fullLoad > 7.0, `Expected full load > 7kW, got ${fullLoad}`);
});

test('updateBatteryStorage charges with surplus and discharges with deficit', () => {
  // Solar surplus (15kW solar vs 3kW load) -> charges battery
  const charged = updateBatteryStorage(50, 15, 3, 30, 10);
  assert.ok(charged.newSocPercent > 50, 'Battery should gain charge');

  // Load deficit (0kW solar vs 5kW load) -> discharges battery
  const discharged = updateBatteryStorage(50, 0, 5, 30, 10);
  assert.ok(discharged.newSocPercent < 50, 'Battery should lose charge');
});

test('updateZoneMoisture replenishes with sprinklers and evaporates without', () => {
  const zone: IrrigationZone = {
    id: 'zone-1',
    name: 'Front Lawn',
    moisturePercent: 40,
    targetMoisturePercent: 65,
    areaSqMeters: 100,
    flowRateLitersPerMin: 25,
    active: true,
  };

  const watered = updateZoneMoisture(zone, 25, true, 5);
  assert.ok(watered > 40, 'Active sprinkler should increase moisture');

  const evaporated = updateZoneMoisture(zone, 30, false, 10);
  assert.ok(evaporated < 40, 'Dry heat should cause evaporation');
});

test('getLightingEnvironment generates correct day/night settings', () => {
  const noon = getLightingEnvironment(13.0);
  assert.equal(noon.isNight, false);
  assert.ok(noon.sunIntensity > 1.5);

  const midnight = getLightingEnvironment(0.0);
  assert.equal(midnight.isNight, true);
  assert.ok(midnight.sunIntensity < 0.2);

  const sunset = getLightingEnvironment(18.5);
  assert.equal(sunset.isNight, false);
  assert.ok(sunset.sunColor.startsWith('#f')); // Orange-gold tone
});

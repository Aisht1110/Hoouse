import * as THREE from 'three';
import {
  createHerringboneDeckTexture,
  createSolarCellTexture,
  createWoodSlatTexture,
  createConcretePavingTexture,
  createLawnTexture,
} from './proceduralTextures.ts';

export interface EstateMaterials {
  whiteStucco: THREE.MeshStandardMaterial;
  charcoalSteel: THREE.MeshStandardMaterial;
  architecturalGlass: THREE.MeshPhysicalMaterial;
  herringboneDeck: THREE.MeshStandardMaterial;
  woodSlatCeiling: THREE.MeshStandardMaterial;
  solarPanel: THREE.MeshPhysicalMaterial;
  solarFrame: THREE.MeshStandardMaterial;
  poolWater: THREE.MeshPhysicalMaterial;
  poolInterior: THREE.MeshStandardMaterial;
  concretePaving: THREE.MeshStandardMaterial;
  lawn: THREE.MeshStandardMaterial;
  hedgeFoliage: THREE.MeshStandardMaterial;
  barkWood: THREE.MeshStandardMaterial;
  warmStripLight: THREE.MeshBasicMaterial;
  submergedPoolLight: THREE.MeshBasicMaterial;
  carPaint: THREE.MeshPhysicalMaterial;
  carWheelRubber: THREE.MeshStandardMaterial;
  carWheelChrome: THREE.MeshStandardMaterial;
  gymMetal: THREE.MeshStandardMaterial;
  bbqMetal: THREE.MeshStandardMaterial;
  stoneCountertop: THREE.MeshStandardMaterial;
  interiorWoodFloor: THREE.MeshStandardMaterial;
}

export function createEstateMaterials(): EstateMaterials {
  const herringboneTex = createHerringboneDeckTexture();
  const solarCellTex = createSolarCellTexture();
  const woodSlatTex = createWoodSlatTexture();
  const concreteTex = createConcretePavingTexture();
  const lawnTex = createLawnTexture();

  // White architectural stucco / slab fascia
  const whiteStucco = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6,
    roughness: 0.88,
    metalness: 0.05,
  });

  // Dark graphite / charcoal panels & structural frames
  const charcoalSteel = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    roughness: 0.35,
    metalness: 0.75,
  });

  // Architectural glass with reflections & transmission
  const architecturalGlass = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transmission: 0.9,
    opacity: 0.35,
    transparent: true,
    roughness: 0.05,
    ior: 1.52,
    thickness: 0.5,
    depthWrite: false,
  });

  // Angled herringbone teak pool sun deck
  const herringboneDeck = new THREE.MeshStandardMaterial({
    map: herringboneTex,
    roughness: 0.55,
    metalness: 0.08,
  });

  // Cantilever underside wood slats
  const woodSlatCeiling = new THREE.MeshStandardMaterial({
    map: woodSlatTex,
    roughness: 0.45,
    metalness: 0.1,
  });

  // High-efficiency monocrystalline solar panels
  const solarPanel = new THREE.MeshPhysicalMaterial({
    map: solarCellTex,
    color: 0x0f2038,
    roughness: 0.12,
    metalness: 0.88,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });

  const solarFrame = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.8,
  });

  // Translucent sparkling pool water
  const poolWater = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    transmission: 0.75,
    roughness: 0.08,
    ior: 1.333,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  });

  // Pool interior ceramic mosaic
  const poolInterior = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.2,
    metalness: 0.15,
  });

  // Driveway and courtyard concrete slabs
  const concretePaving = new THREE.MeshStandardMaterial({
    map: concreteTex,
    roughness: 0.8,
    metalness: 0.1,
  });

  // Garden lawn
  const lawn = new THREE.MeshStandardMaterial({
    map: lawnTex,
    roughness: 0.95,
    metalness: 0.02,
  });

  // Boundary hedge and top terrace planter foliage
  const hedgeFoliage = new THREE.MeshStandardMaterial({
    color: 0x1b4317,
    roughness: 0.85,
    metalness: 0.04,
  });

  const barkWood = new THREE.MeshStandardMaterial({
    color: 0x3e2714,
    roughness: 0.9,
    metalness: 0.05,
  });

  // Linear warm architectural LED strip lights (ceiling, pool edge, steps)
  const warmStripLight = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
  });

  // Submerged underwater LED glow
  const submergedPoolLight = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
  });

  // Luxury sports car metallic electric blue lacquer
  const carPaint = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    metalness: 0.92,
    roughness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
  });

  const carWheelRubber = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.9,
    metalness: 0.1,
  });

  const carWheelChrome = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.1,
    metalness: 0.95,
  });

  // Rooftop Gym & BBQ equipment metals
  const gymMetal = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.25,
    metalness: 0.85,
  });

  const bbqMetal = new THREE.MeshStandardMaterial({
    color: 0x3f3f46,
    roughness: 0.3,
    metalness: 0.9,
  });

  const stoneCountertop = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.4,
    metalness: 0.2,
  });

  const interiorWoodFloor = new THREE.MeshStandardMaterial({
    color: 0xa16207,
    roughness: 0.4,
    metalness: 0.05,
  });

  return {
    whiteStucco,
    charcoalSteel,
    architecturalGlass,
    herringboneDeck,
    woodSlatCeiling,
    solarPanel,
    solarFrame,
    poolWater,
    poolInterior,
    concretePaving,
    lawn,
    hedgeFoliage,
    barkWood,
    warmStripLight,
    submergedPoolLight,
    carPaint,
    carWheelRubber,
    carWheelChrome,
    gymMetal,
    bbqMetal,
    stoneCountertop,
    interiorWoodFloor,
  };
}

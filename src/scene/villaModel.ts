import * as THREE from 'three';
import { EstateMaterials } from './materials.ts';
import { createSprinklerParticles, createGrillSmokeParticles } from './particles.ts';

export interface VillaEstateScene {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  sprinklers: ReturnType<typeof createSprinklerParticles>;
  grillSmoke: ReturnType<typeof createGrillSmokeParticles>;
  interiorLights: THREE.PointLight[];
  exteriorWarmLights: THREE.PointLight[];
  poolLights: THREE.PointLight[];
  partyLights: THREE.PointLight[];
  solarPanelsGroup: THREE.Group;
  updateAnimation: (elapsed: number, delta: number, isSprinklerOn: boolean, isPartyOn: boolean) => void;
}

export function buildVillaEstate(materials: EstateMaterials): VillaEstateScene {
  const root = new THREE.Group();
  root.name = 'SolarisEstateRoot';

  const interiorLights: THREE.PointLight[] = [];
  const exteriorWarmLights: THREE.PointLight[] = [];
  const poolLights: THREE.PointLight[] = [];
  const partyLights: THREE.PointLight[] = [];

  // ==========================================
  // 1. TERRAIN & GROUND GROUNDS
  // ==========================================
  const groundGroup = new THREE.Group();
  groundGroup.name = 'GroundAndSurfaces';

  // Base property ground plate
  const groundGeo = new THREE.PlaneGeometry(90, 80);
  const groundMesh = new THREE.Mesh(groundGeo, materials.lawn);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.set(0, -0.05, 5);
  groundMesh.receiveShadow = true;
  groundGroup.add(groundMesh);

  // Concrete Paved Entrance Driveway & Apron (towards garage at back)
  const drivewayGeo = new THREE.PlaneGeometry(16, 50);
  const drivewayMesh = new THREE.Mesh(drivewayGeo, materials.concretePaving);
  drivewayMesh.rotation.x = -Math.PI / 2;
  drivewayMesh.position.set(15, -0.02, -10);
  drivewayMesh.receiveShadow = true;
  groundGroup.add(drivewayMesh);

  // Front courtyard walkway connecting entrance to villa and pool deck
  const walkwayGeo = new THREE.PlaneGeometry(8, 24);
  const walkwayMesh = new THREE.Mesh(walkwayGeo, materials.concretePaving);
  walkwayMesh.rotation.x = -Math.PI / 2;
  walkwayMesh.position.set(0, -0.01, 14);
  walkwayMesh.receiveShadow = true;
  groundGroup.add(walkwayMesh);

  root.add(groundGroup);

  // ==========================================
  // 2. INFINITY POOL & HERRINGBONE SUN DECK (matching image.png)
  // ==========================================
  const poolGroup = new THREE.Group();
  poolGroup.name = 'PoolAndSunDeck';

  // Pool Basin (Water body: ~11m x 6m x 1.6m deep)
  const poolWidth = 11;
  const poolLength = 7.5;
  const poolDepth = 1.4;

  const poolBasinGeo = new THREE.BoxGeometry(poolWidth + 0.6, poolDepth, poolLength + 0.6);
  const poolBasinMesh = new THREE.Mesh(poolBasinGeo, materials.poolInterior);
  poolBasinMesh.position.set(-2, -poolDepth / 2, 7.5);
  poolBasinMesh.receiveShadow = true;
  poolGroup.add(poolBasinMesh);

  // Water Surface with sine wave displacement
  const waterGeo = new THREE.PlaneGeometry(poolWidth, poolLength, 32, 32);
  const waterMesh = new THREE.Mesh(waterGeo, materials.poolWater);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(-2, -0.08, 7.5);
  poolGroup.add(waterMesh);

  // Underwater LED Pool Lights
  const pLight1 = new THREE.PointLight(0x38bdf8, 3.5, 9, 2);
  pLight1.position.set(-5, -0.5, 6);
  poolGroup.add(pLight1);
  poolLights.push(pLight1);

  const pLight2 = new THREE.PointLight(0x38bdf8, 3.5, 9, 2);
  pLight2.position.set(0, -0.5, 9);
  poolGroup.add(pLight2);
  poolLights.push(pLight2);

  // Submerged light fixture lenses
  const lensGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 12);
  const lens1 = new THREE.Mesh(lensGeo, materials.submergedPoolLight);
  lens1.rotation.x = Math.PI / 2;
  lens1.position.set(-5, -0.5, 3.8);
  poolGroup.add(lens1);
  const lens2 = lens1.clone();
  lens2.position.set(0, -0.5, 3.8);
  poolGroup.add(lens2);

  // The distinctive Herringbone Sun Deck (extending diagonally into pool edge)
  // Custom angled shape matching photo
  const deckShape = new THREE.Shape();
  deckShape.moveTo(0, 0);
  deckShape.lineTo(7, 0);
  deckShape.lineTo(7, 8.5);
  deckShape.lineTo(2.2, 8.5);
  deckShape.lineTo(-1.5, 4.2); // angled cut into pool water
  deckShape.lineTo(0, 0);

  const deckExtrudeSettings = {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  };
  const deckGeo = new THREE.ExtrudeGeometry(deckShape, deckExtrudeSettings);
  const deckMesh = new THREE.Mesh(deckGeo, materials.herringboneDeck);
  deckMesh.rotation.x = Math.PI / 2;
  deckMesh.position.set(0.5, 0.08, 3.5);
  deckMesh.receiveShadow = true;
  deckMesh.castShadow = true;
  poolGroup.add(deckMesh);

  // Dual modern curved sun loungers on deck (matching photo)
  const createLounger = (x: number, z: number, rotY: number) => {
    const lounger = new THREE.Group();
    // Base rattan/weave frame
    const baseGeo = new THREE.BoxGeometry(1.3, 0.28, 2.1);
    const baseMesh = new THREE.Mesh(baseGeo, materials.charcoalSteel);
    baseMesh.position.y = 0.14;
    baseMesh.castShadow = true;
    lounger.add(baseMesh);

    // Thick ergonomic gray cushion
    const cushionGeo = new THREE.BoxGeometry(1.2, 0.12, 1.4);
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
    const cushionMesh = new THREE.Mesh(cushionGeo, cushionMat);
    cushionMesh.position.set(0, 0.32, -0.2);
    cushionMesh.castShadow = true;
    lounger.add(cushionMesh);

    // Angled backrest
    const backrestGeo = new THREE.BoxGeometry(1.2, 0.12, 0.7);
    const backrestMesh = new THREE.Mesh(backrestGeo, cushionMat);
    backrestMesh.position.set(0, 0.48, 0.7);
    backrestMesh.rotation.x = -Math.PI / 6;
    backrestMesh.castShadow = true;
    lounger.add(backrestMesh);

    // Stainless steel legs
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8);
    const legMat = materials.solarFrame;
    [[-0.55, -0.9], [0.55, -0.9], [-0.55, 0.9], [0.55, 0.9]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(lx, 0.075, lz);
      lounger.add(leg);
    });

    lounger.position.set(x, 0.18, z);
    lounger.rotation.y = rotY;
    return lounger;
  };

  poolGroup.add(createLounger(4.2, 8.8, -Math.PI / 14));
  poolGroup.add(createLounger(5.8, 9.4, -Math.PI / 16));

  root.add(poolGroup);

  // ==========================================
  // 3. MAIN 2-STORY VILLA STRUCTURE (matching image.png)
  // ==========================================
  const villaGroup = new THREE.Group();
  villaGroup.name = 'MainVillaStructure';

  // --- Ground Floor Podium & Living Hall ---
  // White foundation floor slab
  const gndFloorSlabGeo = new THREE.BoxGeometry(22, 0.3, 16);
  const gndFloorSlab = new THREE.Mesh(gndFloorSlabGeo, materials.whiteStucco);
  gndFloorSlab.position.set(-1, 0.15, -4);
  gndFloorSlab.receiveShadow = true;
  villaGroup.add(gndFloorSlab);

  // Interior parquet floor
  const floorInGeo = new THREE.PlaneGeometry(14, 12);
  const floorInMesh = new THREE.Mesh(floorInGeo, materials.interiorWoodFloor);
  floorInMesh.rotation.x = -Math.PI / 2;
  floorInMesh.position.set(-1, 0.31, -4);
  floorInMesh.receiveShadow = true;
  villaGroup.add(floorInMesh);

  // Rear and side solid structural walls
  const backWallGeo = new THREE.BoxGeometry(20, 7.2, 0.4);
  const backWall = new THREE.Mesh(backWallGeo, materials.whiteStucco);
  backWall.position.set(-1, 3.6, -11.8);
  backWall.castShadow = true;
  backWall.receiveShadow = true;
  villaGroup.add(backWall);

  const leftWallGeo = new THREE.BoxGeometry(0.4, 7.2, 14);
  const leftWall = new THREE.Mesh(leftWallGeo, materials.whiteStucco);
  leftWall.position.set(-10.8, 3.6, -4.8);
  leftWall.castShadow = true;
  villaGroup.add(leftWall);

  // Front Floor-to-Ceiling Glass Curtain Walls (Ground floor, height 3.4m)
  const glassPanelGeo = new THREE.BoxGeometry(4.2, 3.3, 0.08);
  const glassFront1 = new THREE.Mesh(glassPanelGeo, materials.architecturalGlass);
  glassFront1.position.set(-5.5, 1.8, 2.2);
  villaGroup.add(glassFront1);

  const glassFront2 = new THREE.Mesh(glassPanelGeo, materials.architecturalGlass);
  glassFront2.position.set(2.5, 1.8, 2.2);
  villaGroup.add(glassFront2);

  // Dark vertical accent wall between glass sections (matching photo)
  const accentWallGeo = new THREE.BoxGeometry(3.6, 3.4, 0.4);
  const accentWall = new THREE.Mesh(accentWallGeo, materials.charcoalSteel);
  accentWall.position.set(-1.5, 1.85, 2.2);
  accentWall.castShadow = true;
  villaGroup.add(accentWall);

  // Modern exterior wall sconces on the dark accent wall (matching photo: 3 pairs of up/down sconces)
  const sconceGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.16, 8);
  const sconceMat = materials.charcoalSteel;
  [-1.0, 0, 1.0].forEach((ox) => {
    const sconce = new THREE.Mesh(sconceGeo, sconceMat);
    sconce.position.set(-1.5 + ox, 2.0, 2.45);
    villaGroup.add(sconce);

    const sLight = new THREE.PointLight(0xfde047, 0.9, 3.2, 2);
    sLight.position.set(-1.5 + ox, 2.0, 2.6);
    villaGroup.add(sLight);
    exteriorWarmLights.push(sLight);
  });

  // Black aluminum mullions / framing
  const mullionMat = materials.charcoalSteel;
  [-7.6, -3.4, 0.3, 4.6].forEach((mx) => {
    const mGeo = new THREE.BoxGeometry(0.08, 3.4, 0.12);
    const mullion = new THREE.Mesh(mGeo, mullionMat);
    mullion.position.set(mx, 1.85, 2.2);
    mullion.castShadow = true;
    villaGroup.add(mullion);
  });

  // Horizontal mid-transom frame
  const transomGeo = new THREE.BoxGeometry(16, 0.08, 0.14);
  const transom = new THREE.Mesh(transomGeo, mullionMat);
  transom.position.set(-1.5, 3.5, 2.2);
  villaGroup.add(transom);

  // --- Ground Floor Interior Furnishings (Visible through glass) ---
  // Luxury L-shaped designer sofa
  const sofaGroup = new THREE.Group();
  const sofaBaseGeo = new THREE.BoxGeometry(3.6, 0.35, 1.4);
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
  const sofaBase = new THREE.Mesh(sofaBaseGeo, sofaMat);
  sofaBase.position.set(0, 0.45, 0);
  sofaBase.castShadow = true;
  sofaGroup.add(sofaBase);

  const sofaLGeo = new THREE.BoxGeometry(1.4, 0.35, 1.8);
  const sofaL = new THREE.Mesh(sofaLGeo, sofaMat);
  sofaL.position.set(-1.1, 0.45, 1.2);
  sofaGroup.add(sofaL);

  const sofaBackGeo = new THREE.BoxGeometry(3.6, 0.45, 0.25);
  const sofaBack = new THREE.Mesh(sofaBackGeo, sofaMat);
  sofaBack.position.set(0, 0.8, -0.6);
  sofaGroup.add(sofaBack);

  // Modern marble coffee table
  const tableTopGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.08, 24);
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1 });
  const tableTop = new THREE.Mesh(tableTopGeo, marbleMat);
  tableTop.position.set(0.3, 0.5, 0.9);
  tableTop.castShadow = true;
  sofaGroup.add(tableTop);

  sofaGroup.position.set(-4.5, 0, -2);
  villaGroup.add(sofaGroup);

  // Architectural floating staircase
  const stairGroup = new THREE.Group();
  const treadGeo = new THREE.BoxGeometry(1.6, 0.1, 0.35);
  for (let s = 0; s < 12; s++) {
    const tread = new THREE.Mesh(treadGeo, materials.woodSlatCeiling);
    tread.position.set(0, 0.4 + s * 0.28, -s * 0.35);
    tread.castShadow = true;
    stairGroup.add(tread);
  }
  // Glass stair balustrade
  const stairGlassGeo = new THREE.BoxGeometry(0.06, 2.8, 4.4);
  const stairGlass = new THREE.Mesh(stairGlassGeo, materials.architecturalGlass);
  stairGlass.position.set(0.85, 2.0, -2.0);
  stairGroup.add(stairGlass);
  stairGroup.position.set(2.5, 0, -5);
  villaGroup.add(stairGroup);

  // Interior warm living room chandelier light
  const livingLight = new THREE.PointLight(0xfef08a, 2.8, 14, 2);
  livingLight.position.set(-2, 3.0, -3.5);
  villaGroup.add(livingLight);
  interiorLights.push(livingLight);

  // --- 2nd Floor (Master Bedroom Suite) & The Deep Cantilever ---
  // The iconic Cantilevered Slab extending forward over the terrace/pool
  const cantileverGeo = new THREE.BoxGeometry(16, 0.4, 11);
  const cantileverSlab = new THREE.Mesh(cantileverGeo, materials.whiteStucco);
  cantileverSlab.position.set(-2.5, 3.8, 0.5);
  cantileverSlab.castShadow = true;
  cantileverSlab.receiveShadow = true;
  villaGroup.add(cantileverSlab);

  // Under-cantilever ceiling finished in warm horizontal teak wood slats
  const slatCeilGeo = new THREE.PlaneGeometry(15.6, 10.6);
  const slatCeil = new THREE.Mesh(slatCeilGeo, materials.woodSlatCeiling);
  slatCeil.rotation.x = Math.PI / 2;
  slatCeil.position.set(-2.5, 3.58, 0.5);
  villaGroup.add(slatCeil);

  // Recessed warm linear LED strip lights on under-cantilever ceiling (matching photo!)
  const stripGeo = new THREE.BoxGeometry(4.2, 0.04, 0.08);
  [-2.0, 0, 2.0].forEach((sz) => {
    const strip = new THREE.Mesh(stripGeo, materials.warmStripLight);
    strip.position.set(-4.5, 3.57, sz);
    villaGroup.add(strip);

    const stripLight = new THREE.PointLight(0xfde047, 1.4, 6, 2);
    stripLight.position.set(-4.5, 3.4, sz);
    villaGroup.add(stripLight);
    exteriorWarmLights.push(stripLight);
  });

  // Black structural diagonal V-support beam columns (matching the photo's left structural support!)
  const beamMat = materials.charcoalSteel;
  const beamGeo = new THREE.BoxGeometry(0.35, 3.8, 0.35);

  const diagBeam1 = new THREE.Mesh(beamGeo, beamMat);
  diagBeam1.position.set(-9.2, 1.85, 3.8);
  diagBeam1.rotation.z = Math.PI / 10;
  diagBeam1.rotation.x = -Math.PI / 16;
  diagBeam1.castShadow = true;
  villaGroup.add(diagBeam1);

  const diagBeam2 = new THREE.Mesh(beamGeo, beamMat);
  diagBeam2.position.set(-7.6, 1.85, 3.8);
  diagBeam2.rotation.z = -Math.PI / 10;
  diagBeam2.rotation.x = -Math.PI / 16;
  diagBeam2.castShadow = true;
  villaGroup.add(diagBeam2);

  // 2nd Floor Walls & Master Bedroom Suite Glass Walls
  const secondFloorGlassGeo = new THREE.BoxGeometry(9.6, 3.1, 0.08);
  const secondFloorGlass = new THREE.Mesh(secondFloorGlassGeo, materials.architecturalGlass);
  secondFloorGlass.position.set(0, 5.55, 3.8);
  villaGroup.add(secondFloorGlass);

  const secondFloorSideGlassGeo = new THREE.BoxGeometry(0.08, 3.1, 8.5);
  const secondFloorSideGlass = new THREE.Mesh(secondFloorSideGlassGeo, materials.architecturalGlass);
  secondFloorSideGlass.position.set(4.8, 5.55, -0.4);
  villaGroup.add(secondFloorSideGlass);

  // 2nd Floor Black Fascia & Window Framing
  const topFasciaGeo = new THREE.BoxGeometry(10.2, 0.35, 9.2);
  const topFascia = new THREE.Mesh(topFasciaGeo, materials.charcoalSteel);
  topFascia.position.set(0.1, 7.25, -0.4);
  topFascia.castShadow = true;
  villaGroup.add(topFascia);

  // Planter Box & Green Hedge running along the 2nd Floor Balcony/Roof (matching photo!)
  const planterGeo = new THREE.BoxGeometry(7.2, 0.45, 0.6);
  const planterMesh = new THREE.Mesh(planterGeo, materials.charcoalSteel);
  planterMesh.position.set(-6.2, 4.25, 4.8);
  planterMesh.castShadow = true;
  villaGroup.add(planterMesh);

  // Lush hedge foliage on top of planter
  const hedgeGeo = new THREE.BoxGeometry(7.0, 0.7, 0.5);
  const hedgeMesh = new THREE.Mesh(hedgeGeo, materials.hedgeFoliage);
  hedgeMesh.position.set(-6.2, 4.8, 4.8);
  hedgeMesh.castShadow = true;
  villaGroup.add(hedgeMesh);

  // Master Bedroom Interior: King Bed, Nightstands, Headboard Lighting
  const bedGroup = new THREE.Group();
  const mattressGeo = new THREE.BoxGeometry(2.4, 0.5, 2.6);
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
  const mattress = new THREE.Mesh(mattressGeo, mattressMat);
  mattress.position.set(0, 4.3, -4);
  mattress.castShadow = true;
  bedGroup.add(mattress);

  // Luxury tufted wood headboard
  const headboardGeo = new THREE.BoxGeometry(3.6, 1.4, 0.2);
  const headboard = new THREE.Mesh(headboardGeo, materials.woodSlatCeiling);
  headboard.position.set(0, 4.8, -5.3);
  headboard.castShadow = true;
  bedGroup.add(headboard);

  // Warm LED Headboard backlighting
  const headboardLight = new THREE.PointLight(0xfde047, 2.0, 7, 2);
  headboardLight.position.set(0, 5.0, -5.0);
  bedGroup.add(headboardLight);
  interiorLights.push(headboardLight);

  // Master suite nightstands
  const nightstandGeo = new THREE.BoxGeometry(0.6, 0.45, 0.5);
  const ns1 = new THREE.Mesh(nightstandGeo, materials.charcoalSteel);
  ns1.position.set(-1.6, 4.25, -4.8);
  bedGroup.add(ns1);
  const ns2 = ns1.clone();
  ns2.position.set(1.6, 4.25, -4.8);
  bedGroup.add(ns2);

  villaGroup.add(bedGroup);

  root.add(villaGroup);

  // ==========================================
  // 4. TOP FLOOR: ROOFTOP PANORAMIC GYM & SOLAR ARRAY
  // ==========================================
  const topRooftopGroup = new THREE.Group();
  topRooftopGroup.name = 'RooftopGymAndSolar';

  // Rooftop concrete floor deck
  const roofDeckGeo = new THREE.BoxGeometry(22, 0.35, 16);
  const roofDeck = new THREE.Mesh(roofDeckGeo, materials.whiteStucco);
  roofDeck.position.set(-1, 7.5, -4);
  roofDeck.receiveShadow = true;
  roofDeck.castShadow = true;
  topRooftopGroup.add(roofDeck);

  // Safety glass perimeter railing around rooftop terrace
  const glassRailGeo = new THREE.BoxGeometry(21.6, 1.1, 0.06);
  const glassRailFront = new THREE.Mesh(glassRailGeo, materials.architecturalGlass);
  glassRailFront.position.set(-1, 8.2, 3.8);
  topRooftopGroup.add(glassRailFront);

  const glassRailSide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 15.6), materials.architecturalGlass);
  glassRailSide.position.set(9.8, 8.2, -4);
  topRooftopGroup.add(glassRailSide);

  // --- Rooftop Glass Cube Gym (Right side of roof) ---
  const gymGroup = new THREE.Group();
  gymGroup.name = 'RooftopGym';

  // Glass walls of gym
  const gymGlassGeo = new THREE.BoxGeometry(7.5, 3.0, 7.5);
  const gymWalls = new THREE.Mesh(gymGlassGeo, materials.architecturalGlass);
  gymWalls.position.set(4.5, 9.15, -3.5);
  gymGroup.add(gymWalls);

  // Gym dark structural frame
  const gymRoofGeo = new THREE.BoxGeometry(8.0, 0.25, 8.0);
  const gymRoof = new THREE.Mesh(gymRoofGeo, materials.charcoalSteel);
  gymRoof.position.set(4.5, 10.75, -3.5);
  gymRoof.castShadow = true;
  gymGroup.add(gymRoof);

  // Gym Equipment:
  // 1. Motorized running treadmill (frame, belt, console display, handles)
  const treadmill = new THREE.Group();
  const tmBaseGeo = new THREE.BoxGeometry(1.0, 0.18, 2.2);
  const tmBase = new THREE.Mesh(tmBaseGeo, materials.gymMetal);
  tmBase.position.y = 0.09;
  treadmill.add(tmBase);

  const tmBeltGeo = new THREE.BoxGeometry(0.75, 0.04, 1.8);
  const tmBeltMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
  const tmBelt = new THREE.Mesh(tmBeltGeo, tmBeltMat);
  tmBelt.position.set(0, 0.2, 0.1);
  treadmill.add(tmBelt);

  const tmConsolePostGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
  const post1 = new THREE.Mesh(tmConsolePostGeo, materials.gymMetal);
  post1.position.set(-0.45, 0.7, -0.7);
  treadmill.add(post1);
  const post2 = post1.clone();
  post2.position.set(0.45, 0.7, -0.7);
  treadmill.add(post2);

  const tmScreenGeo = new THREE.BoxGeometry(0.8, 0.45, 0.08);
  const tmScreenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const tmScreen = new THREE.Mesh(tmScreenGeo, tmScreenMat);
  tmScreen.position.set(0, 1.3, -0.7);
  tmScreen.rotation.x = -Math.PI / 8;
  treadmill.add(tmScreen);

  treadmill.position.set(3.2, 7.68, -2.5);
  treadmill.rotation.y = Math.PI / 4;
  gymGroup.add(treadmill);

  // 2. Heavy-duty dumbbell rack with chrome weights
  const dbRack = new THREE.Group();
  const rackFrameGeo = new THREE.BoxGeometry(2.0, 0.9, 0.5);
  const rackFrame = new THREE.Mesh(rackFrameGeo, materials.gymMetal);
  rackFrame.position.y = 0.45;
  dbRack.add(rackFrame);

  // Hexagonal dumbbells
  const hexGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 6);
  const dbHandleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8);
  for (let d = -0.7; d <= 0.7; d += 0.35) {
    const handle = new THREE.Mesh(dbHandleGeo, materials.carWheelChrome);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(d, 0.8, 0);
    dbRack.add(handle);

    const h1 = new THREE.Mesh(hexGeo, materials.gymMetal);
    h1.rotation.z = Math.PI / 2;
    h1.position.set(d - 0.16, 0.8, 0);
    dbRack.add(h1);

    const h2 = h1.clone();
    h2.position.set(d + 0.16, 0.8, 0);
    dbRack.add(h2);
  }
  dbRack.position.set(6.8, 7.68, -4.5);
  dbRack.rotation.y = -Math.PI / 2;
  gymGroup.add(dbRack);

  // 3. Adjustable workout bench
  const benchGroup = new THREE.Group();
  const benchPadGeo = new THREE.BoxGeometry(0.5, 0.1, 1.5);
  const benchPadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const benchPad = new THREE.Mesh(benchPadGeo, benchPadMat);
  benchPad.position.set(0, 0.48, 0);
  benchPad.castShadow = true;
  benchGroup.add(benchPad);
  const benchLegs = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.45, 1.2), materials.gymMetal);
  benchLegs.position.set(0, 0.22, 0);
  benchGroup.add(benchLegs);
  benchGroup.position.set(4.5, 7.68, -4.8);
  gymGroup.add(benchGroup);

  // Gym internal ceiling light
  const gymLight = new THREE.PointLight(0xffffff, 2.0, 9, 2);
  gymLight.position.set(4.5, 10.2, -3.5);
  gymGroup.add(gymLight);
  interiorLights.push(gymLight);

  topRooftopGroup.add(gymGroup);

  // --- High-Efficiency Solar Panel Array (Left side of rooftop) ---
  const solarPanelsGroup = new THREE.Group();
  solarPanelsGroup.name = 'SolarPhotovoltaicArray';

  // 16 Monocrystalline solar panels in a 4x4 matrix, tilted south (30 degrees)
  const panelWidth = 1.6;
  const panelHeight = 2.4;
  const panelThickness = 0.06;
  const panelGeo = new THREE.BoxGeometry(panelWidth, panelThickness, panelHeight);

  // Aluminum mounting rail frames
  const railGeo = new THREE.BoxGeometry(7.2, 0.08, 0.08);

  for (let r = 0; r < 4; r++) {
    const railZ = -7.5 + r * 2.8;
    const rail = new THREE.Mesh(railGeo, materials.solarFrame);
    rail.position.set(-6.5, 7.75 + r * 0.4, railZ);
    solarPanelsGroup.add(rail);

    for (let c = 0; c < 4; c++) {
      const pMesh = new THREE.Mesh(panelGeo, materials.solarPanel);
      pMesh.position.set(-9.0 + c * (panelWidth + 0.15), 7.9 + r * 0.45, railZ);
      pMesh.rotation.x = Math.PI / 6; // 30 degree tilt towards south sun
      pMesh.castShadow = true;
      pMesh.receiveShadow = true;
      solarPanelsGroup.add(pMesh);
    }
  }

  // Solar Inverter Station & Battery Conduit Box on roof
  const inverterGeo = new THREE.BoxGeometry(0.8, 1.4, 0.5);
  const inverterMesh = new THREE.Mesh(inverterGeo, materials.charcoalSteel);
  inverterMesh.position.set(-2.0, 8.4, -9.5);
  solarPanelsGroup.add(inverterMesh);

  // Inverter status LED display (green online indicator)
  const ledGeo = new THREE.BoxGeometry(0.2, 0.08, 0.04);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const ledMesh = new THREE.Mesh(ledGeo, ledMat);
  ledMesh.position.set(-2.0, 8.7, -9.23);
  solarPanelsGroup.add(ledMesh);

  topRooftopGroup.add(solarPanelsGroup);
  root.add(topRooftopGroup);

  // ==========================================
  // 5. BACK SCENE: 2-CAR LUXURY GARAGE & SPORTS CAR
  // ==========================================
  const garageGroup = new THREE.Group();
  garageGroup.name = 'BackGarageAndCar';

  // Garage building pavilion at the back right
  const garageWallsGeo = new THREE.BoxGeometry(11, 4.2, 9);
  const garageWalls = new THREE.Mesh(garageWallsGeo, materials.whiteStucco);
  garageWalls.position.set(12, 2.1, -12);
  garageWalls.castShadow = true;
  garageGroup.add(garageWalls);

  // Garage roof overhang fascia
  const garageRoofGeo = new THREE.BoxGeometry(12, 0.4, 10);
  const garageRoof = new THREE.Mesh(garageRoofGeo, materials.charcoalSteel);
  garageRoof.position.set(12, 4.3, -12);
  garageGroup.add(garageRoof);

  // Frosted translucent horizontal garage doors (2 bays)
  const doorGeo = new THREE.BoxGeometry(4.2, 3.2, 0.08);
  const door1 = new THREE.Mesh(doorGeo, materials.charcoalSteel);
  door1.position.set(9.2, 1.6, -7.45);
  garageGroup.add(door1);

  const door2 = new THREE.Mesh(doorGeo, materials.charcoalSteel);
  door2.position.set(14.4, 1.6, -7.45);
  garageGroup.add(door2);

  // Frosted glass inserts in garage doors
  const glassInsertGeo = new THREE.BoxGeometry(3.6, 0.5, 0.1);
  [1.0, 1.8, 2.6].forEach((hy) => {
    const g1 = new THREE.Mesh(glassInsertGeo, materials.architecturalGlass);
    g1.position.set(9.2, hy, -7.42);
    garageGroup.add(g1);
    const g2 = new THREE.Mesh(glassInsertGeo, materials.architecturalGlass);
    g2.position.set(14.4, hy, -7.42);
    garageGroup.add(g2);
  });

  // Smart EV Charger Pedestal with glowing status light
  const chargerPostGeo = new THREE.BoxGeometry(0.35, 1.5, 0.25);
  const chargerPost = new THREE.Mesh(chargerPostGeo, materials.charcoalSteel);
  chargerPost.position.set(6.6, 0.75, -5.5);
  garageGroup.add(chargerPost);

  const evRingGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
  const evRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const evRing = new THREE.Mesh(evRingGeo, evRingMat);
  evRing.position.set(6.6, 1.1, -5.36);
  garageGroup.add(evRing);

  // --- Aerodynamic Luxury Sports Car (parked in front of garage bay) ---
  const car = new THREE.Group();
  car.name = 'LuxurySportsCar';

  // 1. Lower chassis body
  const chassisGeo = new THREE.BoxGeometry(2.1, 0.45, 4.6);
  const chassis = new THREE.Mesh(chassisGeo, materials.carPaint);
  chassis.position.y = 0.45;
  chassis.castShadow = true;
  car.add(chassis);

  // 2. Aerodynamic cockpit cabin
  const cabinGeo = new THREE.BoxGeometry(1.7, 0.48, 2.4);
  const cabin = new THREE.Mesh(cabinGeo, materials.charcoalSteel);
  cabin.position.set(0, 0.88, -0.2);
  cabin.castShadow = true;
  car.add(cabin);

  // 3. Tinted front windshield
  const windshieldGeo = new THREE.BoxGeometry(1.65, 0.45, 0.8);
  const windshieldMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.1,
    transmission: 0.3,
  });
  const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
  windshield.position.set(0, 0.85, 0.9);
  windshield.rotation.x = -Math.PI / 4;
  car.add(windshield);

  // 4. Rear aerodynamic wing spoiler
  const spoilerWingGeo = new THREE.BoxGeometry(1.9, 0.06, 0.4);
  const spoilerWing = new THREE.Mesh(spoilerWingGeo, materials.charcoalSteel);
  spoilerWing.position.set(0, 1.05, -2.1);
  car.add(spoilerWing);
  const strutGeo = new THREE.BoxGeometry(0.06, 0.35, 0.1);
  [-0.65, 0.65].forEach((sx) => {
    const strut = new THREE.Mesh(strutGeo, materials.charcoalSteel);
    strut.position.set(sx, 0.85, -2.1);
    car.add(strut);
  });

  // 5. LED Headlights
  const headlightGeo = new THREE.BoxGeometry(0.4, 0.12, 0.1);
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
  const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
  hlLeft.position.set(-0.7, 0.5, 2.31);
  car.add(hlLeft);
  const hlRight = hlLeft.clone();
  hlRight.position.set(0.7, 0.5, 2.31);
  car.add(hlRight);

  // 6. Wheels with detailed chrome multi-spoke rims and rubber tires
  const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 20);
  const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.3, 12);

  const wheelPositions: [number, number, number][] = [
    [-1.05, 0.38, 1.4],
    [1.05, 0.38, 1.4],
    [-1.05, 0.38, -1.4],
    [1.05, 0.38, -1.4],
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(tireGeo, materials.carWheelRubber);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rim = new THREE.Mesh(rimGeo, materials.carWheelChrome);
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);

    wheelGroup.position.set(wx, wy, wz);
    car.add(wheelGroup);
  });

  car.position.set(9.2, 0, -3.2);
  car.rotation.y = -Math.PI / 18;
  garageGroup.add(car);

  root.add(garageGroup);

  // ==========================================
  // 6. LEFT WING: LUSH GARDEN & SMART IRRIGATION SYSTEM
  // ==========================================
  const gardenGroup = new THREE.Group();
  gardenGroup.name = 'SmartIrrigationGarden';

  // Manicured garden turf bed on left
  const gardenBedGeo = new THREE.BoxGeometry(14, 0.15, 20);
  const gardenBed = new THREE.Mesh(gardenBedGeo, materials.lawn);
  gardenBed.position.set(-14, 0.05, 11);
  gardenBed.receiveShadow = true;
  gardenGroup.add(gardenBed);

  // Stone garden border kerbing
  const kerbGeo = new THREE.BoxGeometry(0.3, 0.25, 20.4);
  const kerb = new THREE.Mesh(kerbGeo, materials.concretePaving);
  kerb.position.set(-6.85, 0.12, 11);
  gardenGroup.add(kerb);

  // Sculptural specimen bonsai & cypress trees
  const createTree = (x: number, z: number, scale = 1.0) => {
    const tree = new THREE.Group();
    // Gnarled organic trunk
    const trunkGeo = new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 2.2 * scale, 8);
    const trunk = new THREE.Mesh(trunkGeo, materials.barkWood);
    trunk.position.y = 1.1 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    // Tiered cloud foliage layers (Bonsai / Niwaki style)
    const folMat = new THREE.MeshStandardMaterial({ color: 0x1e3a17, roughness: 0.85 });
    const cloud1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1 * scale, 1), folMat);
    cloud1.position.set(0.3 * scale, 2.2 * scale, 0);
    cloud1.castShadow = true;
    tree.add(cloud1);

    const cloud2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9 * scale, 1), folMat);
    cloud2.position.set(-0.4 * scale, 2.6 * scale, 0.2 * scale);
    cloud2.castShadow = true;
    tree.add(cloud2);

    const cloud3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7 * scale, 1), folMat);
    cloud3.position.set(0, 3.2 * scale, -0.2 * scale);
    cloud3.castShadow = true;
    tree.add(cloud3);

    tree.position.set(x, 0.1, z);
    return tree;
  };

  gardenGroup.add(createTree(-15, 5, 1.2));
  gardenGroup.add(createTree(-17, 12, 1.0));
  gardenGroup.add(createTree(-12, 17, 0.85));

  // Dense perimeter boundary hedge
  const hedgeGeo2 = new THREE.BoxGeometry(0.8, 2.0, 22);
  const boundaryHedge = new THREE.Mesh(hedgeGeo2, materials.hedgeFoliage);
  boundaryHedge.position.set(-20.5, 1.0, 11);
  boundaryHedge.castShadow = true;
  gardenGroup.add(boundaryHedge);

  // Smart Sprinkler Heads Setup across 4 Irrigation Zones:
  // Zone 1: Front Lawn (-10, 0.1, 7)
  // Zone 2: Shrub Bed (-14, 0.1, 10)
  // Zone 3: Specimen Trees (-16, 0.1, 15)
  // Zone 4: Perimeter Hedge (-18, 0.1, 8)
  const sprinklerPositions: THREE.Vector3[] = [
    new THREE.Vector3(-10, 0.1, 7),
    new THREE.Vector3(-14, 0.1, 10),
    new THREE.Vector3(-16, 0.1, 15),
    new THREE.Vector3(-18, 0.1, 8),
  ];

  const sprinklers = createSprinklerParticles(sprinklerPositions);
  gardenGroup.add(sprinklers.sprinklerHeads);
  gardenGroup.add(sprinklers.points);

  root.add(gardenGroup);

  // ==========================================
  // 7. RIGHT WING: OPEN FOOD & PARTY PAVILION
  // ==========================================
  const partyGroup = new THREE.Group();
  partyGroup.name = 'OpenFoodPartyPavilion';

  // Raised teak/stone pavilion platform on right
  const partyPlatformGeo = new THREE.BoxGeometry(12, 0.25, 14);
  const partyPlatform = new THREE.Mesh(partyPlatformGeo, materials.concretePaving);
  partyPlatform.position.set(13, 0.12, 11);
  partyPlatform.receiveShadow = true;
  partyGroup.add(partyPlatform);

  // Modern timber and steel pergola roof with open rafters
  const pergolaFrameGeo = new THREE.BoxGeometry(0.2, 3.4, 0.2);
  const pFrame1 = new THREE.Mesh(pergolaFrameGeo, materials.charcoalSteel);
  pFrame1.position.set(7.5, 1.7, 4.5);
  pFrame1.castShadow = true;
  partyGroup.add(pFrame1);

  const pFrame2 = pFrame1.clone();
  pFrame2.position.set(18.5, 1.7, 4.5);
  partyGroup.add(pFrame2);

  const pFrame3 = pFrame1.clone();
  pFrame3.position.set(7.5, 1.7, 17.5);
  partyGroup.add(pFrame3);

  const pFrame4 = pFrame1.clone();
  pFrame4.position.set(18.5, 1.7, 17.5);
  partyGroup.add(pFrame4);

  // Horizontal pergola rafters
  const rafterGeo = new THREE.BoxGeometry(11.4, 0.15, 0.3);
  for (let rz = 5.2; rz <= 17.0; rz += 1.4) {
    const rafter = new THREE.Mesh(rafterGeo, materials.woodSlatCeiling);
    rafter.position.set(13, 3.45, rz);
    rafter.castShadow = true;
    partyGroup.add(rafter);
  }

  // Luxury outdoor kitchen island bar counter
  const barIslandGeo = new THREE.BoxGeometry(4.8, 1.05, 1.4);
  const barIsland = new THREE.Mesh(barIslandGeo, materials.charcoalSteel);
  barIsland.position.set(15, 0.65, 8.5);
  barIsland.castShadow = true;
  partyGroup.add(barIsland);

  // Granite countertop
  const counterGeo = new THREE.BoxGeometry(5.0, 0.1, 1.6);
  const counter = new THREE.Mesh(counterGeo, materials.stoneCountertop);
  counter.position.set(15, 1.2, 8.5);
  partyGroup.add(counter);

  // Barstools (4 modern swivel barstools)
  for (let bs = -1.8; bs <= 1.8; bs += 1.2) {
    const stool = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 16), materials.woodSlatCeiling);
    seat.position.y = 0.75;
    stool.add(seat);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8), materials.charcoalSteel);
    post.position.y = 0.375;
    stool.add(post);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 16), materials.charcoalSteel);
    base.position.y = 0.02;
    stool.add(base);

    stool.position.set(15 + bs, 0.25, 7.2);
    partyGroup.add(stool);
  }

  // Built-in Stainless Steel BBQ Grill with glowing coals
  const grillGeo = new THREE.BoxGeometry(1.6, 0.6, 1.0);
  const grillMesh = new THREE.Mesh(grillGeo, materials.bbqMetal);
  grillMesh.position.set(15, 1.45, 8.5);
  grillMesh.castShadow = true;
  partyGroup.add(grillMesh);

  // Glowing hot coals
  const coalGeo = new THREE.BoxGeometry(1.4, 0.05, 0.8);
  const coalMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
  const coalMesh = new THREE.Mesh(coalGeo, coalMat);
  coalMesh.position.set(15, 1.6, 8.5);
  partyGroup.add(coalMesh);

  // BBQ interactive smoke particles
  const grillSmoke = createGrillSmokeParticles(new THREE.Vector3(15, 1.6, 8.5));
  partyGroup.add(grillSmoke.points);

  // Alfresco Dining Table for 8
  const tableGroup = new THREE.Group();
  const diningTableTop = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 1.8), materials.woodSlatCeiling);
  diningTableTop.position.set(13, 0.85, 14);
  diningTableTop.castShadow = true;
  tableGroup.add(diningTableTop);

  const tLegGeo = new THREE.BoxGeometry(0.1, 0.8, 1.6);
  const leg1 = new THREE.Mesh(tLegGeo, materials.charcoalSteel);
  leg1.position.set(11.2, 0.45, 14);
  tableGroup.add(leg1);
  const leg2 = leg1.clone();
  leg2.position.set(14.8, 0.45, 14);
  tableGroup.add(leg2);

  // Dining chairs
  for (let c = -1.4; c <= 1.4; c += 0.9) {
    const chair1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 0.5), materials.charcoalSteel);
    chair1.position.set(13 + c, 0.55, 12.6);
    tableGroup.add(chair1);

    const chair2 = chair1.clone();
    chair2.position.set(13 + c, 0.55, 15.4);
    tableGroup.add(chair2);
  }
  partyGroup.add(tableGroup);

  // Overhead ambient party fairy/pendant string lights
  for (let lx = 9.0; lx <= 17.0; lx += 2.5) {
    for (let lz = 6.0; lz <= 16.0; lz += 4.5) {
      const bulbGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(lx, 3.25, lz);
      partyGroup.add(bulb);

      const pLight = new THREE.PointLight(0xf59e0b, 1.8, 5.5, 2);
      pLight.position.set(lx, 3.1, lz);
      partyGroup.add(pLight);
      partyLights.push(pLight);
    }
  }

  root.add(partyGroup);

  // ==========================================
  // ANIMATION LOOP TICK
  // ==========================================
  function updateAnimation(elapsed: number, delta: number, isSprinklerOn: boolean, isPartyOn: boolean) {
    // 1. Infinity pool water ripple motion
    const pos = waterGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const wave = Math.sin(u * 1.5 + elapsed * 2.2) * 0.02 + Math.cos(v * 1.8 + elapsed * 1.8) * 0.02;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;

    // 2. Sprinkler particle updates
    sprinklers.update(delta, isSprinklerOn);

    // 3. BBQ grill smoke particle updates
    grillSmoke.update(delta, isPartyOn);
  }

  return {
    group: root,
    waterMesh,
    sprinklers,
    grillSmoke,
    interiorLights,
    exteriorWarmLights,
    poolLights,
    partyLights,
    solarPanelsGroup,
    updateAnimation,
  };
}

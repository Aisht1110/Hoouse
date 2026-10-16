import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createEstateMaterials } from './materials.ts';
import { buildVillaEstate, VillaEstateScene } from './villaModel.ts';
import { getLightingEnvironment } from '../utils/estateLogic.ts';

export type TourPresetId =
  | 'overview'
  | 'facade'
  | 'pool'
  | 'garden'
  | 'party'
  | 'master'
  | 'gym'
  | 'solar'
  | 'garage';

export interface TourPreset {
  id: TourPresetId;
  label: string;
  tagline: string;
  camPos: [number, number, number];
  lookAt: [number, number, number];
}

export const TOUR_PRESETS: TourPreset[] = [
  {
    id: 'facade',
    label: 'Main Facade',
    tagline: 'Signature modern 2-story glass cantilever and pool',
    camPos: [2.5, 3.8, 17.5],
    lookAt: [-1.5, 3.0, 2.0],
  },
  {
    id: 'overview',
    label: 'Estate Overview',
    tagline: 'Aerial masterplan of the 2-story villa and grounds',
    camPos: [24, 18, 30],
    lookAt: [0, 4.0, 3.0],
  },
  {
    id: 'garden',
    label: 'Smart Garden',
    tagline: 'Lawn, specimen trees, and 4-zone smart irrigation',
    camPos: [-14, 4.5, 18],
    lookAt: [-14, 1.2, 11],
  },
  {
    id: 'pool',
    label: 'Pool & Sun Deck',
    tagline: 'Infinity pool and herringbone teak relaxation deck',
    camPos: [6.8, 2.4, 12.2],
    lookAt: [2.0, 0.8, 6.5],
  },
  {
    id: 'party',
    label: 'Party Pavilion',
    tagline: 'Alfresco dining, outdoor kitchen, BBQ, and bar',
    camPos: [15, 3.8, 18],
    lookAt: [14.5, 1.6, 11],
  },
  {
    id: 'master',
    label: 'Master Bedroom',
    tagline: '2nd floor suite with king bed and private terrace',
    camPos: [-1.5, 6.2, 9.5],
    lookAt: [-1.0, 5.0, -1.0],
  },
  {
    id: 'gym',
    label: 'Rooftop Gym',
    tagline: 'Glass-enclosed 360-view fitness pavilion',
    camPos: [8.5, 10.5, 1.5],
    lookAt: [4.5, 8.8, -3.5],
  },
  {
    id: 'solar',
    label: 'Solar Array',
    tagline: '18.5 kWp high-efficiency monocrystalline solar matrix',
    camPos: [-7.5, 11.8, 2.0],
    lookAt: [-6.5, 8.2, -4.0],
  },
  {
    id: 'garage',
    label: 'Back Garage',
    tagline: 'Enclosed 2-car garage, luxury sports car, and EV pedestal',
    camPos: [14, 3.8, 3.0],
    lookAt: [11, 1.5, -6.5],
  },
];

interface VillaCanvasProps {
  activePreset: TourPresetId;
  timeHours: number;
  isSprinklerActive: boolean;
  isPartyActive: boolean;
  interiorLightsOn: boolean;
  poolLightsOn: boolean;
  onUserOrbitChange?: () => void;
}

export const VillaCanvas: React.FC<VillaCanvasProps> = ({
  activePreset,
  timeHours,
  isSprinklerActive,
  isPartyActive,
  interiorLightsOn,
  poolLightsOn,
  onUserOrbitChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const estateRef = useRef<VillaEstateScene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Target camera state for smooth transition
  const targetCamPos = useRef(new THREE.Vector3(2.5, 3.8, 17.5));
  const targetLookAt = useRef(new THREE.Vector3(-1.5, 3.0, 2.0));
  const isTransitioning = useRef(true);

  // Scratch objects for 0-GC render loop
  const _vec3 = useRef(new THREE.Vector3());

  // Handle active preset changes
  useEffect(() => {
    const preset = TOUR_PRESETS.find((p) => p.id === activePreset);
    if (preset) {
      targetCamPos.current.set(...preset.camPos);
      targetLookAt.current.set(...preset.lookAt);
      isTransitioning.current = true;
    }
  }, [activePreset]);

  // Main Three.js Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Renderer Setup with PBR standards
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Scene & Procedural Studio Environment
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    if (!isHeadless) {
      try {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        const roomEnv = new RoomEnvironment();
        scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
        pmremGenerator.dispose();
      } catch {
        // Fallback gracefully if PMREM unavailable
      }
    }

    // 3. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.2,
      250
    );
    camera.position.set(2.5, 3.8, 17.5);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 3.0;
    controls.maxDistance = 85.0;
    controls.target.set(-1.5, 3.0, 2.0);
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isTransitioning.current = false;
      onUserOrbitChange?.();
    });

    // 4. Lighting Rig (Warm Key Light + Cool Fill + Fog)
    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sunLight.position.set(30, 45, 35);
    sunLight.castShadow = !isHeadless;
    sunLight.shadow.mapSize.width = isHeadless ? 512 : 2048;
    sunLight.shadow.mapSize.height = isHeadless ? 512 : 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 130;
    const d = 32;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    const hemiLight = new THREE.HemisphereLight(0xc7d2fe, 0x1e1b4b, 0.6);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const fog = new THREE.FogExp2('#fb923c', 0.012);
    scene.fog = fog;
    scene.background = new THREE.Color('#fb923c');

    // 5. Build Estate Models
    const materials = createEstateMaterials();
    const estate = buildVillaEstate(materials);
    scene.add(estate.group);
    estateRef.current = estate;

    // Pre-warm shaders
    renderer.compile(scene, camera);

    // 6. Responsive Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop with performance.now and headless throttling
    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);

      const deltaMs = now - lastTime;
      // In headless mode, cap at ~20 fps (50ms interval) so software CPU rasterization doesn't stall
      if (isHeadless && deltaMs < 50) {
        return;
      }

      const delta = Math.min(deltaMs / 1000, 0.1);
      lastTime = now;
      const elapsed = now / 1000;

      // Smooth camera interpolation towards target waypoint
      if (isTransitioning.current) {
        const k = 1 - Math.exp(-3.5 * delta);
        camera.position.lerp(targetCamPos.current, k);
        controls.target.lerp(targetLookAt.current, k);

        if (camera.position.distanceTo(targetCamPos.current) < 0.08) {
          isTransitioning.current = false;
        }
      }

      controls.update();

      // Tick estate animations (water ripples, sprinklers, grill smoke)
      if (estateRef.current) {
        estateRef.current.updateAnimation(
          elapsed,
          delta,
          isSprinklerActive,
          isPartyActive
        );
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Dynamic Lighting when timeHours changes
  useEffect(() => {
    const scene = sceneRef.current;
    const sun = sunLightRef.current;
    const hemi = hemiLightRef.current;
    if (!scene || !sun || !hemi) return;

    const env = getLightingEnvironment(timeHours);
    sun.position.set(...env.sunPosition);
    sun.intensity = env.sunIntensity;
    sun.color.set(env.sunColor);

    hemi.color.set(env.ambientColor);
    hemi.intensity = env.ambientIntensity;

    scene.background = new THREE.Color(env.skyColor);
    if (scene.fog) {
      scene.fog.color.set(env.fogColor);
    }
  }, [timeHours]);

  // Update Interior and Pool Lights toggle state
  useEffect(() => {
    const estate = estateRef.current;
    if (!estate) return;

    estate.interiorLights.forEach((light) => {
      light.visible = interiorLightsOn;
    });

    estate.exteriorWarmLights.forEach((light) => {
      light.visible = interiorLightsOn;
    });

    estate.poolLights.forEach((light) => {
      light.visible = poolLightsOn;
    });

    estate.partyLights.forEach((light) => {
      light.visible = isPartyActive;
    });
  }, [interiorLightsOn, poolLightsOn, isPartyActive]);

  // Update Sprinkler & Party animation state
  useEffect(() => {
    if (estateRef.current) {
      estateRef.current.sprinklers.points.visible = isSprinklerActive;
      estateRef.current.grillSmoke.points.visible = isPartyActive;
    }
  }, [isSprinklerActive, isPartyActive]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full bg-[#0b0f1a] overflow-hidden"
      data-testid="threejs-canvas-container"
    />
  );
};

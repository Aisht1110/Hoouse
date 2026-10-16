# Modern Luxury Solar Villa & Estate 3D Visualizer

A photorealistic, interactive 3D architectural estate visualizer built with Three.js and React, faithfully inspired by the reference luxury modern villa photograph. The application brings to life a 2-story glass-cantilever villa with an infinity pool, an interactive smart garden irrigation system on the left, an open-air party and culinary lounge on the right, a back garage with a luxury vehicle, a panoramic rooftop gym, and a high-efficiency solar panel array with real-time estate energy telemetry.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and confirmed in Phase 1:
> - **Atmosphere & Illumination**: Golden hour sunset with warm architectural interior glow, recessed ceiling strip lighting, and pool illumination matching the uploaded reference image (`image.png`).
> - **Navigation & Exploration**: Cinematic camera tour with guided presets for each estate wing (Overall Estate, Entrance Garden & Irrigation, Open Party Lounge, Infinity Pool Deck, Master Suite & 2nd Floor, Rooftop Gym, Solar Array, Back Garage). Free orbit controls remain accessible anytime.
> - **Smart Estate Telemetry**: Comprehensive dual-system dashboard featuring real-time solar generation/battery storage telemetry and an interactive smart irrigation console with active 3D sprinkler water particles, zone moisture tracking, and eco-efficiency metrics.

---

## 1. Overview & Core Concept

- **What It Does**: Renders an ultra-modern 3D architectural estate in real-time WebGL using Three.js with PBR materials, procedural textures, dynamic lighting, contact shadows, and particle simulations. Users can tour every wing, inspect architectural details, trigger smart garden sprinklers, adjust time-of-day illumination, and monitor estate sustainability metrics.
- **Target Audience & Persona**: Luxury property owners, architectural enthusiasts, and sustainable smart-home designers seeking an interactive digital twin experience.
- **Key Value**: Delivers the exact architectural aesthetic from the user's reference photograph while providing functional, interactive estate systems (solar energy flow, automated smart irrigation, ambient party mode, and cinematic room inspection).

---

## 2. Architectural Zones & Layout Plan

The 3D estate layout is carefully arranged to honor all spatial requirements:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          BACK PROPERTY BOUNDARY                        │
│                                                                        │
│       ┌──────────────────────┐        ┌─────────────────────────┐      │
│       │   ENCLOSED 2-CAR     │        │    PRIVATE REAR PATIO   │      │
│       │   GARAGE & EV CAR    │        │    & BEDROOM ACCESS     │      │
│       └──────────┬───────────┘        └───────────┬─────────────┘      │
│                  │                                │                    │
│   ┌──────────────┴────────────────────────────────┴────────────────┐   │
│   │             MAIN 2-STORY VILLA STRUCTURE                      │   │
│   │  • Ground Floor: Double-height Great Room & Kitchen            │   │
│   │  • Second Floor: Luxury Master Bedroom Suite with Glass Wall  │   │
│   │  • Rooftop: Panoramic Glass Gym & High-Efficiency Solar Array │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────┐    ┌──────┴──────┐    ┌────────────────────┐   │
│   │   LEFT SECTION:   │    │  INFINITY   │    │   RIGHT SECTION:   │   │
│   │   Lush Garden &   │    │  POOL &     │    │   Open-Air Party   │   │
│   │   Smart Sprinkler │    │  HERRINGBONE│    │   Pavilion, BBQ &  │   │
│   │   Irrigation      │    │  SUN DECK   │    │   Dining Lounge    │   │
│   └─────────┬─────────┘    └──────┬──────┘    └─────────┬──────────┘   │
│             │                     │                     │              │
│             └─────────────────────┼─────────────────────┘              │
│                        MAIN ESTATE ENTRANCE                            │
└────────────────────────────────────────────────────────────────────────┘
```

### Detailed Zone Breakdown:

1. **Main 2-Story Villa (Matching Reference Image)**:
   - **Architectural Framing**: Crisp white cantilevered horizontal slabs, charcoal vertical feature walls, warm cedar/teak wood slat ceilings with embedded linear LED warm strip lights.
   - **Floor-to-Ceiling Glass Walls**: Double-glazed tinted glass with black aluminum mullions, interior curtain sheers, and visible interior furniture (luxury sofa, marble coffee table, minimalist staircase).
   - **Master Suite (2nd Floor Rear/Upper)**: King bed with headboard lighting, private terrace balcony with glass balustrade, and floor-to-ceiling panoramic view.

2. **Infinity Pool & Sun Deck**:
   - Deep azure reflective swimming pool with animated ripple caustics, submerged warm LED lights, and perimeter overflow gutter.
   - Distinctive angled herringbone teak/composite deck matching the reference photo, furnished with dual modern sun loungers.

3. **Left Wing — Landscaped Garden & Smart Irrigation**:
   - Manicured lawn, boxwood hedges, ornamental shrubs, and sculptural bonsai/palm trees.
   - **Smart Irrigation System**: 4 discrete watering zones (Zone 1: Front Lawn, Zone 2: Shrub Bed, Zone 3: Boundary Hedge, Zone 4: Specimen Trees).
   - **Interactive 3D Sprinklers**: Procedural oscillating sprinkler heads that emit realistic water mist/spray particles when active, accompanied by real-time soil moisture gauge updates and water volume tracking.

4. **Right Wing — Open Food & Party Pavilion**:
   - Cantilevered steel and timber pergolas with warm downlights and ambient party fairy pendant lights.
   - Luxury outdoor kitchen featuring a stainless steel grill with glowing embers, stone island bar with barstools, modern alfresco dining table for 8, and an ambient party mood lighting switch.

5. **Top Level — Panoramic Rooftop Gym**:
   - Enclosed climate-controlled glass cube gym with 360-degree panoramic views.
   - Detailed gym equipment: high-tech running treadmill with screen, dumbbell rack with weights, bench, and yoga mat area.

6. **Top Level — High-Efficiency Solar Panel Array**:
   - Sleek matte black monocrystalline solar photovoltaic panel array tilted south at optimal sun angle.
   - Inverter junction box, battery storage cabinet, and live interactive energy telemetry HUD showing generation rate (kW), battery percentage, house consumption, and carbon offset.

7. **Back Wing — Luxury Car Garage**:
   - Modern enclosed garage pavilion with translucent frosted glass door panels, polished concrete floor, and an aerodynamic luxury sports vehicle parked with an EV charging pedestal.

---

## 3. User Experience & Visual Design

- **Aesthetic Direction**: Ultra-luxury architectural minimalism — combining the organic warmth of teak and lush greenery with crisp white stucco, charcoal structural steel, and crystal glass.
- **Color Palette & Atmospheric Lighting**:
   - Canvas: Warm twilight / golden hour sky gradient (`#1e293b` to `#fdba74` and `#f59e0b`).
   - Architecture: Clean white travertine (`#f8fafc`), graphite slate (`#1e293b`), rich teak wood (`#92400e`).
   - Pool: Deep crystal cyan-blue (`#0284c7` to `#38bdf8`) with soft underwater luminescence (`#7dd3fc`).
   - Lighting: Warm 2700K architectural strip lighting (`#fbbf24`), cool 6500K sky fill (`#93c5fd`).
- **Ergonomic Floating Bottom Dock**:
   - Unobstructed center viewport: Floating consolidated control dock at bottom center (`max-w-4xl`), collapsible into a zen view mode (`Hide / Show Dock`).
   - Four dedicated dock tabs:
     1. **Camera Tour**: Instant cinematic camera presets (Whole Estate, Villa Facade, Pool Deck, Garden & Irrigation, Party Pavilion, Rooftop Gym, Solar Array, Back Garage).
     2. **Smart Irrigation**: Zone selector (All Zones, Lawn, Shrubs, Hedges), Manual Sprinkler Trigger, Automated Moisture Schedule toggle, Water Flow Rate (L/min), Soil Moisture Levels (%).
     3. **Solar & Energy**: Real-time kW output gauge, Battery State of Charge (%), Net Grid Export/Import meter, Estimated Daily Savings, Solar Tilt optimization.
     4. **Atmosphere & Lights**: Time of Day slider (Sunrise, Midday, Golden Hour, Midnight), Interior Lights toggle, Pool Lights toggle, Party Ambient Lights toggle.
- **Zero-Pill Typography & Layout**:
   - Typography: Clean `Plus Jakarta Sans` for titles and UI, `DM Sans` for body, and `font-mono tabular-nums` for real-time telemetry numbers.
   - No pulsating dots or arbitrary AI scorecards; clean, actionable controls.

---

## 4. Key Product Decisions & Trade-Offs

- **Decision 1: Pure Procedural Three.js Models & Textures (Zero External 404s)**
  - *Chosen Approach*: Build every structure, vehicle, gym equipment, solar panel, and tree using composite 3–12 part `THREE.Group` meshes and procedural canvas textures (herringbone deck, solar grid lines, wood grain, water ripples).
  - *Why*: Guarantees instant 100% offline reliability in AI Studio without broken external 3D model links or 404 image errors.
- **Decision 2: Interactive Sprinkler Particle System**
  - *Chosen Approach*: Dynamic `THREE.Points` particle system with velocity, gravity, and radial spray simulation tied directly to the irrigation toggle.
  - *Why*: Provides immediate, delightful visual confirmation when the user taps "Run Sprinklers".
- **Decision 3: Damped Camera Choreography**
  - *Chosen Approach*: Smooth exponential camera interpolation (`THREE.MathUtils.damp`) between tour waypoints, paired with OrbitControls for manual inspection.
  - *Why*: Prevents jarring camera cuts, delivering a buttery architectural walkthrough.

---

## 5. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                               React App                                │
│                                                                        │
│  ┌─────────────────────────────────┐   ┌────────────────────────────┐  │
│  │      Top Navigation Bar         │   │   Estate Telemetry Ribbon  │  │
│  │ (Villa Wordmark · 3-Zone Clean) │   │ (Solar kW · Battery · H2O) │  │
│  └─────────────────────────────────┘   └────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Full-Bleed Three.js Canvas                    │  │
│  │  • Scene with RoomEnvironment & PMREM PBR Lighting               │  │
│  │  • Ground, Terrain & Perimeter Garden                            │  │
│  │  • 2-Story Villa Structure & Interior Furnishings               │  │
│  │  • Infinity Pool with Animated Caustics Water Shader            │  │
│  │  • Interactive Smart Sprinkler Particle Water System            │  │
│  │  • Open-Air Party Pavilion & Glowing BBQ Grill                  │  │
│  │  • Rooftop Gym Equipment (Treadmill, Weights, Glass Enclosure)  │  │
│  │  • High-Efficiency Solar Panel Matrix with Inverter Wiring       │  │
│  │  • Rear Garage Pavilion & Aerodynamic Luxury Sports Car          │  │
│  │  • Cinematic Damped Camera Orbit Controller                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Collapsible Floating Bottom Control Dock            │  │
│  │  [Tour Presets]  [Irrigation System]  [Solar Energy]  [Lighting] │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Verification & Acceptance Plan

1. **Compilation**: Clean TypeScript build with Vite (`compile_applet`).
2. **Visual Fidelity**:
   - Architectural match to reference image (cantilever, pool with herringbone deck, floor-to-ceiling glass, warm linear LED accents).
   - All requested zones verified: 2 floors, back car garage with car, master bedroom suite, rooftop gym, rooftop solar system, entrance garden with smart irrigation, and right-side open food party pavilion.
3. **Interactive Testing**:
   - Cinematic tour buttons smoothly animate camera to each designated zone.
   - Sprinkler toggle activates 3D water particles and updates soil moisture telemetry.
   - Solar energy telemetry accurately reflects daylight conditions with live power generation readouts.
   - Day/Night slider transitions directional sun, sky fog, and architectural artificial lighting seamlessly.

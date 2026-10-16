import * as THREE from 'three';

export interface SprinklerParticleSystem {
  points: THREE.Points;
  update: (delta: number, isActive: boolean) => void;
  sprinklerHeads: THREE.Group;
}

export interface SmokeParticleSystem {
  points: THREE.Points;
  update: (delta: number, isActive: boolean) => void;
}

/**
 * Creates dynamic multi-zone sprinkler water spray particles
 */
export function createSprinklerParticles(sprinklerPositions: THREE.Vector3[]): SprinklerParticleSystem {
  const sprinklerHeads = new THREE.Group();
  sprinklerHeads.name = 'SprinklerHeadsGroup';

  // Construct realistic 3-part bronze & black irrigation sprinkler heads
  const headGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.25, 12);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
  const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.9 });
  const collarGeo = new THREE.TorusGeometry(0.12, 0.03, 8, 16);

  sprinklerPositions.forEach((pos, idx) => {
    const headGroup = new THREE.Group();
    headGroup.position.copy(pos);

    const body = new THREE.Mesh(headGeo, headMat);
    body.position.y = 0.125;
    body.castShadow = true;
    headGroup.add(body);

    const collar = new THREE.Mesh(collarGeo, headMat);
    collar.position.y = 0.03;
    collar.rotation.x = Math.PI / 2;
    headGroup.add(collar);

    const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 8), nozzleMat);
    nozzle.position.y = 0.26;
    nozzle.name = `nozzle_${idx}`;
    headGroup.add(nozzle);

    sprinklerHeads.add(headGroup);
  });

  // Particle simulation: 1500 particles distributed across sprinklers
  const particleCountPerHead = 350;
  const totalCount = sprinklerPositions.length * particleCountPerHead;

  const positions = new Float32Array(totalCount * 3);
  const velocities = new Float32Array(totalCount * 3);
  const lifetimes = new Float32Array(totalCount);
  const maxLifetimes = new Float32Array(totalCount);

  // Initialize particles at origins
  for (let h = 0; h < sprinklerPositions.length; h++) {
    const origin = sprinklerPositions[h];
    for (let p = 0; p < particleCountPerHead; p++) {
      const idx = h * particleCountPerHead + p;
      positions[idx * 3] = origin.x;
      positions[idx * 3 + 1] = origin.y + 0.25;
      positions[idx * 3 + 2] = origin.z;

      // Random radial spray velocities
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 2.5;
      const elevation = 0.5 + Math.random() * 0.8; // arc upwards

      velocities[idx * 3] = Math.cos(angle) * speed;
      velocities[idx * 3 + 1] = elevation * speed;
      velocities[idx * 3 + 2] = Math.sin(angle) * speed;

      lifetimes[idx] = Math.random(); // staggered start
      maxLifetimes[idx] = 1.0 + Math.random() * 0.8;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Procedural soft circular water droplet sprite
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const radGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  radGrad.addColorStop(0.3, 'rgba(186, 230, 253, 0.7)');
  radGrad.addColorStop(0.8, 'rgba(56, 189, 248, 0.2)');
  radGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 64, 64);
  const dropletTexture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: 0.22,
    map: dropletTexture,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'SprinklerSprayParticles';
  points.visible = false;

  let oscillationTime = 0;

  function update(delta: number, isActive: boolean) {
    if (!isActive) {
      points.visible = false;
      return;
    }

    points.visible = true;
    oscillationTime += delta * 2.5;

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let h = 0; h < sprinklerPositions.length; h++) {
      const origin = sprinklerPositions[h];
      const nozzle = sprinklerHeads.getObjectByName(`nozzle_${h}`);
      if (nozzle) {
        // Oscillation back and forth
        nozzle.rotation.y = Math.sin(oscillationTime + h * 1.5) * 1.2;
      }

      for (let p = 0; p < particleCountPerHead; p++) {
        const idx = h * particleCountPerHead + p;
        lifetimes[idx] += delta;

        if (lifetimes[idx] >= maxLifetimes[idx]) {
          // Reset droplet at nozzle
          lifetimes[idx] = 0;
          posArray[idx * 3] = origin.x;
          posArray[idx * 3 + 1] = origin.y + 0.25;
          posArray[idx * 3 + 2] = origin.z;

          // Compute directional spray guided by nozzle angle
          const baseAngle = (nozzle?.rotation.y ?? 0) + (h * Math.PI) / 2;
          const spread = (Math.random() - 0.5) * 0.7;
          const angle = baseAngle + spread;
          const speed = 2.4 + Math.random() * 2.8;

          velocities[idx * 3] = Math.cos(angle) * speed;
          velocities[idx * 3 + 1] = 1.8 + Math.random() * 1.6; // initial vertical burst
          velocities[idx * 3 + 2] = Math.sin(angle) * speed;
        } else {
          // Physics step: integrate velocity & gravity
          velocities[idx * 3 + 1] -= 9.8 * delta; // gravity
          velocities[idx * 3] *= (1 - 0.2 * delta); // drag
          velocities[idx * 3 + 2] *= (1 - 0.2 * delta);

          posArray[idx * 3] += velocities[idx * 3] * delta;
          posArray[idx * 3 + 1] += velocities[idx * 3 + 1] * delta;
          posArray[idx * 3 + 2] += velocities[idx * 3 + 2] * delta;

          // Splash on ground
          if (posArray[idx * 3 + 1] < origin.y + 0.02) {
            posArray[idx * 3 + 1] = origin.y + 0.02;
            velocities[idx * 3] *= 0.1;
            velocities[idx * 3 + 2] *= 0.1;
          }
        }
      }
    }

    posAttr.needsUpdate = true;
  }

  return { points, update, sprinklerHeads };
}

/**
 * Creates subtle grill smoke and floating embers for the party pavilion
 */
export function createGrillSmokeParticles(grillPosition: THREE.Vector3): SmokeParticleSystem {
  const count = 120;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const lifetimes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = grillPosition.x + (Math.random() - 0.5) * 0.8;
    positions[i * 3 + 1] = grillPosition.y + 0.9;
    positions[i * 3 + 2] = grillPosition.z + (Math.random() - 0.5) * 0.5;

    velocities[i * 3] = (Math.random() - 0.5) * 0.2;
    velocities[i * 3 + 1] = 0.6 + Math.random() * 0.5;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;

    lifetimes[i] = Math.random() * 2.0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(251, 146, 60, 0.8)'); // warm ember core
  grad.addColorStop(0.3, 'rgba(200, 200, 200, 0.35)'); // smoke
  grad.addColorStop(1, 'rgba(100, 100, 100, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 32, 32);
  const tex = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: 0.35,
    map: tex,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.visible = false;

  function update(delta: number, isActive: boolean) {
    if (!isActive) {
      points.visible = false;
      return;
    }
    points.visible = true;

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      lifetimes[i] += delta;
      if (lifetimes[i] > 2.5) {
        lifetimes[i] = 0;
        pos[i * 3] = grillPosition.x + (Math.random() - 0.5) * 0.8;
        pos[i * 3 + 1] = grillPosition.y + 0.9;
        pos[i * 3 + 2] = grillPosition.z + (Math.random() - 0.5) * 0.5;
      } else {
        pos[i * 3] += velocities[i * 3] * delta;
        pos[i * 3 + 1] += velocities[i * 3 + 1] * delta;
        pos[i * 3 + 2] += velocities[i * 3 + 2] * delta;
      }
    }
    posAttr.needsUpdate = true;
  }

  return { points, update };
}

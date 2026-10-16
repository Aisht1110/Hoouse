import * as THREE from 'three';

/**
 * Creates a photorealistic herringbone pattern canvas texture
 * matching the wooden/composite pool deck in the reference photo
 */
export function createHerringboneDeckTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base warm light teak / taupe wood color
  ctx.fillStyle = '#bfa58a';
  ctx.fillRect(0, 0, 512, 512);

  // Planks geometry
  const plankWidth = 24;
  const plankLength = 72;
  const colors = ['#b89f84', '#c5ad93', '#ab9277', '#bc9f81', '#cfb99f', '#9f846a'];

  // Draw herringbone zig-zag slats
  ctx.save();
  ctx.translate(256, 256);
  ctx.rotate(Math.PI / 4); // 45 degree herringbone
  ctx.translate(-380, -380);

  let plankIndex = 0;
  for (let y = -200; y < 900; y += plankLength) {
    for (let x = -200; x < 900; x += plankWidth * 2) {
      // Slat A (Vertical)
      ctx.fillStyle = colors[plankIndex % colors.length];
      ctx.fillRect(x, y, plankWidth, plankLength);
      ctx.strokeStyle = 'rgba(70, 50, 35, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, plankWidth, plankLength);

      // Fine wood grain lines inside plank A
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      for (let g = 4; g < plankWidth; g += 6) {
        ctx.beginPath();
        ctx.moveTo(x + g, y);
        ctx.lineTo(x + g, y + plankLength);
        ctx.stroke();
      }

      // Slat B (Horizontal)
      ctx.fillStyle = colors[(plankIndex + 2) % colors.length];
      ctx.fillRect(x + plankWidth, y + plankLength - plankWidth, plankLength, plankWidth);
      ctx.strokeStyle = 'rgba(70, 50, 35, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + plankWidth, y + plankLength - plankWidth, plankLength, plankWidth);

      // Wood grain for plank B
      for (let g = 4; g < plankWidth; g += 6) {
        ctx.beginPath();
        ctx.moveTo(x + plankWidth, y + plankLength - plankWidth + g);
        ctx.lineTo(x + plankWidth + plankLength, y + plankLength - plankWidth + g);
        ctx.stroke();
      }

      plankIndex++;
    }
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates high-efficiency monocrystalline solar cell grid texture
 * Deep dark blue-black silicon with silver conductive busbars
 */
export function createSolarCellTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep dark antireflective solar silicon
  ctx.fillStyle = '#081120';
  ctx.fillRect(0, 0, 512, 512);

  const cellCols = 4;
  const cellRows = 8;
  const cellW = 512 / cellCols;
  const cellH = 512 / cellRows;

  for (let r = 0; r < cellRows; r++) {
    for (let c = 0; c < cellCols; c++) {
      const x = c * cellW;
      const y = r * cellH;

      // Subtle cell wafer gradient
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, '#0a172c');
      grad.addColorStop(0.5, '#07101e');
      grad.addColorStop(1, '#0c1b34');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

      // Silver conductive fingers
      ctx.strokeStyle = 'rgba(180, 210, 240, 0.25)';
      ctx.lineWidth = 1;
      for (let f = y + 6; f < y + cellH - 4; f += 6) {
        ctx.beginPath();
        ctx.moveTo(x + 3, f);
        ctx.lineTo(x + cellW - 3, f);
        ctx.stroke();
      }

      // Silver primary busbars (3 vertical bars per cell)
      ctx.strokeStyle = 'rgba(230, 240, 255, 0.8)';
      ctx.lineWidth = 2;
      for (let b = 1; b <= 3; b++) {
        const bx = x + (cellW / 4) * b;
        ctx.beginPath();
        ctx.moveTo(bx, y + 2);
        ctx.lineTo(bx, y + cellH - 2);
        ctx.stroke();
      }

      // Diamond corner chamfers on high-efficiency cells
      ctx.fillStyle = '#081120';
      const chamfer = 6;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 2);
      ctx.lineTo(x + 2 + chamfer, y + 2);
      ctx.lineTo(x + 2, y + 2 + chamfer);
      ctx.fill();
    }
  }

  // Aluminum frame border
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 506, 506);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates warm wood slat ceiling texture matching the cantilever underside
 */
export function createWoodSlatTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm amber cedar base
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(0, 0, 512, 512);

  const slatHeight = 16;
  const colors = ['#92400e', '#78350f', '#a16207', '#854d0e', '#b45309'];

  for (let y = 0; y < 512; y += slatHeight) {
    ctx.fillStyle = colors[(y / slatHeight) % colors.length];
    ctx.fillRect(0, y, 512, slatHeight - 2);

    // Deep shadow groove between slats
    ctx.fillStyle = '#291807';
    ctx.fillRect(0, y + slatHeight - 2, 512, 2);

    // Subtle grain variation
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + 6);
    ctx.lineTo(512, y + 6);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates modern architectural concrete paver texture
 */
export function createConcretePavingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 512, 512);

  // Large square slabs 256x256
  const tileSize = 128;
  for (let y = 0; y < 512; y += tileSize) {
    for (let x = 0; x < 512; x += tileSize) {
      // Subtle noise variation
      const shade = 200 + Math.floor(Math.sin(x * 12 + y * 7) * 8);
      ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 5})`;
      ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

      // Expansion joints
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates manicured grass texture
 */
export function createLawnTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#2e5c1e';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle striped lawn stripes
  const stripeW = 64;
  for (let x = 0; x < 512; x += stripeW * 2) {
    ctx.fillStyle = 'rgba(74, 140, 48, 0.25)';
    ctx.fillRect(x, 0, stripeW, 512);
  }

  // Fine blade stippling
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? '#3f7a28' : '#274e1a';
    ctx.fillRect(rx, ry, 2, 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

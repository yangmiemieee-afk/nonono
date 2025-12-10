import * as THREE from 'three';

// Generate points for a cone (Tree shape)
export const generateTreePoints = (count: number, radius: number, height: number) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const y = Math.random(); 
    const r = radius * (1 - y);
    const theta = Math.random() * Math.PI * 2;
    // Fill the volume
    const dist = Math.sqrt(Math.random()) * r;

    const x = dist * Math.cos(theta);
    const z = dist * Math.sin(theta);
    const actualY = (y * height) - (height / 2);

    points.push(new THREE.Vector3(x, actualY, z));
  }
  return points;
};

// Generate points for surface of cone (for sequins)
export const generateConeSurfacePoints = (count: number, radius: number, height: number) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const y = Math.random(); 
    const r = radius * (1 - y);
    const theta = Math.random() * Math.PI * 2;
    // Push slightly out for surface
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const actualY = (y * height) - (height / 2);
    points.push(new THREE.Vector3(x, actualY, z));
  }
  return points;
};

// Generate points for a decoration spiral
export const generateSpiralPoints = (count: number, radius: number, height: number, turns: number) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const y = (t * height) - (height / 2);
    const r = radius * (1 - t); 
    const theta = t * Math.PI * 2 * turns;

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
};

// Irregular distribution within cone volume (for Gold)
export const generateIrregularConePoints = (count: number, radius: number, height: number) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const y = Math.random(); 
    const r = (radius * (1 - y)) + 0.5; // Slightly wider than tree
    const theta = Math.random() * Math.PI * 2;
    
    // Bias towards surface
    const dist = r * (0.8 + Math.random() * 0.2);

    const x = dist * Math.cos(theta);
    const z = dist * Math.sin(theta);
    const actualY = (y * height) - (height / 2);
    
    points.push(new THREE.Vector3(x, actualY, z));
  }
  return points;
};

// Biased distribution (more at bottom)
export const generateLowerBiasedConePoints = (count: number, radius: number, height: number) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    // Power curve to bias y towards 0 (bottom)
    const rVal = Math.random();
    const y = Math.pow(rVal, 1.8); 
    
    const r = (radius * (1 - y)) + 0.5; 
    const theta = Math.random() * Math.PI * 2;
    
    const dist = r * (0.8 + Math.random() * 0.2);

    const x = dist * Math.cos(theta);
    const z = dist * Math.sin(theta);
    const actualY = (y * height) - (height / 2);
    
    points.push(new THREE.Vector3(x, actualY, z));
  }
  return points;
};

// Generate points for a 3D Sphere (Explosion shape)
export const generateSpherePoints = (count: number, radius: number) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    // Random point in sphere
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    
    // Radius variation for volumetric look
    const r = radius * Math.cbrt(Math.random());

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
};

// Generate circular positions for photos
export const generateRingPositions = (count: number, radius: number) => {
  const points: { pos: THREE.Vector3, rot: THREE.Euler }[] = [];
  const angleStep = (Math.PI * 2) / count;
  
  for (let i = 0; i < count; i++) {
    const theta = i * angleStep;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    
    // Look at center
    const rotation = new THREE.Euler(0, -theta + Math.PI / 2, 0);

    points.push({
      pos: new THREE.Vector3(x, 0, z),
      rot: rotation
    });
  }
  return points;
};

// Generate points on a flat disc (for gifts at base)
export const generateDiscPoints = (count: number, radius: number, yLevel: number) => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(Math.random()) * radius;
    const theta = Math.random() * Math.PI * 2;
    
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    
    points.push(new THREE.Vector3(x, yLevel, z));
  }
  return points;
};
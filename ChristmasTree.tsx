import React, { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store';
import { 
  generateTreePoints, 
  generateSpherePoints, 
  generateSpiralPoints, 
  generateRingPositions, 
  generateIrregularConePoints,
  generateConeSurfacePoints,
  generateDiscPoints,
  generateLowerBiasedConePoints
} from '../utils/geometry';

// Configuration
const PARTICLE_COUNT = 15000; 
const SEQUIN_COUNT = 3500;    
const TINY_SPARKLE_COUNT = 3500; 
const SNOWFLAKE_COUNT = 900; 
const GIFT_ON_TREE_COUNT = 70; 
const GIFT_BASE_COUNT = 40;    
const TOTAL_GIFTS = GIFT_ON_TREE_COUNT + GIFT_BASE_COUNT;
const MAX_PHOTOS = 12; // Fixed number of photo frames

const TREE_HEIGHT = 12;
const TREE_RADIUS = 4;
const EXPLOSION_RADIUS = 15;
const PHOTO_RING_RADIUS = 12;

const dummy = new THREE.Object3D();
const dummyBow = new THREE.Object3D();
const _vec3 = new THREE.Vector3();
const _color = new THREE.Color();
const _origin = new THREE.Vector3(0,0,0);

export const ChristmasTree = () => {
  const { phase, setPhase, photos, setActivePhotoIndex } = useStore();
  
  // Refs
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const sequinsRef = useRef<THREE.InstancedMesh>(null);
  const tinySparklesRef = useRef<THREE.InstancedMesh>(null);
  const snowflakesRef = useRef<THREE.InstancedMesh>(null);
  const decorationRef = useRef<THREE.InstancedMesh>(null);
  const goldDecorationRef = useRef<THREE.InstancedMesh>(null);
  
  const giftsRef = useRef<THREE.InstancedMesh>(null);
  const ribbon1Ref = useRef<THREE.InstancedMesh>(null); 
  const ribbon2Ref = useRef<THREE.InstancedMesh>(null); 
  const bowsRef = useRef<THREE.InstancedMesh>(null);

  const groupRef = useRef<THREE.Group>(null);
  const photosGroupRef = useRef<THREE.Group>(null);

  const { mouse, viewport } = useThree();
  const [hovered, setHover] = useState(false);

  // --- Geometry Generation ---
  const treeLeaves = useMemo(() => generateTreePoints(PARTICLE_COUNT, TREE_RADIUS, TREE_HEIGHT), []);
  const sphereLeaves = useMemo(() => generateSpherePoints(PARTICLE_COUNT, EXPLOSION_RADIUS), []);
  
  const treeSequins = useMemo(() => generateConeSurfacePoints(SEQUIN_COUNT, TREE_RADIUS + 0.3, TREE_HEIGHT), []);
  const sphereSequins = useMemo(() => generateSpherePoints(SEQUIN_COUNT, EXPLOSION_RADIUS * 1.1), []);

  const treeTiny = useMemo(() => generateConeSurfacePoints(TINY_SPARKLE_COUNT, TREE_RADIUS + 0.2, TREE_HEIGHT), []);
  const sphereTiny = useMemo(() => generateSpherePoints(TINY_SPARKLE_COUNT, EXPLOSION_RADIUS * 0.9), []);

  const treeSnowflakes = useMemo(() => generateConeSurfacePoints(SNOWFLAKE_COUNT, TREE_RADIUS + 0.5, TREE_HEIGHT), []);
  const sphereSnowflakes = useMemo(() => generateSpherePoints(SNOWFLAKE_COUNT, EXPLOSION_RADIUS * 1.2), []);

  const treeRed = useMemo(() => generateSpiralPoints(150, TREE_RADIUS + 0.4, TREE_HEIGHT, 4), []);
  const sphereRed = useMemo(() => generateSpherePoints(150, EXPLOSION_RADIUS * 0.8), []);

  const treeGold = useMemo(() => generateIrregularConePoints(120, TREE_RADIUS, TREE_HEIGHT), []);
  const sphereGold = useMemo(() => generateSpherePoints(120, EXPLOSION_RADIUS * 0.9), []);
  
  const treeGiftPoints = useMemo(() => generateLowerBiasedConePoints(GIFT_ON_TREE_COUNT, TREE_RADIUS * 0.85, TREE_HEIGHT), []);
  const baseGiftPoints = useMemo(() => generateDiscPoints(GIFT_BASE_COUNT, TREE_RADIUS * 1.0, -TREE_HEIGHT/2 + 0.4), []);
  
  const allTreeGifts = useMemo(() => [...treeGiftPoints, ...baseGiftPoints], [treeGiftPoints, baseGiftPoints]);
  const sphereGifts = useMemo(() => generateSpherePoints(TOTAL_GIFTS, EXPLOSION_RADIUS * 1.3), []);

  const photoPositions = useMemo(() => generateRingPositions(MAX_PHOTOS, PHOTO_RING_RADIUS), []);

  // Physics state
  const leavesCurrent = useMemo(() => treeLeaves.map(p => p.clone()), [treeLeaves]);
  const sequinsCurrent = useMemo(() => treeSequins.map(p => p.clone()), [treeSequins]);
  const tinyCurrent = useMemo(() => treeTiny.map(p => p.clone()), [treeTiny]);
  const snowflakesCurrent = useMemo(() => treeSnowflakes.map(p => p.clone()), [treeSnowflakes]);
  const redCurrent = useMemo(() => treeRed.map(p => p.clone()), [treeRed]);
  const goldCurrent = useMemo(() => treeGold.map(p => p.clone()), [treeGold]);
  const giftsCurrent = useMemo(() => allTreeGifts.map(p => p.clone()), [allTreeGifts]);
  
  const randomRotations = useMemo(() => {
      return Array.from({length: PARTICLE_COUNT}).map(() => new THREE.Euler(
          Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI
      ));
  }, []);

  const giftRotations = useMemo(() => {
    return Array.from({length: TOTAL_GIFTS}).map(() => new THREE.Euler(
        0, Math.random() * Math.PI * 2, 0
    ));
  }, []);

  const giftColors = useMemo(() => {
    const palette = ['#D32F2F', '#388E3C', '#FBC02D', '#1976D2', '#7B1FA2', '#E91E63'];
    return Array.from({length: TOTAL_GIFTS}).map(() => new THREE.Color(palette[Math.floor(Math.random() * palette.length)]));
  }, []);

  const bowColors = useMemo(() => {
     const palette = ['#FFD700', '#FFFFFF', '#F0E68C'];
     return Array.from({length: TOTAL_GIFTS}).map(() => new THREE.Color(palette[Math.floor(Math.random() * palette.length)]));
  }, []);

  const sequinColors = useMemo(() => {
    const palette = ['#FFFACD', '#EEE8AA', '#F0E68C', '#FFD700', '#FFFAF0'];
    return Array.from({length: SEQUIN_COUNT}).map(() => new THREE.Color(palette[Math.floor(Math.random() * palette.length)]));
  }, []);

  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 5;
    const rOuter = 0.7;
    const rInner = 0.35;
    
    for(let i=0; i<sides*2; i++){
        const r = (i % 2 === 0) ? rOuter : rInner;
        const a = Math.PI / 2 + i * (Math.PI / 5);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if(i===0) shape.moveTo(x,y);
        else shape.lineTo(x,y);
    }
    shape.closePath();
    
    const geom = new THREE.ExtrudeGeometry(shape, {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.05,
        bevelSegments: 2
    });
    geom.center();
    return geom;
  }, []);
  
  const progress = useRef({ value: 0 });

  useEffect(() => {
    if (phase === 'blooming') {
      gsap.to(progress.current, {
        value: 1,
        duration: 2.5,
        ease: 'elastic.out(1, 0.5)',
        onComplete: () => setPhase('nebula')
      });
    } else if (phase === 'collapsing') {
      gsap.to(progress.current, {
        value: 0,
        duration: 2,
        ease: 'power3.inOut',
        onComplete: () => setPhase('tree')
      });
    }
  }, [phase, setPhase]);

  const updateMesh = (
    ref: React.RefObject<THREE.InstancedMesh>, 
    count: number, 
    currentPositions: THREE.Vector3[], 
    targetPositions: THREE.Vector3[], 
    sourcePositions: THREE.Vector3[],
    scaleBase: number,
    time: number,
    isLeaf: boolean = false
  ) => {
    if (!ref.current) return;
    const isTree = progress.current.value < 0.5;

    for (let i = 0; i < count; i++) {
        const src = sourcePositions[i];
        const tgt = targetPositions[i];
        
        const tx = THREE.MathUtils.lerp(src.x, tgt.x, progress.current.value);
        const ty = THREE.MathUtils.lerp(src.y, tgt.y, progress.current.value);
        const tz = THREE.MathUtils.lerp(src.z, tgt.z, progress.current.value);

        const cur = currentPositions[i];

        cur.x += (tx - cur.x) * 0.1;
        cur.y += (ty - cur.y) * 0.1;
        cur.z += (tz - cur.z) * 0.1;
        
        cur.y += Math.sin(time * 2 + i * 0.1) * 0.005;

        // Interaction
        if (isTree && hovered) {
             const dx = cur.x - _vec3.x;
             const dy = cur.y - _vec3.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist < 2.5) {
                 const force = (2.5 - dist) * 0.5;
                 cur.x += dx * force;
                 cur.y += dy * force;
                 cur.z += (Math.random() - 0.5) * force;
             }
        }

        dummy.position.set(cur.x, cur.y, cur.z);

        if (isLeaf) {
            const rot = randomRotations[i];
            dummy.rotation.set(rot.x + time * 0.5, rot.y + time * 0.5, rot.z);
        } else {
             dummy.lookAt(0,0,0);
             dummy.rotation.z += time;
        }

        let s = scaleBase;
        if (isLeaf) s *= THREE.MathUtils.lerp(1, 0.5, progress.current.value);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  };

  useFrame((state, delta) => {
      if (!groupRef.current) return;
      const time = state.clock.getElapsedTime();
      _vec3.set(mouse.x * viewport.width / 2, mouse.y * viewport.height / 2, 0);

      updateMesh(leavesRef, PARTICLE_COUNT, leavesCurrent, sphereLeaves, treeLeaves, 1, time, true);
      
      if (sequinsRef.current) {
         updateMesh(sequinsRef, SEQUIN_COUNT, sequinsCurrent, sphereSequins, treeSequins, 1, time);
         for(let i=0; i<SEQUIN_COUNT; i++) {
             const c = sequinColors[i];
             const flicker = Math.sin(time * 5 + i) * 0.5 + 0.5;
             _color.set(c).multiplyScalar(flicker * 2);
             sequinsRef.current.setColorAt(i, _color);
         }
         if (sequinsRef.current.instanceColor) sequinsRef.current.instanceColor.needsUpdate = true;
      }

      if (tinySparklesRef.current) {
         updateMesh(tinySparklesRef, TINY_SPARKLE_COUNT, tinyCurrent, sphereTiny, treeTiny, 1, time);
         for(let i=0; i<TINY_SPARKLE_COUNT; i++) {
             const scale = (Math.sin(time * 8 + i * 2) + 1) * 0.5; 
             dummy.scale.setScalar(scale); 
         }
      }

      if (giftsRef.current && bowsRef.current && ribbon1Ref.current && ribbon2Ref.current) {
         updateMesh(giftsRef, TOTAL_GIFTS, giftsCurrent, sphereGifts, allTreeGifts, 1, time);
         
         const pValue = progress.current.value;
         const s = THREE.MathUtils.lerp(1, 0.5, pValue);

         for(let i=0; i<TOTAL_GIFTS; i++) {
             const pos = giftsCurrent[i];
             const rot = giftRotations[i];

             const rX = rot.x + (pValue * time * 0.5);
             const rY = rot.y + (pValue * time * 0.5);
             const rZ = rot.z + (pValue * time * 0.5);

             dummy.position.set(pos.x, pos.y, pos.z);
             dummy.rotation.set(rX, rY, rZ);
             dummy.scale.setScalar(s);
             dummy.updateMatrix();
             giftsRef.current.setMatrixAt(i, dummy.matrix);

             dummy.scale.set(s * 1.02, s * 1.02, s * 0.15); 
             dummy.updateMatrix();
             ribbon1Ref.current.setMatrixAt(i, dummy.matrix);

             dummy.scale.set(s * 0.15, s * 1.02, s * 1.02);
             dummy.updateMatrix();
             ribbon2Ref.current.setMatrixAt(i, dummy.matrix);

             const up = _vec3.set(0, 0.2 * s, 0).applyEuler(new THREE.Euler(rX, rY, rZ));
             
             dummyBow.position.set(pos.x + up.x, pos.y + up.y, pos.z + up.z);
             dummyBow.rotation.set(rX + Math.PI/2, rY, rZ); 
             dummyBow.scale.setScalar(s);
             dummyBow.updateMatrix();
             bowsRef.current.setMatrixAt(i, dummyBow.matrix);
             
             giftsRef.current.setColorAt(i, giftColors[i]);
             const bowCol = bowColors[i];
             bowsRef.current.setColorAt(i, bowCol);
             ribbon1Ref.current.setColorAt(i, bowCol);
             ribbon2Ref.current.setColorAt(i, bowCol);
         }
         
         giftsRef.current.instanceMatrix.needsUpdate = true;
         if (giftsRef.current.instanceColor) giftsRef.current.instanceColor.needsUpdate = true;
         
         bowsRef.current.instanceMatrix.needsUpdate = true;
         if (bowsRef.current.instanceColor) bowsRef.current.instanceColor.needsUpdate = true;
         
         ribbon1Ref.current.instanceMatrix.needsUpdate = true;
         if (ribbon1Ref.current.instanceColor) ribbon1Ref.current.instanceColor.needsUpdate = true;

         ribbon2Ref.current.instanceMatrix.needsUpdate = true;
         if (ribbon2Ref.current.instanceColor) ribbon2Ref.current.instanceColor.needsUpdate = true;
      }

      updateMesh(snowflakesRef, SNOWFLAKE_COUNT, snowflakesCurrent, sphereSnowflakes, treeSnowflakes, 1, time);
      updateMesh(decorationRef, 150, redCurrent, sphereRed, treeRed, 1, time);
      updateMesh(goldDecorationRef, 120, goldCurrent, sphereGold, treeGold, 1, time);

      if (phase === 'tree') {
        groupRef.current.rotation.y += delta * 0.1;
      } else if (phase === 'nebula') {
        // OPTIMIZATION: Read nebulaRotation directly from store state to avoid React re-renders
        const targetRotation = useStore.getState().nebulaRotation;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.1);
      }
  });

  return (
    <group 
      ref={groupRef} 
      onPointerOver={() => setHover(true)} 
      onPointerOut={() => setHover(false)}
    >
      <instancedMesh ref={leavesRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <octahedronGeometry args={[0.05, 0]} /> 
        <meshStandardMaterial color="#2d5a27" emissive="#1a3316" emissiveIntensity={0.2} roughness={0.6} metalness={0.1} flatShading={true} />
      </instancedMesh>

      <instancedMesh ref={sequinsRef} args={[undefined, undefined, SEQUIN_COUNT]}>
        <circleGeometry args={[0.04, 8]} />
        <meshStandardMaterial roughness={0.1} metalness={1.0} toneMapped={false} side={THREE.DoubleSide} />
      </instancedMesh>

      <instancedMesh ref={tinySparklesRef} args={[undefined, undefined, TINY_SPARKLE_COUNT]}>
        <tetrahedronGeometry args={[0.02, 0]} />
        <meshStandardMaterial color="#FFFACD" emissive="#FFFACD" emissiveIntensity={5} toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={snowflakesRef} args={[undefined, undefined, SNOWFLAKE_COUNT]}>
        <dodecahedronGeometry args={[0.03, 0]} />
        <meshStandardMaterial color="#E0F7FA" emissive="#E0F7FA" emissiveIntensity={0.8} roughness={0.2} />
      </instancedMesh>

      <instancedMesh ref={decorationRef} args={[undefined, undefined, 150]}>
        <sphereGeometry args={[0.1, 16, 16]} /> 
        <meshStandardMaterial color="#ff0044" roughness={0.1} metalness={0.8} emissive="#550000" emissiveIntensity={0.3} />
      </instancedMesh>

      <instancedMesh ref={goldDecorationRef} args={[undefined, undefined, 120]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#ffcc00" roughness={0.05} metalness={1.0} emissive="#aa8800" emissiveIntensity={0.5} />
      </instancedMesh>

      <instancedMesh ref={giftsRef} args={[undefined, undefined, TOTAL_GIFTS]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial roughness={0.3} metalness={0.1} />
      </instancedMesh>

      <instancedMesh ref={ribbon1Ref} args={[undefined, undefined, TOTAL_GIFTS]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial roughness={0.2} metalness={0.6} />
      </instancedMesh>

      <instancedMesh ref={ribbon2Ref} args={[undefined, undefined, TOTAL_GIFTS]}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial roughness={0.2} metalness={0.6} />
      </instancedMesh>

      <instancedMesh ref={bowsRef} args={[undefined, undefined, TOTAL_GIFTS]}>
        <torusKnotGeometry args={[0.12, 0.04, 64, 8, 2, 3]} />
        <meshStandardMaterial roughness={0.2} metalness={0.6} />
      </instancedMesh>

      <mesh position={[0, TREE_HEIGHT / 2 + 0.5, 0]}>
         <primitive object={starGeometry} />
         <meshStandardMaterial 
            color="#FFD700" 
            emissive="#FFD700" 
            emissiveIntensity={3} 
            toneMapped={false} 
            roughness={0.1}
            metalness={1}
         />
      </mesh>

      <group ref={photosGroupRef}>
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
            <PhotoSlot 
                key={`${i}-${photos[i] || 'empty'}`} 
                index={i}
                url={photos[i] || null} 
                position={photoPositions[i] ? photoPositions[i].pos : _origin}
                rotation={photoPositions[i] ? photoPositions[i].rot : new THREE.Euler()}
                globalProgress={progress}
            />
        ))}
      </group>
    </group>
  );
};

// --- Helper Components ---

const usePhotoFrameAnimation = (meshRef: any, position: any, globalProgress: any, active: boolean) => {
    useFrame(() => {
        if (!meshRef.current) return;
        const p = globalProgress.current.value;
        const scale = THREE.MathUtils.lerp(0, 1, Math.max(0, (p - 0.7) * 3.3));
        const hoverScale = active ? 1.1 : 1.0;
        meshRef.current.scale.setScalar(scale * hoverScale);
        meshRef.current.position.lerpVectors(_origin, position, p);
    });
};

const PhotoSlot = ({ url, ...props }: any) => {
    return (
        <Suspense fallback={<BlankPhotoFrame {...props} />}>
            {url ? (
                <LoadedPhotoFrame url={url} {...props} />
            ) : (
                <BlankPhotoFrame {...props} />
            )}
        </Suspense>
    );
};

const BlankPhotoFrame = ({ position, rotation, index, globalProgress }: any) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [active, setActive] = useState(false);
    
    usePhotoFrameAnimation(meshRef, position, globalProgress, active);
    
    // Default Dimensions
    const w = 2.5;
    const h = 3.5;
    
    return (
         <group rotation={rotation}>
            <mesh 
                ref={meshRef}
                onPointerOver={() => setActive(true)}
                onPointerOut={() => setActive(false)}
            >
                <planeGeometry args={[w, h]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

const LoadedPhotoFrame = ({ url, position, rotation, index, globalProgress }: any) => {
    const groupRef = useRef<THREE.Group>(null);
    const texture = useTexture(url);
    const [active, setActive] = useState(false);
    const { setActivePhotoIndex } = useStore();

    // Safe image dimensions
    const imgW = (texture.image?.width && texture.image.width > 0) ? texture.image.width : 400;
    const imgH = (texture.image?.height && texture.image.height > 0) ? texture.image.height : 500;
    
    let aspect = imgW / imgH;
    if (!Number.isFinite(aspect) || aspect === 0) aspect = 0.8;

    const MAX_DIMENSION = 3.8;
    let photoW, photoH;

    if (aspect >= 1) {
        photoW = MAX_DIMENSION;
        photoH = MAX_DIMENSION / aspect;
    } else {
        photoH = MAX_DIMENSION;
        photoW = MAX_DIMENSION * aspect;
    }

    usePhotoFrameAnimation(groupRef, position, globalProgress, active);

    return (
        <group rotation={rotation}>
            <group 
                ref={groupRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setActive(!active);
                    setActivePhotoIndex(index);
                }}
                onPointerOver={() => { setActive(true); document.body.style.cursor = 'pointer'; }}
                onPointerOut={() => { setActive(false); document.body.style.cursor = 'auto'; }}
            >
                <mesh position={[0, 0, 0.01]}>
                    <planeGeometry args={[photoW, photoH]} />
                    <meshBasicMaterial map={texture} toneMapped={false} side={THREE.FrontSide} />
                </mesh>
                <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[photoW, photoH]} />
                    <meshBasicMaterial map={texture} toneMapped={false} side={THREE.FrontSide} />
                </mesh>
            </group>
        </group>
    );
};
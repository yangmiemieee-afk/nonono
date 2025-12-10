import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Sparkles, Stars } from '@react-three/drei';
import { ChristmasTree } from './ChristmasTree';
import { useStore } from '../store';

const Scene = () => {
  const { phase } = useStore();

  return (
    <Canvas
      camera={{ position: [0, 2, 25], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: false, toneMappingExposure: 1.5 }}
    >
      <color attach="background" args={['#050505']} />
      
      <Suspense fallback={null}>
        {/* Dynamic Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={500} scale={20} size={2} speed={0.4} opacity={0.5} color="#ffd700" />
        
        {/* HDR Lighting */}
        <Environment preset="city" background={false} blur={1} />
        
        {/* Scene Lights */}
        <pointLight position={[10, 10, 10]} color="#ffaa00" intensity={2} distance={50} decay={2} />
        <pointLight position={[-10, 5, -10]} color="#4455ff" intensity={2} distance={50} decay={2} />
        
        <spotLight 
          position={[0, 20, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={3} 
          color="#ffffff" 
          castShadow 
        />

        <ChristmasTree />

        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 2}
            minDistance={10}
            maxDistance={40}
            autoRotate={phase === 'tree'}
            autoRotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
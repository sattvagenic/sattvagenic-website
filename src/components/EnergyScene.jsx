// src/components/EnergyScene.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import EnergyBody from '../components/EnergyBody';

export default function EnergyScene() {
  return (
    <div style={{ width: '100%', height: '100vh', background: 'black' }}>
      <Canvas
        camera={{ position: [0, 1.2, 5], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        {/* background */}
        <color attach="background" args={['#000000']} />

        {/* lights */}
        <ambientLight intensity={0.35} />
        {/* a soft key light */}
        <directionalLight position={[4, 6, 4]} intensity={1.5} />

        {/* the subtle body */}
        <EnergyBody
          modelPath="/models/human.glb"
          modelScale={1}      // change if your model is huge/small (try 0.01 or 0.1)
          color="#4FD4C6"
          breathSpeed={0.33}
        />

        {/* controls to rotate/zoom the body */}
        <OrbitControls enableDamping dampingFactor={0.08} />

        {/* optional studio env reflections (subtle) */}
        <Environment preset="city" intensity={0.12} />   {/* or comment out for now */}
<EffectComposer>
  <Bloom
    intensity={0.9}             // was 1.2
    luminanceThreshold={0.35}   // was 0.15 -> fewer pixels glow
    luminanceSmoothing={0.85}
    radius={0.6}
  />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

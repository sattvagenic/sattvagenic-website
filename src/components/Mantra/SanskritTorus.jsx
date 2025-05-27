import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Text3D, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const mantra = [
  'ॐ', 'त्र्य', 'म्ब', 'कं', 'य', 'जा', 'म', 'हे',
  'सु', 'ग', 'न्धिं', 'पु', 'ष्टि', 'व', 'र्ध', 'न',
  'म्', 'उ', 'र्वा', 'रु', 'क', 'मि', 'व', 'ब',
  'न्ध', 'ना', 'न्', 'मृ', 'त्यो', 'र्मु', 'क्षी', 'य',
  'मा', 'मृ', 'ता', 'त्'
];

function CentralOm() {
  const omRef = useRef();
  const { scene } = useGLTF('/objects/om_symbol.glb'); // Ensure the path is correct

  useFrame(({ clock }) => {
    if (omRef.current) {
      const heartbeat = Math.sin(clock.getElapsedTime() * 2) * 0.05 + 1;
      omRef.current.scale.set(heartbeat * 0.2, heartbeat * 0.2, heartbeat * 0.2); // Pulsing scale
      omRef.current.rotation.y += 0.01; // Rotate slowly
    }
  });

  // Modify the material to add glow and brightness
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: '#FF9B4F',
        emissive: '#FF9B4F',
        emissiveIntensity: 3,
        metalness: 1,
        roughness: 1,
      });
    }
  });

  return (
    <group ref={omRef} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function ToroidalText() {
  const groupRef = useRef();
  const numLines = 54;
  const pointsPerLine = 68;
  const timeRef = useRef(0);

  const materials = useMemo(() => {
    const mats = [];
    for (let i = 0; i < pointsPerLine; i++) {
      mats.push(new THREE.MeshPhongMaterial({
        color: '#4FD4C6',
        emissive: '#4FD4C6',
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.9
      }));
    }
    return mats;
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      timeRef.current = time * 0.1;

      // Rotation
      groupRef.current.rotation.y = timeRef.current;

      // Breathing
      const breathing = 1 + Math.sin(time * 0.25) * 0.25;
      groupRef.current.scale.set(breathing, breathing, breathing);

      // Horizontal line glow
      groupRef.current.children.forEach((child) => {
        if (child.children[0] && child.children[0].material) {
          const verticalPosition = child.position.y;
          const glowPosition = Math.sin(time * 0.2) * 4.7;
          const distance = Math.abs(verticalPosition - glowPosition);
          const material = child.children[0].material;
          if (distance < 0.4) {
            material.emissiveIntensity = 1.5 - distance * 2;
          } else {
            material.emissiveIntensity = 0.7;
          }
        }
      });
    }
  });

  const textGroups = useMemo(() => {
    const groups = [];
    for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
      const phi = (lineIndex / numLines) * Math.PI * 2;

      for (let i = 0; i < pointsPerLine; i++) {
        const theta = (i / (pointsPerLine - 1)) * Math.PI - Math.PI / 2;
        const r = 4.7;
        const pinchFactor = 0.5;
        const sphereFactor = 1;
        const radius = r * (pinchFactor + Math.cos(theta) * (1 - pinchFactor));

        // Calculate position
        const x = radius * Math.cos(phi) * Math.cos(theta);
        const y = r * Math.sin(theta) * sphereFactor;
        const z = radius * Math.sin(phi) * Math.cos(theta);

        // Determine which character to use
        const charOffset = Math.floor((Math.sin(phi * 4) + 1) * mantra.length / 2);
        const charIndex = (i + charOffset) % mantra.length;
        const char = mantra[charIndex];

        groups.push(
          <group
            key={`char-${lineIndex}-${i}`}
            position={[x, y, z]}
            rotation={[0, phi + Math.PI / 2, 0]}
          >
            <Text3D
              font="/fonts/Noto Serif Devanagari_Regular.json"
              size={0.13}
              height={0.01}
              material={materials[i].clone()}
              center
            >
              {char}
            </Text3D>
          </group>
        );
      }
    }
    return groups;
  }, [materials]);

  return (
    <group ref={groupRef} rotation={[0.3, 0, 0]}>
      {textGroups}
      <CentralOm />
    </group>
  );
}

function SanskritTorus() {
  return (
    // Use full viewport or adjust height/width as needed
    <div style={{ width: '77vw', height: '80vh', backgroundColor: 'black' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <color attach="background" args={['#000']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <ToroidalText />
        <EffectComposer>
          <Bloom
            intensity={1.0}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default SanskritTorus;

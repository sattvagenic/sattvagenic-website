import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import * as THREE from 'three';

// Om Namah Shivaya characters in Devanagari
const mantra = ['ॐ', 'न', 'मः', 'शि', 'वा', 'य'];

function OmNamahShivayaTorus() {
  const groupRef = useRef();
  const numLines = 126; // More lines for denser character placement
  const pointsPerLine = 48; // Points around the torus
  const timeRef = useRef(0);

  // Create materials with different opacity levels for depth effect
  // Inside the OmNamahShivayaTorus component, ensure your materials are properly set up
const materials = useMemo(() => {
  const mats = [];
  for (let i = 0; i < pointsPerLine; i++) {
    mats.push(new THREE.MeshPhongMaterial({
      color: '#9900ff', // Amethyst purple
      emissive: '#9900ff',
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    }));
  }
  return mats;
}, []);

// Then in your useFrame function, make sure the glow effect is properly applied
useFrame(({ clock, camera }) => {
  if (groupRef.current) {
    const time = clock.getElapsedTime();
    
    // Rotation around y-axis
    groupRef.current.rotation.y = time * 0.05;
    
    // Breathing scale effect (subtle)
    const smallBreathing = 1 + Math.sin(time * 0.2) * 0.05;
    groupRef.current.scale.set(smallBreathing, smallBreathing, smallBreathing);
    
    // Forward/backward movement (z-axis)
    const zMovement = Math.sin(time * 0.1) * 3.0; // Increased range to come closer
    groupRef.current.position.z = zMovement;
    
    // Detect when torus approaches the camera to pass through hole
    if (zMovement > 2.5) { // When very close to camera
      // Check if we should be seeing through the hole
      // Calculate distance from camera to torus center
      const toCenterDist = Math.sqrt(
        groupRef.current.position.x * groupRef.current.position.x + 
        groupRef.current.position.y * groupRef.current.position.y
      );
      
      // If we're aligned with the hole and close enough
      if (toCenterDist < 0.5) {
        // Temporarily make the torus transparent as we "pass through"
        groupRef.current.children.forEach(child => {
          if (child.children && child.children[0] && child.children[0].material) {
            child.children[0].material.opacity = Math.max(0, 1 - (zMovement - 2.5) * 2);
          }
        });
      }
    } else {
      // Restore normal opacity
      groupRef.current.children.forEach(child => {
        if (child.children && child.children[0] && child.children[0].material) {
          child.children[0].material.opacity = 0.9;
        }
      });
    }
    
    // Flowing energy glow effect with enhanced intensity
    groupRef.current.children.forEach((child, index) => {
      if (child.children && child.children[0] && child.children[0].material) {
        // Create a wave of brightness that travels around the torus
        const materialIndex = index % pointsPerLine;
        const lineIndex = Math.floor(index / pointsPerLine);
        
        // Calculate position in the torus
        const phi = (lineIndex / numLines) * Math.PI * 2;
        const theta = (materialIndex / (pointsPerLine - 1)) * Math.PI * 2;
        
        // Create moving highlight effect
        const glowWave = (phi + theta - time * 0.5) % (Math.PI * 2);
        const glowIntensity = Math.pow(Math.cos(glowWave), 16); // Sharp peak for flowing effect
        
        // Ensure material exists and update its properties
        const material = child.children[0].material;
        if (material) {
          // Increase the base emissive intensity for more glow
          material.emissiveIntensity = 1.2 + glowIntensity * 2.5;
          material.opacity = 0.8 + glowIntensity * 0.2;
          
          // Make sure emissive color is set
          material.emissive.set('#9900ff');
          
          // Force material update
          material.needsUpdate = true;
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
        const theta = (i / pointsPerLine) * Math.PI * 2;
        
        // Torus parameters
        const R = 1.7; // Major radius
        const r = 1.3; // Tube radius
        
        // Calculate position on torus
        const x = (R + r * Math.cos(theta)) * Math.cos(phi);
        const y = (R + r * Math.cos(theta)) * Math.sin(phi);
        const z = r * Math.sin(theta);
        
        // Calculate orientation - tangent to the torus surface
        const tangentX = -Math.sin(phi);
        const tangentY = Math.cos(phi);
        const tangentZ = 0;
        
        const normal = new THREE.Vector3(
          Math.cos(phi) * Math.cos(theta),
          Math.sin(phi) * Math.cos(theta),
          Math.sin(theta)
        );
        
        // Determine which character to use
        // Create a pattern where the mantra repeats in a flowing manner
        const charIndex = (i + lineIndex) % mantra.length;
        const char = mantra[charIndex];
        
        // Create rotation matrix for orientation
        const lookAt = new THREE.Matrix4();
        const fromDirection = new THREE.Vector3(0, 0, 1);
        const toDirection = normal;
        lookAt.lookAt(new THREE.Vector3(0, 0, 0), toDirection, new THREE.Vector3(0, 1, 0));
        
        const euler = new THREE.Euler().setFromRotationMatrix(lookAt);
        
        // Size variation for visual interest
        const sizeVariation = (charIndex === 0) ? 0.10 : 0.10; // Om is larger
        
        groups.push(
          <group
            key={`char-${lineIndex}-${i}`}
            position={[x, z, y]} // Swap y and z for better default view
            rotation={[euler.x, euler.y, euler.z]}
          >
            <Text3D
              font="/fonts/Noto Serif Devanagari_Regular.json"
              size={sizeVariation}
              height={0.01}
              material={materials[i % materials.length].clone()}
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
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
      {textGroups}
    </group>
  );
}

export default OmNamahShivayaTorus;
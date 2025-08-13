// src/components/EnergyBody.jsx
import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, extend } from '@react-three/fiber';
import { useGLTF, shaderMaterial } from '@react-three/drei';

// Fresnel aura (soft)
const AuraMaterial = shaderMaterial(
  { time: 0, uColorInner: new THREE.Color('#4FD4C6'), uColorOuter: new THREE.Color('#FF9B4F'), uStrength: 1.0 },
  `varying vec3 vNormal; varying vec3 vWorldPos;
   void main(){ vNormal = normalize(normalMatrix*normal);
     vec4 wp = modelMatrix*vec4(position,1.0); vWorldPos = wp.xyz;
     gl_Position = projectionMatrix*viewMatrix*wp; }`,
  `uniform float time; uniform vec3 uColorInner; uniform vec3 uColorOuter; uniform float uStrength;
   varying vec3 vNormal; varying vec3 vWorldPos;
   float fresnelTerm(vec3 n, vec3 v){ return pow(1.0 - max(dot(normalize(n), normalize(v)), 0.0), 3.0); }
   void main(){
     vec3 viewDir = normalize(cameraPosition - vWorldPos);
     float f = fresnelTerm(vNormal, viewDir) * uStrength;
     vec3 col = mix(uColorInner, uColorOuter, f);
     float alpha = 0.06 + 0.25 * f;   // light fill so edges pop
     gl_FragColor = vec4(col, alpha);
   }`
);
extend({ AuraMaterial });

export default function EnergyBody({
  modelPath = '/models/human.glb',
  color = '#4FD4C6',
  position = [0, -0.9, 0],
  modelScale = 1,
  breathSpeed = 0.33,
}) {
  const group = useRef();
  const auraGroup = useRef();
  const linesGroup = useRef();

  useEffect(() => { useGLTF.preload(modelPath); }, [modelPath]);
  const { scene } = useGLTF(modelPath);

  const baseAuraMat = useMemo(() => new AuraMaterial(), []);
  const lineMat = useMemo(() => new THREE.LineBasicMaterial({
    color, transparent: true, opacity: 0.95
  }), [color]);

  // deep clone for aura so it matches body exactly
  const auraScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    // 1) make the base mesh nearly invisible (we render edges on top)
    scene.traverse((c) => {
      if (c.isMesh) {
        c.material = new THREE.MeshBasicMaterial({
          color: 0x000000, transparent: true, opacity: 0.02, depthWrite: false
        });
        c.renderOrder = 1; // draw first
      }
    });

    // 2) aura shell that does not occlude
    auraScene.traverse((c) => {
      if (c.isMesh) {
        const mat = baseAuraMat.clone();
        mat.transparent = true;
        mat.blending = THREE.AdditiveBlending;
        mat.side = THREE.BackSide;
        mat.depthWrite = false; // don't block lines
        mat.depthTest = true;
        c.material = mat;
        c.renderOrder = 2;
      }
    });

    // 3) crisp edge overlay (always visible)
    const edgeMeshes = [];
    scene.traverse((c) => {
      if (c.isMesh && c.geometry) {
        const edgesGeo = new THREE.EdgesGeometry(c.geometry, 20);
        const edges = new THREE.LineSegments(edgesGeo, lineMat.clone());
        edges.position.copy(c.position);
        edges.quaternion.copy(c.quaternion);
        edges.scale.copy(c.scale);
        edges.material.depthTest = false; // always on top
        edges.renderOrder = 3;            // draw last
        edgeMeshes.push(edges);
      }
    });

    group.current.add(scene);
    auraGroup.current.add(auraScene);
    edgeMeshes.forEach((m) => linesGroup.current.add(m));

    auraGroup.current.scale.setScalar(1.02); // sits just outside
  }, [scene, auraScene, baseAuraMat, lineMat]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) group.current.rotation.y = t * 0.05;

    // animate aura + breath
    auraGroup.current?.traverse((m) => {
      if (m.material && 'time' in m.material) m.material.time = t;
    });
    const exhale = (Math.sin(t * breathSpeed) + 1) * 0.5;
    const auraScale = 1.02 * (1.0 + exhale * 0.05);
    auraGroup.current?.scale.setScalar(auraScale);
  });

  return (
    <group ref={group} position={position} scale={modelScale}>
      <group ref={auraGroup} />
      <group ref={linesGroup} />
    </group>
  );
}

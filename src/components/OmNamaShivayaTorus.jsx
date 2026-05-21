import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Om Namah Shivaya Torus — Mantra Roopa
 * 
 * v3: Abhisheka flash + Spanda pulse
 *
 * New sacred events:
 *   – Abhisheka: sudden cascade of bone-white luminosity,
 *     like milk poured over a lingam, originating from a point
 *     and flowing across the surface
 *   – Spanda: the divine tremor, a ripple of intensity
 *     emanating outward from a random point, as if the form
 *     just felt something
 *
 * Both events are rare and unpredictable — the anticipation
 * and surprise is part of what creates awe.
 */

const mantra = ['ॐ', 'न', 'मः', 'शि', 'वा', 'य'];
const PHI = 1.618033988749895;

// ─── Palette ───────────────────────────────────────────────
// Shifted for amber/crystal aesthetic - warmer, more luminous at rest
const PALETTE = {
  base:           new THREE.Color('#2a1505'),  // deep amber
  emissiveRest:   new THREE.Color('#6a3510'),  // warm amber glow at rest (brighter)
  emissiveAlive:  new THREE.Color('#a85a20'),  // medium amber
  emissiveBright: new THREE.Color('#e8943a'),  // bright amber — wave peak
  bindu:          new THREE.Color('#f0e8d8'),  // warm bone white
  abhisheka:      new THREE.Color('#fffef8'),  // pure milk white
};

// ─── Geometry parameters ───────────────────────────────────
const NUM_LINES = 126;
const POINTS_PER_LINE = 48;
const TOTAL_CHARS = NUM_LINES * POINTS_PER_LINE;
const MAJOR_RADIUS = 1.7;
const TUBE_RADIUS = 1.3;


function OmNamahShivayaTorus() {
  const groupRef = useRef();

  // ─── Sentient state ────────────────────────────────────
  const sentient = useRef({
    timer: 0,
    nextMove: 7 + Math.random() * 12,
    target: { x: 0, y: 0, z: 0 },
    current: { x: 0, y: 0, z: 0 },
  });

  // ─── Sacred events state ───────────────────────────────
  // Using absolute clock times instead of countdown for reliability
  const sacredEvents = useRef({
    // Abhisheka — milk pour flash
    abhisheka: {
      active: false,
      nextTrigger: 5 + Math.random() * 10,  // first event at 5-15s
      startTime: 0,
      duration: 1.8,
      origin: { phi: 0, theta: 0 },
    },
    // Spanda — divine tremor ripple
    spanda: {
      active: false,
      nextTrigger: 8 + Math.random() * 12,  // first event at 8-20s
      startTime: 0,
      duration: 2.5,
      origin: { phi: 0, theta: 0 },
      speed: 3.5,
    },
  });

  // ─── Precompute character positions for distance calculations ───
  const charPositions = useMemo(() => {
    const positions = [];
    for (let line = 0; line < NUM_LINES; line++) {
      const phi = (line / NUM_LINES) * Math.PI * 2;
      for (let col = 0; col < POINTS_PER_LINE; col++) {
        const theta = (col / POINTS_PER_LINE) * Math.PI * 2;
        positions.push({ phi, theta, line, col });
      }
    }
    return positions;
  }, []);

  // ─── Materials ─────────────────────────────────────────
  // MeshStandardMaterial with warmer amber palette.
  // Transmission doesn't work reliably with 6000+ small text meshes.
  const materials = useMemo(() => {
    const mats = [];
    for (let i = 0; i < TOTAL_CHARS; i++) {
      const line = Math.floor(i / POINTS_PER_LINE);
      const col  = i % POINTS_PER_LINE;
      const patina = Math.sin(line * 0.37) * Math.cos(col * 0.23);

      mats.push(new THREE.MeshStandardMaterial({
        color:            PALETTE.base,
        emissive:         PALETTE.emissiveRest.clone(),
        emissiveIntensity: 0.7 + patina * 0.15,
        metalness:        0.85,
        roughness:        0.2 + patina * 0.06 + Math.random() * 0.04,
        envMapIntensity:  1.2,
        transparent:      true,
        opacity:          0.95,
      }));
    }
    return mats;
  }, []);


  // ─── Helper: angular distance on torus surface ─────────
  const angularDistance = (phi1, theta1, phi2, theta2) => {
    // Approximate geodesic distance on torus surface
    const dPhi = Math.abs(phi1 - phi2);
    const dTheta = Math.abs(theta1 - theta2);
    // Wrap around
    const dPhiWrap = Math.min(dPhi, Math.PI * 2 - dPhi);
    const dThetaWrap = Math.min(dTheta, Math.PI * 2 - dTheta);
    return Math.sqrt(dPhiWrap * dPhiWrap + dThetaWrap * dThetaWrap);
  };


  // ─── Animation loop ────────────────────────────────────
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t  = clock.getElapsedTime();
    const dt = 0.016;

    // ── Organic breathing ──
    const breath1  = Math.sin(t * 0.17);
    const breath2  = Math.sin(t * 0.17 * PHI) * 0.32;
    const breath3  = Math.sin(t * 0.17 * PHI * PHI) * 0.11;
    const deepTide = Math.sin(t * 0.055) * 0.08;
    const combined = (breath1 + breath2 + breath3 + deepTide) / 1.51;

    const s = 1 + combined * 0.035;
    groupRef.current.scale.set(s, s, s);

    groupRef.current.rotation.y = t * 0.03;

    // ── Sentient micro-movements ──
    const ss = sentient.current;
    ss.timer += dt;

    if (ss.timer > ss.nextMove) {
      ss.target = {
        x: (Math.random() - 0.5) * 0.025,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.025,
      };
      ss.timer = 0;
      ss.nextMove = 7 + Math.random() * 18;
    }

    const lr = 0.003;
    ss.current.x += (ss.target.x - ss.current.x) * lr;
    ss.current.y += (ss.target.y - ss.current.y) * lr;
    ss.current.z += (ss.target.z - ss.current.z) * lr;

    groupRef.current.rotation.x = Math.PI / 2 + ss.current.x;
    groupRef.current.rotation.z = ss.current.z;

    groupRef.current.position.z = Math.sin(t * 0.06) * 1.6;


    // ╔═══════════════════════════════════════════════════╗
    // ║  SACRED EVENTS                                   ║
    // ╚═══════════════════════════════════════════════════╝

    const events = sacredEvents.current;

    // ── Abhisheka trigger ──
    if (!events.abhisheka.active) {
      if (t >= events.abhisheka.nextTrigger) {
        // Trigger abhisheka
        events.abhisheka.active = true;
        events.abhisheka.startTime = t;
        // Origin point — biased toward upper portion (like pouring from above)
        events.abhisheka.origin = {
          phi: Math.random() * Math.PI * 2,
          theta: Math.PI * 0.3 + Math.random() * Math.PI * 0.4,  // upper hemisphere
        };
      }
    } else {
      // Check if abhisheka has finished
      const elapsed = t - events.abhisheka.startTime;
      if (elapsed > events.abhisheka.duration + 0.8) {
        events.abhisheka.active = false;
        events.abhisheka.nextTrigger = t + 15 + Math.random() * 20;  // next in 15-35s
      }
    }

    // ── Spanda trigger ──
    if (!events.spanda.active) {
      if (t >= events.spanda.nextTrigger) {
        // Trigger spanda
        events.spanda.active = true;
        events.spanda.startTime = t;
        // Random origin point anywhere on the surface
        events.spanda.origin = {
          phi: Math.random() * Math.PI * 2,
          theta: Math.random() * Math.PI * 2,
        };
      }
    } else {
      const elapsed = t - events.spanda.startTime;
      if (elapsed > events.spanda.duration + 0.5) {
        events.spanda.active = false;
        events.spanda.nextTrigger = t + 18 + Math.random() * 25;  // next in 18-43s
      }
    }


    // ── Bindu moment detection ──
    const isBindu = combined > 0.75;
    const binduStrength = isBindu ? Math.pow((combined - 0.75) / 0.25, 2.5) : 0;


    // ╔═══════════════════════════════════════════════════╗
    // ║  PER-CHARACTER ILLUMINATION                      ║
    // ╚═══════════════════════════════════════════════════╝

    const children = groupRef.current.children;
    for (let idx = 0; idx < children.length; idx++) {
      const mesh = children[idx].children?.[0];
      if (!mesh?.material) continue;

      const mat     = mesh.material;
      const pos     = charPositions[idx];
      const charIdx = (pos.col + pos.line) % mantra.length;

      // ── Base waves ──
      const wavePhase = (pos.phi + pos.theta * 0.5 - t * 0.4) % (Math.PI * 2);
      const mantraGlow = Math.pow(Math.max(0, Math.cos(wavePhase)), 4) * 0.7;

      const wave2Phase = (pos.phi * 1.5 - pos.theta * 0.3 + t * 0.25) % (Math.PI * 2);
      const secondaryGlow = Math.pow(Math.max(0, Math.cos(wave2Phase)), 6) * 0.25;

      const pulse = Math.sin(t * (0.35 + charIdx * 0.07 * PHI)) * 0.05;
      const patina = Math.sin(pos.line * 0.37) * Math.cos(pos.col * 0.23) * 0.12 + 0.88;
      const breathGlow = (combined * 0.5 + 0.5) * 0.25;

      let intensity = Math.max(0.5,  // raised floor for amber material visibility
        0.5 * patina + breathGlow + mantraGlow + secondaryGlow + pulse
      );


      // ── Abhisheka contribution ──
      let abhishekaGlow = 0;
      if (events.abhisheka.active) {
        const elapsed = t - events.abhisheka.startTime;
        const dist = angularDistance(
          pos.phi, pos.theta,
          events.abhisheka.origin.phi, events.abhisheka.origin.theta
        );

        // Cascade front — expands outward from origin
        // Milk flows downward, so we bias by theta (vertical position)
        const cascadeSpeed = 2.2;
        const cascadeFront = elapsed * cascadeSpeed;
        const cascadeWidth = 0.8;  // how wide the "pour" is

        // Distance to the cascade front, accounting for downward flow
        const flowBias = (pos.theta - events.abhisheka.origin.theta) * 0.3;
        const effectiveDist = dist - flowBias * 0.5;

        if (effectiveDist < cascadeFront) {
          // Behind the cascade front — milk has passed here
          const timeSincePassed = (cascadeFront - effectiveDist) / cascadeSpeed;
          // Quick rise, slower fade
          const fadeTime = 1.2;
          if (timeSincePassed < 0.15) {
            // Rising — the milk is arriving
            abhishekaGlow = (timeSincePassed / 0.15);
          } else {
            // Fading — milk draining away
            abhishekaGlow = Math.max(0, 1 - (timeSincePassed - 0.15) / fadeTime);
          }
          // Intensity falls off with distance from pour point
          abhishekaGlow *= Math.max(0, 1 - dist / 4);
        }
      }


      // ── Spanda contribution ──
      let spandaGlow = 0;
      let spandaScale = 0;
      if (events.spanda.active) {
        const elapsed = t - events.spanda.startTime;
        const dist = angularDistance(
          pos.phi, pos.theta,
          events.spanda.origin.phi, events.spanda.origin.theta
        );

        // Ripple expands outward
        const rippleFront = elapsed * events.spanda.speed;
        const rippleWidth = 0.9;  // wider band for visibility

        // Distance from this character to the ripple front
        const distToRipple = Math.abs(dist - rippleFront);

        if (distToRipple < rippleWidth) {
          // Within the ripple band
          const rippleIntensity = 1 - (distToRipple / rippleWidth);
          // Sharper peak
          spandaGlow = Math.pow(rippleIntensity, 2) * 0.8;
          // Slight scale perturbation — the "tremor"
          spandaScale = Math.pow(rippleIntensity, 3) * 0.025;

          // Fade out as ripple expands
          const expansionFade = Math.max(0, 1 - elapsed / events.spanda.duration);
          spandaGlow *= expansionFade;
          spandaScale *= expansionFade;
        }
      }


      // ── Apply sacred event contributions ──
      intensity += abhishekaGlow * 2.0 + spandaGlow * 1.2;

      // Scale perturbation from spanda (preserve X flip for correct text orientation)
      if (spandaScale > 0) {
        const baseScale = 1 + spandaScale;
        children[idx].scale.set(-baseScale, baseScale, baseScale);
      } else {
        children[idx].scale.set(-1, 1, 1);
      }

      mat.emissiveIntensity = intensity;


      // ── Colour determination ──
      if (abhishekaGlow > 0.3) {
        // Abhisheka — milk white, pushed way above 1.0 for dramatic bloom
        mat.emissive.lerpColors(
          PALETTE.emissiveBright,
          PALETTE.abhisheka,
          Math.min(1, abhishekaGlow * 1.2)
        );
        mat.emissiveIntensity = intensity + abhishekaGlow * 4.0;  // dramatic bloom
      } else if (binduStrength > 0 && mantraGlow > 0.12) {
        // Bindu flash — pushed for bloom
        mat.emissive.lerpColors(
          PALETTE.emissiveAlive,
          PALETTE.bindu,
          Math.min(1, binduStrength * mantraGlow * 2.5)
        );
        mat.emissiveIntensity = intensity + binduStrength * 2.5;  // boosted for bloom
      } else if (spandaGlow > 0.1) {
        // Spanda ripple — warm bright copper
        mat.emissive.lerpColors(
          PALETTE.emissiveAlive,
          PALETTE.emissiveBright,
          Math.min(1, spandaGlow * 2)
        );
      } else if (mantraGlow > 0.1 || secondaryGlow > 0.08) {
        // Regular wave
        const waveStrength = Math.max(mantraGlow, secondaryGlow * 0.8);
        mat.emissive.lerpColors(
          PALETTE.emissiveRest,
          PALETTE.emissiveBright,
          Math.min(1, waveStrength * 1.5)
        );
      } else {
        mat.emissive.copy(PALETTE.emissiveRest);
      }

      // Om presence
      if (charIdx === 0) {
        mat.emissiveIntensity += 0.15;
      }

      mat.needsUpdate = true;
    }
  });


  // ─── Build torus geometry ──────────────────────────────
  const textGroups = useMemo(() => {
    const groups = [];
    let matIdx = 0;

    for (let line = 0; line < NUM_LINES; line++) {
      const phi = (line / NUM_LINES) * Math.PI * 2;

      for (let col = 0; col < POINTS_PER_LINE; col++) {
        const theta = (col / POINTS_PER_LINE) * Math.PI * 2;

        const x = (MAJOR_RADIUS + TUBE_RADIUS * Math.cos(theta)) * Math.cos(phi);
        const y = (MAJOR_RADIUS + TUBE_RADIUS * Math.cos(theta)) * Math.sin(phi);
        const z = TUBE_RADIUS * Math.sin(theta);

        const normal = new THREE.Vector3(
          Math.cos(phi) * Math.cos(theta),
          Math.sin(phi) * Math.cos(theta),
          Math.sin(theta)
        );

        const charIdx = (col + line) % mantra.length;

        const lookAt = new THREE.Matrix4();
        lookAt.lookAt(
          new THREE.Vector3(0, 0, 0),
          normal,
          new THREE.Vector3(0, 1, 0)
        );
        const euler = new THREE.Euler().setFromRotationMatrix(lookAt);

        groups.push(
          <group
            key={`c-${line}-${col}`}
            position={[x, z, y]}
            rotation={[euler.x, euler.y, euler.z]}
            scale={[-1, 1, 1]}
          >
            <Text3D
              font="/fonts/Noto Serif Devanagari_Regular.json"
              size={0.10}
              height={0.01}
              material={materials[matIdx]}
              center
            >
              {mantra[charIdx]}
            </Text3D>
          </group>
        );
        matIdx++;
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

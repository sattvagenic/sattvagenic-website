import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import MantraVisualisation from './OmNamaShivayaTorus';

/**
 * MantraScene — Container for the Om Namah Shivaya Torus
 *
 * v2: Better visibility, environment reflections for metallic glint
 *
 * Changes:
 *   – Added Environment component for reflections
 *   – Lifted ambient and point light intensities
 *   – Bloom adjusted for richer glow
 */

// ─── Palette ───────────────────────────────────────────────
const PALETTE = {
  bg:           '#050302',  // slightly lifted from pure black
  textPrimary:  '#c47a3a',
  textMuted:    '#8b6b4a',
  textDim:      '#5a4a3a',
  bone:         '#e8d5be',
  glow:         'rgba(196, 122, 58, 0.4)',
  glowStrong:   'rgba(196, 122, 58, 0.6)',
};


// ─── Loading Screen ────────────────────────────────────────
const LoadingScreen = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: PALETTE.bg,
      zIndex: 10,
    }}>
      <div style={{
        width: '2px',
        height: '2px',
        borderRadius: '50%',
        backgroundColor: PALETTE.textPrimary,
        boxShadow: `0 0 20px 8px ${PALETTE.glow}`,
        marginBottom: '3rem',
        animation: 'breathe 3s ease-in-out infinite',
      }} />

      <h2 style={{
        color: PALETTE.textMuted,
        fontFamily: "'Rajdhani', 'Courier New', monospace",
        fontSize: '0.9rem',
        fontWeight: 400,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        margin: 0,
      }}>
        installing mantra<span style={{ 
          display: 'inline-block', 
          width: '1.5em',
          textAlign: 'left'
        }}>{dots}</span>
      </h2>

      <style>{`
        @keyframes breathe {
          0%, 100% { 
            opacity: 0.4; 
            transform: scale(1);
            box-shadow: 0 0 20px 8px ${PALETTE.glow};
          }
          50% { 
            opacity: 1; 
            transform: scale(1.5);
            box-shadow: 0 0 30px 12px ${PALETTE.glowStrong};
          }
        }
      `}</style>
    </div>
  );
};


// ─── Main Scene ────────────────────────────────────────────
const MantraScene = () => {
  const [showSanskrit, setShowSanskrit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const toggleText = () => setShowSanskrit(!showSanskrit);

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: PALETTE.bg,
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <link 
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500&display=swap" 
        rel="stylesheet" 
      />

      {loading && <LoadingScreen />}
      
      {/* ─── Header ─── */}
      <header style={{ 
        textAlign: 'center', 
        padding: '2rem 0',
      }}>
        <div 
          onMouseEnter={() => setShowSanskrit(true)}
          onMouseLeave={() => setShowSanskrit(false)}
          onClick={toggleText}
          style={{ 
            position: 'relative',
            height: '3rem',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          <h1 style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            color: PALETTE.bone,
            fontFamily: "'Noto Serif Devanagari', serif",
            fontSize: '2.8rem',
            fontWeight: 400,
            margin: 0,
            textShadow: `0 0 20px ${PALETTE.glow}`,
            opacity: showSanskrit ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}>
            ॐ नमः शिवाय
          </h1>
          
          <h1 style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            color: PALETTE.textPrimary,
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '2.4rem',
            fontWeight: 300,
            letterSpacing: '0.15em',
            margin: 0,
            textShadow: `0 0 15px ${PALETTE.glow}`,
            opacity: showSanskrit ? 0 : 1,
            transition: 'opacity 0.5s ease',
          }}>
            Om Namah Shivaya
          </h1>
        </div>
        
        <div style={{ 
          fontSize: '0.95rem',
          color: PALETTE.textMuted,
          marginTop: '2.5rem',
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 300,
          letterSpacing: '0.12em',
          textShadow: `0 0 10px ${PALETTE.glow}`,
        }}>
          1008 repetitions in toroidal manifestation
        </div>
      </header>
      
      {/* ─── Canvas ─── */}
      <Canvas 
        camera={{ position: [0, 1.5, 7], fov: 45 }}
        style={{ 
          height: '80vh',
          minHeight: '600px',
          background: PALETTE.bg,
        }}
      >
        {/* Atmospheric fog */}
        <fog attach="fog" args={[PALETTE.bg, 10, 20]} />

        {/* 
          Environment map — this is the key to metallic glint.
          'night' preset is dark and moody but provides reflections.
          Low intensity keeps it subtle — the emissive glow remains dominant.
        */}
        <Environment 
          preset="night"
          environmentIntensity={0.15}
        />

        {/* Lifted ambient for base visibility */}
        <ambientLight intensity={0.12} color="#2a1a10" />
        
        {/* Key light — warmer and stronger */}
        <pointLight
          position={[6, 4, 5]}
          intensity={0.5}
          color="#ffe0c0"
          distance={25}
          decay={2}
        />
        
        {/* Fill light */}
        <pointLight
          position={[-5, -3, -4]}
          intensity={0.25}
          color="#ddccbb"
          distance={20}
          decay={2}
        />
        
        {/* Rim light — helps define edges */}
        <pointLight
          position={[0, 0, -8]}
          intensity={0.15}
          color="#9999bb"
          distance={15}
          decay={2}
        />

        {/* Top accent light — catches the upper surfaces */}
        <pointLight
          position={[0, 6, 2]}
          intensity={0.2}
          color="#ffddbb"
          distance={15}
          decay={2}
        />
        
        <Suspense fallback={null}>
          <MantraVisualisation />
          
          {/* Bloom for dramatic sacred events */}
          <EffectComposer>
            <Bloom 
              intensity={1.0}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.8}
              mipmapBlur={true}
            />
          </EffectComposer>
        </Suspense>
        
        {/* Prayer-wheel controls */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          autoRotate={false}
          enableDamping={true}
          dampingFactor={0.03}
          rotateSpeed={0.3}
          minDistance={4}
          maxDistance={12}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
        />
      </Canvas>
      
      {/* ─── Footer ─── */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem 0',
      }}>
        <div 
          style={{
            position: 'relative', 
            height: '1.5rem',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setShowSanskrit(true)}
          onMouseLeave={() => setShowSanskrit(false)}
          onClick={toggleText}
        >
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            color: PALETTE.bone,
            fontFamily: "'Noto Serif Devanagari', serif",
            fontSize: '1.3rem',
            textShadow: `0 0 10px ${PALETTE.glow}`,
            opacity: showSanskrit ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}>
            सृष्टि और ज्ञान का अनन्त चक्र
          </div>
          
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            color: PALETTE.textPrimary,
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '1.2rem',
            fontWeight: 300,
            letterSpacing: '0.1em',
            textShadow: `0 0 10px ${PALETTE.glow}`,
            opacity: showSanskrit ? 0 : 1,
            transition: 'opacity 0.5s ease',
          }}>
            The infinite cycle of creation and knowledge
          </div>
        </div>
        
        <div style={{ 
          fontSize: '1rem',
          color: PALETTE.textDim,
          marginTop: '2.5rem',
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 300,
          fontStyle: 'italic',
          letterSpacing: '0.05em',
          opacity: 0.7,
        }}>
          Through the eye of the Self flows the light of its own glory.
        </div>
      </footer>
    </div>
  );
};

export default MantraScene;

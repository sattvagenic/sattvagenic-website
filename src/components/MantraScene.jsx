import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import MantraVisualisation from './OmNamaShivayaTorus';

const SmokeLoadingScreen = () => {
  // Your existing smoke loading screen code
  return (
    <div style={{
      position: 'fixed', // Changed from absolute to fixed
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
      zIndex: 10
    }}>
      <h2 style={{
        color: '#9900ff',
        fontFamily: 'Orbitron, sans-serif',
        textAlign: 'center',
        animation: 'pulse 2s infinite ease-in-out'
      }}>
        Installing Sacred Mantra...
      </h2>
      {/* Smoke effect code here */}
    </div>
  );
};

const SimpleScene = () => {
  const [showSanskrit, setShowSanskrit] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle loading state with a timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      backgroundColor: 'black',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {loading && <SmokeLoadingScreen />}
      
      {/* Put the headers back exactly as they were */}
      <header style={{ 
        textAlign: 'center', 
        padding: '2rem 0',
      }}>
        <div 
          onMouseEnter={() => setShowSanskrit(true)}
          onMouseLeave={() => setShowSanskrit(false)}
          onClick={() => setShowSanskrit(!showSanskrit)}
          style={{ 
            position: 'relative',
            height: '3rem',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          <h1 style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            color: '#ffffff', 
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '3rem',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 0 15px rgba(153, 0, 255, 0.8)',
            opacity: showSanskrit ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}>
            ॐ नमः शिवाय
          </h1>
          
          <h1 style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            color: '#ffffff', 
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '3rem',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 0 15px rgba(153, 0, 255, 0.8)',
            opacity: showSanskrit ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}>
           Om Namah Shivaya
          </h1>
        </div>
        
        <div style={{ 
          fontSize: '1.2rem', 
          color: '#bb99ff', 
          marginTop: '2.5rem',
          fontFamily: 'Orbitron, sans-serif',
          textShadow: '0 0 10px rgba(187, 153, 255, 0.7)'
        }}>
          1008 repetitions of Om Namah Shivaya in Toroidal manifestation
        </div>
      </header>
      
      {/* Only change the Canvas height */}
      <Canvas 
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ 
          height: '80vh',
          minHeight: '600px'
        }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[5, 3, 2]} intensity={0.6} color="#9900ff" />
        <pointLight position={[-5, -3, 2]} intensity={0.5} color="#4400aa" />
        <pointLight position={[0, 0, 0]} intensity={0.6} color="#ffffff" distance={7} />
        
        <Suspense fallback={null}>
          <MantraVisualisation />
          
          <EffectComposer>
            <Bloom 
              intensity={1.5} 
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
        </Suspense>
        
        <OrbitControls 
          enableZoom={true}
          autoRotate={true}
          autoRotateSpeed={0.2}
        />
      </Canvas>
      
      {/* Keep the footer as it was */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem 0',
      }}>
        <div style={{
          position: 'relative', 
          height: '1.5rem',
          cursor: 'pointer',
        }}
          onMouseEnter={() => setShowSanskrit(true)}
          onMouseLeave={() => setShowSanskrit(false)}
          onClick={() => setShowSanskrit(!showSanskrit)}
        >
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            color: '#ffffff', 
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '1.5rem',
            textShadow: '0 0 10px rgba(153, 0, 255, 0.8)',
            opacity: showSanskrit ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}>
            सृष्टि और ज्ञान का अनन्त चक्र
          </div>
          
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            color: '#ffffff', 
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '1.5rem',
            textShadow: '0 0 10px rgba(153, 0, 255, 0.8)',
            opacity: showSanskrit ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}>
            The infinite cycle of creation and knowledge
          </div>
        </div>
        
        <div style={{ 
          fontSize: '1.5rem', 
          color: '#bb99ff', 
          marginTop: '2.5rem',
          fontFamily: 'Iceland, sans-serif',
          opacity: 0.8
        }}>
          Through the eye of the Self flows the light of its own glory.
        </div>
      </footer>
    </div>
  );
};

export default SimpleScene;
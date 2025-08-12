/* global faceapi */
import React, { useState, useEffect, useRef } from 'react';
import './ConsciousnessLab.css';

const ConsciousnessLab = () => {
  // Mode state - 'metta' or 'valence'
  const [mode, setMode] = useState('metta');
  
  // Image states
  const [image1Data, setImage1Data] = useState(null);
  const [image2Data, setImage2Data] = useState(null);
  const [image1Loaded, setImage1Loaded] = useState(false);
  const [image2Loaded, setImage2Loaded] = useState(false);
  
  // Face detection states (for Metta mode)
  const [faces1Detected, setFaces1Detected] = useState(false);
  const [faces2Detected, setFaces2Detected] = useState(false);
  const [landmarks1, setLandmarks1] = useState(null);
  const [landmarks2, setLandmarks2] = useState(null);
  
  // Meditation and UI states
  const [meditationActive, setMeditationActive] = useState(false);
  const [morphValue, setMorphValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('INITIALIZING...');
  const [audioMuted, setAudioMuted] = useState(true);
  
  // Refs
  const canvasRef = useRef(null);
  const meditationIntervalRef = useRef(null);
  const fileInput1Ref = useRef(null);
  const fileInput2Ref = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  
  // Default image pairs for Valence mode
  const defaultValencePairs = [
    {
      positive: "/images/devi 4.png",
      negative: "/images/kali4.png",
      name: "Devi / Kali",
      audio: "/audio/harmonic-to-scream.mp3"
    },
    {
      positive: "/images/laughing-baby.jpg",
      negative: "/images/demon-face.jpg",
      name: "Innocence / Malevolence",
      audio: "/audio/innocence-malevolence.mp3"
    },
    {
      positive: "/images/oasis.jpg",
      negative: "/images/warzone.jpg",
      name: "Peace / Chaos",
      audio: "/audio/peace-chaos.mp3"
    }
  ];
  
  const [currentValencePairIndex, setCurrentValencePairIndex] = useState(0);

  // Initialize Face-API for Metta mode
  useEffect(() => {
    if (mode === 'metta') {
      loadFaceAPI();
    }
  }, [mode]);

  const loadFaceAPI = async () => {
    try {
      // Check if face-api is available
      if (typeof faceapi !== 'undefined') {
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');
        setStatusMessage('FACE DETECTION READY');
      }
    } catch (error) {
      console.log('Face detection not available, using basic morphing');
      setStatusMessage('BASIC MORPHING MODE');
    }
  };

  // Initialize audio for Valence mode
  useEffect(() => {
    if (mode === 'valence' && !audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.crossOrigin = "anonymous";
      audio.muted = audioMuted;
      audioRef.current = audio;
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      const source = audioContextRef.current.createMediaElementSource(audio);
      gainNodeRef.current = audioContextRef.current.createGain();
      
      source.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      // Load default audio
      const currentPair = defaultValencePairs[currentValencePairIndex];
      if (currentPair.audio) {
        audio.src = currentPair.audio;
      }
    }
    
    return () => {
      if (mode !== 'valence' && audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      }
    };
  }, [mode, currentValencePairIndex, audioMuted]);

  // Handle mode switching
  const switchMode = (newMode) => {
    if (meditationActive) {
      toggleMeditation();
    }
    
    setMode(newMode);
    setImage1Data(null);
    setImage2Data(null);
    setImage1Loaded(false);
    setImage2Loaded(false);
    setMorphValue(0);
    setFaces1Detected(false);
    setFaces2Detected(false);
    setLandmarks1(null);
    setLandmarks2(null);
    
    if (fileInput1Ref.current) fileInput1Ref.current.value = '';
    if (fileInput2Ref.current) fileInput2Ref.current.value = '';
    
    setStatusMessage(newMode === 'metta' ? 'METTA-MORPH MODE' : 'VALENCE CONFIGURATION MODE');
  };

  // Handle image upload
  const handleImageUpload = async (event, imageNum) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage(`PROCESSING ${imageNum === 1 ? 'ALPHA' : 'BETA'} ENTITY...`);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        if (imageNum === 1) {
          setImage1Data({ src: e.target.result, img });
          setImage1Loaded(true);
          
          if (mode === 'metta') {
            await detectFaces(img, 1);
          }
        } else {
          setImage2Data({ src: e.target.result, img });
          setImage2Loaded(true);
          
          if (mode === 'metta') {
            await detectFaces(img, 2);
          }
        }
        
        setIsProcessing(false);
        
        if (image1Loaded && image2Loaded) {
          setStatusMessage('READY FOR CONSCIOUSNESS NAVIGATION');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Detect faces and landmarks for Metta mode
  const detectFaces = async (img, imageNum) => {
    if (typeof faceapi === 'undefined') return;
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const detection = await faceapi.detectSingleFace(canvas, 
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);
      
      if (detection) {
        if (imageNum === 1) {
          setLandmarks1(detection.landmarks);
          setFaces1Detected(true);
        } else {
          setLandmarks2(detection.landmarks);
          setFaces2Detected(true);
        }
        setStatusMessage('FACE LANDMARKS DETECTED');
      } else {
        setStatusMessage('NO FACE DETECTED - USING BASIC MORPH');
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };

  // Load default Valence pair
  const loadDefaultValencePair = (index) => {
    const pair = defaultValencePairs[index];
    setStatusMessage(`LOADING: ${pair.name.toUpperCase()}`);
    setImage1Loaded(false);
    setImage2Loaded(false);
    
    // Load positive image
    const img1 = new Image();
    img1.onload = () => {
      setImage1Data({ src: pair.positive, img: img1 });
      setImage1Loaded(true);
    };
    img1.src = pair.positive;
    
    // Load negative image
    const img2 = new Image();
    img2.onload = () => {
      setImage2Data({ src: pair.negative, img: img2 });
      setImage2Loaded(true);
    };
    img2.src = pair.negative;
    
    // Update audio if in valence mode
    if (audioRef.current && pair.audio) {
      audioRef.current.src = pair.audio;
    }
  };

  // Navigate valence pairs
  const previousValencePair = () => {
    const newIndex = (currentValencePairIndex - 1 + defaultValencePairs.length) % defaultValencePairs.length;
    setCurrentValencePairIndex(newIndex);
    loadDefaultValencePair(newIndex);
  };

  const nextValencePair = () => {
    const newIndex = (currentValencePairIndex + 1) % defaultValencePairs.length;
    setCurrentValencePairIndex(newIndex);
    loadDefaultValencePair(newIndex);
  };

  // Update morph visualization
  const updateMorph = (value) => {
    if (!canvasRef.current || !image1Data || !image2Data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    
    const alpha = value / 100;
    
    // Clear canvas with black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (mode === 'metta' && landmarks1 && landmarks2) {
      // Advanced morphing with landmarks
      morphWithLandmarks(ctx, canvas, alpha);
    } else {
      // Simple crossfade morphing
      simpleMorph(ctx, canvas, alpha);
    }
    
    // Add visual effects
    addVisualEffects(ctx, canvas, alpha);
  };

  const simpleMorph = (ctx, canvas, alpha) => {
    const scale1 = Math.min(canvas.width / image1Data.img.width, canvas.height / image1Data.img.height) * 0.8;
    const scale2 = Math.min(canvas.width / image2Data.img.width, canvas.height / image2Data.img.height) * 0.8;
    
    const x1 = (canvas.width - image1Data.img.width * scale1) / 2;
    const y1 = (canvas.height - image1Data.img.height * scale1) / 2;
    const x2 = (canvas.width - image2Data.img.width * scale2) / 2;
    const y2 = (canvas.height - image2Data.img.height * scale2) / 2;
    
    // Draw first image
    ctx.globalAlpha = 1 - alpha;
    ctx.drawImage(image1Data.img, x1, y1, image1Data.img.width * scale1, image1Data.img.height * scale1);
    
    // Draw second image
    ctx.globalAlpha = alpha;
    ctx.drawImage(image2Data.img, x2, y2, image2Data.img.width * scale2, image2Data.img.height * scale2);
    
    ctx.globalAlpha = 1;
  };

  const morphWithLandmarks = (ctx, canvas, alpha) => {
    // This is where we'd implement landmark-based morphing
    // For now, use enhanced simple morph
    simpleMorph(ctx, canvas, alpha);
    
    // Add a glow effect at 50% to show landmark detection is active
    if (Math.abs(alpha - 0.5) < 0.1) {
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#4FD4C6';
      ctx.strokeStyle = '#4FD4C6';
      ctx.lineWidth = 2;
      ctx.strokeRect(100, 50, canvas.width - 200, canvas.height - 100);
      ctx.shadowBlur = 0;
    }
  };

  const addVisualEffects = (ctx, canvas, alpha) => {
    // Add cyber overlay gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `rgba(79, 212, 198, ${0.1 * (1 - Math.abs(alpha - 0.5) * 2)})`);
    gradient.addColorStop(1, `rgba(212, 128, 77, ${0.1 * (1 - Math.abs(alpha - 0.5) * 2)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add corner brackets
    ctx.strokeStyle = '#4FD4C6';
    ctx.lineWidth = 2;
    const cornerSize = 20;
    
    // Top left
    ctx.beginPath();
    ctx.moveTo(0, cornerSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.stroke();
    
    // Top right
    ctx.beginPath();
    ctx.moveTo(canvas.width - cornerSize, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, cornerSize);
    ctx.stroke();
    
    // Bottom left
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - cornerSize);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(cornerSize, canvas.height);
    ctx.stroke();
    
    // Bottom right
    ctx.beginPath();
    ctx.moveTo(canvas.width - cornerSize, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, canvas.height - cornerSize);
    ctx.stroke();
    
    // Progress bar
    ctx.fillStyle = '#4FD4C6';
    ctx.fillRect(0, canvas.height - 2, canvas.width * alpha, 2);
  };

  // Handle slider change
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setMorphValue(value);
    updateMorph(value);
  };

  // Toggle meditation mode
  const toggleMeditation = () => {
    if (!meditationActive) {
      startMeditation();
    } else {
      stopMeditation();
    }
    setMeditationActive(!meditationActive);
  };

  const startMeditation = () => {
    // Start audio if in valence mode
    if (mode === 'valence' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // Process faces if in metta mode and not yet processed
    if (mode === 'metta' && image1Data && image2Data && (!faces1Detected || !faces2Detected)) {
      setStatusMessage('ALIGNING CONSCIOUSNESS FIELDS...');
      // Face detection would happen here if needed
    }
    
    let value = 0;
    let direction = 1;
    
    meditationIntervalRef.current = setInterval(() => {
      value += direction * 0.5;
      
      if (value >= 100) {
        value = 100;
        direction = -1;
      } else if (value <= 0) {
        value = 0;
        direction = 1;
      }
      
      setMorphValue(Math.round(value));
      updateMorph(value);
    }, 50);
  };

  const stopMeditation = () => {
    if (meditationIntervalRef.current) {
      clearInterval(meditationIntervalRef.current);
      meditationIntervalRef.current = null;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Toggle audio mute
  const toggleAudioMute = () => {
    setAudioMuted(!audioMuted);
    if (audioRef.current) {
      audioRef.current.muted = !audioMuted;
    }
  };

  // Reset portal
  const resetPortal = () => {
    if (meditationActive) {
      toggleMeditation();
    }
    
    setImage1Data(null);
    setImage2Data(null);
    setImage1Loaded(false);
    setImage2Loaded(false);
    setMorphValue(0);
    setFaces1Detected(false);
    setFaces2Detected(false);
    setLandmarks1(null);
    setLandmarks2(null);
    
    if (fileInput1Ref.current) fileInput1Ref.current.value = '';
    if (fileInput2Ref.current) fileInput2Ref.current.value = '';
    
    setStatusMessage('PORTAL RESET');
  };

  // Initialize default images on mode change
  useEffect(() => {
    if (mode === 'valence') {
      loadDefaultValencePair(0);
    }
  }, [mode]);

  // Update morph when value changes
  useEffect(() => {
    updateMorph(morphValue);
  }, [morphValue, image1Data, image2Data]);

  return (
    <div className="consciousness-lab-container">
      <div className="nav-header">
        <div className="sattvagenic-logo">सत्त्वजनिक</div>
      </div>

      <div className="lab-content">
        <div className="main-title">
          <div className="sanskrit-title">
            {mode === 'metta' ? 'मैत्री रूप' : 'वैलेंस विन्यास'}
          </div>
          <div className="english-title">
            {mode === 'metta' ? 'METTA-MORPH' : 'VALENCE CONFIGURATION'}
          </div>
        </div>
        
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'metta' ? 'active' : ''}`}
            onClick={() => switchMode('metta')}
          >
            METTA MODE
          </button>
          <button 
            className={`mode-btn ${mode === 'valence' ? 'active' : ''}`}
            onClick={() => switchMode('valence')}
          >
            VALENCE MODE
          </button>
        </div>

        <div className="upload-grid">
          <div 
            className={`upload-portal ${image1Loaded ? 'loaded' : ''}`}
            onClick={() => fileInput1Ref.current?.click()}
          >
            <div className="portal-label">
              {mode === 'metta' ? 'ENTITY ALPHA' : 'POSITIVE STATE'}
            </div>
            <div className="portal-icon">
              {mode === 'metta' ? '👁️' : '☮️'}
            </div>
            <div className="portal-text">
              {mode === 'metta' ? 'Upload first consciousness' : 'Upload positive state'}
            </div>
            {image1Data && (
              <img className="preview-image active" src={image1Data.src} alt="First" />
            )}
            <input 
              ref={fileInput1Ref}
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 1)}
              style={{ display: 'none' }}
            />
          </div>

          <div 
            className={`upload-portal ${image2Loaded ? 'loaded' : ''}`}
            onClick={() => fileInput2Ref.current?.click()}
          >
            <div className="portal-label">
              {mode === 'metta' ? 'ENTITY BETA' : 'NEGATIVE STATE'}
            </div>
            <div className="portal-icon">
              {mode === 'metta' ? '🧿' : '⚡'}
            </div>
            <div className="portal-text">
              {mode === 'metta' ? 'Upload second consciousness' : 'Upload negative state'}
            </div>
            {image2Data && (
              <img className="preview-image active" src={image2Data.src} alt="Second" />
            )}
            <input 
              ref={fileInput2Ref}
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 2)}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {mode === 'valence' && (
          <div className="valence-controls">
            <button onClick={previousValencePair} className="arrow-btn">◀</button>
            <button onClick={() => loadDefaultValencePair(currentValencePairIndex)} className="load-btn">
              LOAD DEFAULT PAIR
            </button>
            <button onClick={nextValencePair} className="arrow-btn">▶</button>
            <div className="pair-indicator">
              [{currentValencePairIndex + 1}/{defaultValencePairs.length}] {defaultValencePairs[currentValencePairIndex].name}
            </div>
          </div>
        )}

        <div className={`morph-viewport ${image1Loaded && image2Loaded ? 'active' : ''}`}>
          {(!image1Loaded || !image2Loaded) ? (
            <div className="loading-screen">
              <div className="loading-mandala"></div>
              <div>{statusMessage}</div>
            </div>
          ) : (
            <canvas ref={canvasRef} id="morphCanvas" />
          )}
          {isProcessing && (
            <div className="processing-overlay">
              <div className="processing-spinner"></div>
              <div>PROCESSING CONSCIOUSNESS STREAMS</div>
            </div>
          )}
        </div>

        {image1Loaded && image2Loaded && (
          <div className="control-panel active">
            <div className="slider-container">
              <div className="slider-labels">
                <span>{mode === 'metta' ? 'ALPHA STATE' : 'POSITIVE'}</span>
                <span>{mode === 'metta' ? 'BETA STATE' : 'NEGATIVE'}</span>
              </div>
              <input 
                type="range" 
                className="morph-slider" 
                min="0" 
                max="100" 
                value={morphValue}
                onChange={handleSliderChange}
                disabled={meditationActive}
              />
              <div className="slider-value">
                <span>{morphValue}</span>% {mode === 'metta' ? 'MERGED' : 'VALENCE'}
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className={`cyber-button ${meditationActive ? 'active' : ''}`}
                onClick={toggleMeditation}
              >
                {meditationActive ? '◼ STOP' : '▶ START'} MEDITATION
              </button>
              
              {mode === 'valence' && (
                <button 
                  className={`cyber-button ${!audioMuted ? 'active' : ''}`}
                  onClick={toggleAudioMute}
                >
                  {audioMuted ? '🔇 UNMUTE' : '🔊 MUTE'} AUDIO
                </button>
              )}
              
              <button className="cyber-button" onClick={resetPortal}>
                ↺ RESET PORTAL
              </button>
            </div>
          </div>
        )}

        <div className="meditation-chamber">
          <div className="meditation-title">
            {mode === 'metta' ? 'METTA CULTIVATION PROTOCOL' : 'VALENCE NAVIGATION PROTOCOL'}
          </div>
          <div className="meditation-text">
            {mode === 'metta' ? 
              'As the faces merge, observe the dissolution of self and other. Notice how your feelings transform as features blend. Where does aversion end and affection begin?' :
              'Move through the spectrum of valence states with mindful attention. Observe precisely when perception shifts between positive and negative.'}
          </div>
          <div className="meditation-prompt">
            {mode === 'metta' ?
              '"Can you find loving-kindness for the merged being? This is neither self nor other, but the space between."' :
              '"Notice how the self that perceives both states remains unchanged throughout. You are the witness, not the witnessed."'}
          </div>
        </div>
      </div>

      <div className="status-orb">🕉️</div>
    </div>
  );
};

export default ConsciousnessLab;
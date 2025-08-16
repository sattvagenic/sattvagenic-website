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
  const [isLoadingPair, setIsLoadingPair] = useState(false);
  
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
  }
  // Remove the third pair or update with images that actually exist
];

// Default face pairs for Metta mode
const defaultMettaPairs = [
  {
    face1: "/images/yourchild.jpg",
    face2: "/images/yourboss.jpg",
    name: "Example"
  },
  {
    face1: "/images/ramana1.jpg",
    face2: "/images/hitler1.jpeg",
    name: "Example 2"
  },
  
];

const [currentMettaPairIndex, setCurrentMettaPairIndex] = useState(0);

// Load function for Metta pairs
const loadDefaultMettaPair = (index) => {
  if (!defaultMettaPairs || !defaultMettaPairs[index]) {
    console.error('No metta pair found at index:', index);
    return;
  }
  
  setIsLoadingPair(true); // Start loading
  
  const pair = defaultMettaPairs[index];
  setStatusMessage(`LOADING EXAMPLE: ${pair.name ? pair.name.toUpperCase() : 'FACES'}`);
  setImage1Loaded(false);
  setImage2Loaded(false);
  
  // Set a timer to stop loading after 3 seconds
  setTimeout(() => {
    setIsLoadingPair(false);
  }, 3000);
  
  const img1 = new Image();
  img1.onload = () => {
    setImage1Data({ src: pair.face1, img: img1 });
    setImage1Loaded(true);
    if (mode === 'metta') detectFaces(img1, 1);
  };
  img1.src = pair.face1;
  
  const img2 = new Image();
  img2.onload = () => {
    setImage2Data({ src: pair.face2, img: img2 });
    setImage2Loaded(true);
    if (mode === 'metta') detectFaces(img2, 2);
  };
  img2.src = pair.face2;
};

// Update the arrow functions to auto-load when images are already present
const previousMettaPair = () => {
  const newIndex = (currentMettaPairIndex - 1 + defaultMettaPairs.length) % defaultMettaPairs.length;
  setCurrentMettaPairIndex(newIndex);
  // Auto-load if we already have images loaded
  if (image1Loaded || image2Loaded) {
    loadDefaultMettaPair(newIndex);
  }
};

const nextMettaPair = () => {
  const newIndex = (currentMettaPairIndex + 1) % defaultMettaPairs.length;
  setCurrentMettaPairIndex(newIndex);
  // Auto-load if we already have images loaded
  if (image1Loaded || image2Loaded) {
    loadDefaultMettaPair(newIndex);
  }
};
  
  const [currentValencePairIndex, setCurrentValencePairIndex] = useState(0);

  // Initialize Face-API for Metta mode
  useEffect(() => {
    if (mode === 'metta') {
      loadFaceAPI();
    }
  }, [mode]);

  const loadFaceAPI = async () => {
  try {
    if (typeof faceapi !== 'undefined') {
      // Load from local models folder instead of CDN
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
      setStatusMessage('FACE DETECTION READY');
    }
  } catch (error) {
    console.log('Face detection not available, using basic morphing');
    setStatusMessage('BASIC MORPHING MODE');
  }
};

useEffect(() => {
  if (image1Loaded && image2Loaded) {
    setStatusMessage('READY FOR CONSCIOUSNESS NAVIGATION');
    setIsProcessing(false); // Make sure to stop processing
  }
}, [image1Loaded, image2Loaded]);

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
        
        // Don't await face detection - just try it in background
        if (mode === 'metta' && typeof faceapi !== 'undefined') {
          detectFaces(img, 1); // Remove await
        }
      } else {
        setImage2Data({ src: e.target.result, img });
        setImage2Loaded(true);
        
        // Don't await face detection - just try it in background
        if (mode === 'metta' && typeof faceapi !== 'undefined') {
          detectFaces(img, 2); // Remove await
        }
      }
      
      setIsProcessing(false);
      setStatusMessage('READY FOR CONSCIOUSNESS NAVIGATION');
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
    setStatusMessage('FACE 1 LANDMARKS DETECTED ✓');
  } else {
    setLandmarks2(detection.landmarks);
    setFaces2Detected(true);
    setStatusMessage('FACE 2 LANDMARKS DETECTED ✓');
  }
  
  // If both faces detected, show ready message
  if ((imageNum === 1 && faces2Detected) || (imageNum === 2 && faces1Detected)) {
    setStatusMessage('BOTH FACES ALIGNED - READY FOR METTA');
  }
} else {
  setStatusMessage('NO FACE DETECTED - USING BASIC MORPH');
}
} catch (error) {
  console.error('Face detection error:', error);
  setStatusMessage('FACE DETECTION ERROR - USING BASIC MORPH');
} finally {
  setIsProcessing(false);  // Always stop processing
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
  if (!landmarks1 || !landmarks2) {
    simpleMorph(ctx, canvas, alpha);
    return;
  }

  // Get eye positions from landmarks
  const leftEye1 = landmarks1.getLeftEye();
  const rightEye1 = landmarks1.getRightEye();
  const leftEye2 = landmarks2.getLeftEye();
  const rightEye2 = landmarks2.getRightEye();
  
  // Calculate eye centers
  const getCenter = (points) => {
    const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / points.length, y: sum.y / points.length };
  };
  
  const eye1Center1 = getCenter(leftEye1);
  const eye2Center1 = getCenter(rightEye1);
  const eye1Center2 = getCenter(leftEye2);
  const eye2Center2 = getCenter(rightEye2);
  
  // Calculate angles for rotation alignment
  const angle1 = Math.atan2(eye2Center1.y - eye1Center1.y, eye2Center1.x - eye1Center1.x);
  const angle2 = Math.atan2(eye2Center2.y - eye1Center2.y, eye2Center2.x - eye1Center2.x);
  
  // Calculate scales to match eye distances
  const eyeDist1 = Math.sqrt(Math.pow(eye2Center1.x - eye1Center1.x, 2) + Math.pow(eye2Center1.y - eye1Center1.y, 2));
  const eyeDist2 = Math.sqrt(Math.pow(eye2Center2.x - eye1Center2.x, 2) + Math.pow(eye2Center2.y - eye1Center2.y, 2));
  
  const targetEyeDistance = 150; // Standard eye distance in pixels
  const scale1 = targetEyeDistance / eyeDist1;
  const scale2 = targetEyeDistance / eyeDist2;
  
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw first face (aligned and scaled)
  ctx.save();
  ctx.globalAlpha = 1 - alpha;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-angle1);
  ctx.scale(scale1, scale1);
  
  // Center based on face midpoint
  const faceMid1X = (eye1Center1.x + eye2Center1.x) / 2;
  const faceMid1Y = (eye1Center1.y + eye2Center1.y) / 2;
  ctx.drawImage(
    image1Data.img,
    -faceMid1X,
    -faceMid1Y
  );
  ctx.restore();
  
  // Draw second face (aligned and scaled)
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-angle2);
  ctx.scale(scale2, scale2);
  
  // Center based on face midpoint
  const faceMid2X = (eye1Center2.x + eye2Center2.x) / 2;
  const faceMid2Y = (eye1Center2.y + eye2Center2.y) / 2;
  ctx.drawImage(
    image2Data.img,
    -faceMid2X,
    -faceMid2Y
  );
  ctx.restore();
  
  ctx.globalAlpha = 1;
  
  // Add visual indicator that landmark mode is active
  ctx.strokeStyle = '#4FD4C6';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.setLineDash([]);
  
  // Show "LANDMARK ALIGNED" text
  ctx.font = '12px Orbitron';
  ctx.fillStyle = '#4FD4C6';
  ctx.fillText('LANDMARK ALIGNED', 10, 25);
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
  }
  
  let value = 0;
  let direction = 1;
  
  // Different speeds for different modes
  // For 45 sec half-cycle: 100 steps / (45 sec * 20 updates/sec) = 0.133
  // For 30 sec half-cycle: 100 steps / (30 sec * 20 updates/sec) = 0.167
  const speed = mode === 'metta' ? 0.111 : 0.159;
  
  meditationIntervalRef.current = setInterval(() => {
    value += direction * speed;
    
    if (value >= 100) {
      value = 100;
      direction = -1;
    } else if (value <= 0) {
      value = 0;
      direction = 1;
    }
    
    setMorphValue(Math.round(value));
    updateMorph(value);
  }, 50); // 50ms = 20 updates per second
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
    loadDefaultValencePair(0);  // Auto-load for Valence mode
  }
  // Don't auto-load for Metta mode - leave blank
}, [mode]);

  // Update morph when value changes
  useEffect(() => {
    updateMorph(morphValue);
  }, [morphValue, image1Data, image2Data]);

  return (
    <div className="consciousness-lab-container">
      <div className="nav-header">
        <div className="sattvagenic-logo"></div>
      </div>

      <div className="lab-content">
        <div className="main-title">
          <div className="sanskrit-title">
            {mode === 'metta' ? 'मैत्री रूप' : 'वैलेंस विन्यास'}
          </div>
          <div className="english-title">
            {mode === 'metta' ? 'METTA-MORPH' : 'VALENCE PROTOCOL'}
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
            EQUANIMITY
          </button>
        </div>

        <div className="upload-grid">
          <div 
            className={`upload-portal ${image1Loaded ? 'loaded' : ''}`}
            onClick={() => fileInput1Ref.current?.click()}
          >
            <div className="portal-label">
              {mode === 'metta' ? 'HEART OPEN' : 'POSITIVE STATE'}
            </div>
            <div className="portal-icon">
              {mode === 'metta' ? '👁️' : '☮️'}
            </div>
            <div className="portal-text">
              {mode === 'metta' ? '' : 'Upload positive state'}
            </div>
            {image1Data && (
              <img className="preview-image active" src={image1Data.src} alt="First" />
            )}
             <div className="upload-hint">Upload own image</div> 
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
              {mode === 'metta' ? 'HEART CHALLENGED' : 'NEGATIVE STATE'}
            </div>
            <div className="portal-icon">
              {mode === 'metta' ? '🧿' : '⚡'}
            </div>
            <div className="portal-text">
              {mode === 'metta' ? '' : 'Upload negative state'}
            </div>
            {image2Data && (
              <img className="preview-image active" src={image2Data.src} alt="Second" />
            )}
            <div className="upload-hint">Upload own image</div>
            <input 
              ref={fileInput2Ref}
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 2)}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {mode === 'metta' && (
  <div className="valence-controls">
    <button onClick={previousMettaPair} className="arrow-btn">◀</button>
    <button 
  onClick={() => loadDefaultMettaPair(currentMettaPairIndex)} 
  className="load-btn"
  disabled={isLoadingPair}
>
  {isLoadingPair ? 'LOADING...' : 'LOAD EXAMPLE FACES'}
</button>
    <button onClick={nextMettaPair} className="arrow-btn">▶</button>
    <div className="pair-indicator">
      [{currentMettaPairIndex + 1}/{defaultMettaPairs.length}] {defaultMettaPairs[currentMettaPairIndex].name}
    </div>
  </div>
)}

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
              'Notice how your feelings transform as features blend. Where does affection end and aversion begin?' :
              'Move through the spectrum of valence states with mindful attention. Observe precisely when perception shifts between positive and negative.'}
          </div>
          <div className="meditation-prompt">
            {mode === 'metta' ?
              '"Can you maintain a feeling of loving-kindness as the face changes? If not, what happens internally?"' :
              '"Notice how the awareness that perceives both states remains unchanged throughout."'}
          </div>
        </div>
      </div>

      <div className="status-orb">🕉️</div>
    </div>
  );
};

export default ConsciousnessLab;
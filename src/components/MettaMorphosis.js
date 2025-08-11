// src/components/MettaMorphosis.js

import React, { useState, useEffect, useRef } from 'react';
import './MettaMorphosis.css'; // We'll create this CSS file separately

const MettaMorphosis = () => {
  const [image1Data, setImage1Data] = useState(null);
  const [image2Data, setImage2Data] = useState(null);
  const [meditationActive, setMeditationActive] = useState(false);
  const [morphValue, setMorphValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showViewport, setShowViewport] = useState(false);
  
  const canvasRef = useRef(null);
  const meditationIntervalRef = useRef(null);
  const fileInput1Ref = useRef(null);
  const fileInput2Ref = useRef(null);

  // Initialize Face-API (optional)
  useEffect(() => {
    // Load face-api if needed
    const loadFaceAPI = async () => {
      try {
        // You can add face-api loading here if needed
        console.log('Metta-Morphosis initialized');
      } catch (error) {
        console.log('Basic morphing mode active');
      }
    };
    loadFaceAPI();

    // Cleanup on unmount
    return () => {
      if (meditationIntervalRef.current) {
        clearInterval(meditationIntervalRef.current);
      }
    };
  }, []);

  const handleImageUpload = async (event, imageNum) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        if (imageNum === 1) {
          setImage1Data({ src: e.target.result, img });
        } else {
          setImage2Data({ src: e.target.result, img });
        }

        // If both images are loaded, initialize morphing
        if ((imageNum === 1 && image2Data) || (imageNum === 2 && image1Data)) {
          setTimeout(() => initializeMorphing(), 100);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const initializeMorphing = async () => {
    setShowViewport(true);
    setIsLoading(true);

    // Simulate processing
    setTimeout(() => {
      setIsLoading(false);
      updateMorph(0);
    }, 2000);
  };

  const updateMorph = (value) => {
    if (!canvasRef.current || !image1Data || !image2Data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 600;
    
    const alpha = value / 100;
    
    // Clear and set black background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate centered positions
    const scale1 = Math.min(canvas.width / image1Data.img.width, canvas.height / image1Data.img.height) * 0.8;
    const scale2 = Math.min(canvas.width / image2Data.img.width, canvas.height / image2Data.img.height) * 0.8;
    
    const x1 = (canvas.width - image1Data.img.width * scale1) / 2;
    const y1 = (canvas.height - image1Data.img.height * scale1) / 2;
    const x2 = (canvas.width - image2Data.img.width * scale2) / 2;
    const y2 = (canvas.height - image2Data.img.height * scale2) / 2;
    
    // Draw morphed images
    ctx.globalAlpha = 1 - alpha;
    ctx.drawImage(image1Data.img, x1, y1, image1Data.img.width * scale1, image1Data.img.height * scale1);
    
    ctx.globalAlpha = alpha;
    ctx.drawImage(image2Data.img, x2, y2, image2Data.img.width * scale2, image2Data.img.height * scale2);
    
    // Add cyber overlay effect
    ctx.globalAlpha = 0.1;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4FD4C6');
    gradient.addColorStop(1, '#D4804D');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.globalAlpha = 1;
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setMorphValue(value);
    updateMorph(value);
  };

  const toggleMeditation = () => {
    if (!meditationActive) {
      startMeditation();
    } else {
      stopMeditation();
    }
    setMeditationActive(!meditationActive);
  };

  const startMeditation = () => {
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
  };

 const processWithAI = async () => {
  if (!image1Data || !image2Data) {
    alert('Please upload both images first');
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch('/.netlify/functions/morph-faces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image1: image1Data.src,
        image2: image2Data.src
      })
    });

    const result = await response.json();
    console.log('AI Response:', result);  // ADD THIS LINE
    
    // Check if we got a video URL
    if (result.output) {
      console.log('Video URL:', result.output);  // ADD THIS LINE
      alert(`AI Morph Complete! Video created: ${result.output}`);
      // Later we'll display this video instead of just alerting
    }
    
  } catch (error) {
    console.error('AI processing failed:', error);
    alert('AI enhancement failed - check console');
  } finally {
    setIsLoading(false);
  }
};

  const resetPortal = () => {
    if (meditationActive) {
      toggleMeditation();
    }
    
    setImage1Data(null);
    setImage2Data(null);
    setShowViewport(false);
    setMorphValue(0);
    
    // Reset file inputs
    if (fileInput1Ref.current) fileInput1Ref.current.value = '';
    if (fileInput2Ref.current) fileInput2Ref.current.value = '';
  };

  return (
    <div className="metta-morphosis-container">
      <div className="nav-header">
        <div className="sattvagenic-logo">सत्त्वजनिक</div>
      </div>

      <div className="mm-content">
        <div className="main-title">
          <div className="sanskrit-title">मैत्री रूप</div>
          <div className="english-title">Metta-Morph</div>
         
        </div>
        
        <p className="tagline">
          Transform perception through the dissolution of boundaries
        </p>

        <div className="upload-grid">
          <div 
            className={`upload-portal ${image1Data ? 'loaded' : ''}`}
            onClick={() => fileInput1Ref.current?.click()}
          >
            <div className="portal-label">Entity Alpha</div>
            <div className="portal-icon">👁️</div>
            <div className="portal-text">Upload first consciousness</div>
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
            className={`upload-portal ${image2Data ? 'loaded' : ''}`}
            onClick={() => fileInput2Ref.current?.click()}
          >
            <div className="portal-label">Entity Beta</div>
            <div className="portal-icon">🧿</div>
            <div className="portal-text">Upload second consciousness</div>
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

        {showViewport && (
          <div className="morph-viewport active">
            <canvas ref={canvasRef} id="morphCanvas" />
            {isLoading && (
              <div className="loading-screen">
                <div className="loading-mandala"></div>
                <div>PROCESSING CONSCIOUSNESS STREAMS</div>
              </div>
            )}
          </div>
        )}

        {showViewport && !isLoading && (
          <div className="control-panel active">
            <div className="slider-container">
              <div className="slider-labels">
                <span>Alpha State</span>
                <span>Beta State</span>
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
                <span>{morphValue}</span>% MERGED
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className={`cyber-button ${meditationActive ? 'active' : ''}`}
                onClick={toggleMeditation}
              >
                {meditationActive ? 'STOP' : 'START'} MEDITATION
              </button>
              <button className="cyber-button" onClick={processWithAI}>
                AI ENHANCEMENT
              </button>
              <button className="cyber-button" onClick={resetPortal}>
                RESET PORTAL
              </button>
            </div>
          </div>
        )}

        <div className="meditation-chamber">
          <div className="meditation-title">Consciousness Navigation Protocol</div>
          <div className="meditation-text">
            As the faces merge, observe the arising and passing of attraction and aversion. 
            Notice how your mind creates stories from mere pixels. These reactions reveal 
            the constructed nature of preference and identity.
          </div>
          <div className="meditation-prompt">
            "Who is the unchanging witness observing these transformations? At what point 
            does 'self' become 'other'? Can you find the exact moment where love transforms 
            into indifference, or indifference into aversion?"
          </div>
        </div>
      </div>

      <div className="status-orb">🕉️</div>
    </div>
  );
};

export default MettaMorphosis;
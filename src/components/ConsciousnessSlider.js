import React, { useState, useEffect, useRef } from 'react';

const CyberSanghaConsciousnessExplorer = () => {
  // First, let's import the Iceland font from Google Fonts
  useEffect(() => {
    // Create a link element for the Google Fonts
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Iceland&display=swap';
    fontLink.rel = 'stylesheet';
    
    // Add it to the document head
    document.head.appendChild(fontLink);
    
    // Clean up function to remove the link when component unmounts
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  const [sliderValue, setSliderValue] = useState(0);
  const canvasRef = useRef(null);
  const [imagesReady, setImagesReady] = useState(false);
  // Removed showPixelHighlight state
  const [meditationMode, setMeditationMode] = useState(false);
  const [scanlineEffect, setScanlineEffect] = useState(true);
  
  // Use separate state for each image's loaded status
  const [positiveImageLoaded, setPositiveImageLoaded] = useState(false);
  const [negativeImageLoaded, setNegativeImageLoaded] = useState(false);
  
  // Keep track of image data directly
  const [positiveImageData, setPositiveImageData] = useState(null);
  const [negativeImageData, setNegativeImageData] = useState(null);
  
  // Status message state
  const [statusMessage, setStatusMessage] = useState("INITIALIZING...");
  
  // Update imagesReady when both images are loaded
  useEffect(() => {
    if (positiveImageLoaded && negativeImageLoaded) {
      setImagesReady(true);
      setStatusMessage("CONSCIOUSNESS STATES LOADED");
    } else {
      setImagesReady(false);
    }
  }, [positiveImageLoaded, negativeImageLoaded]);
  
  // Handle file uploads
  const handleImageUpload = (event, imageType) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setStatusMessage(`PROCESSING ${imageType.toUpperCase()} IMAGE...`);
    
    // Reset the specific image loaded state
    if (imageType === 'positive') {
      setPositiveImageLoaded(false);
    } else {
      setNegativeImageLoaded(false);
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // Create a new image to load the data
      const img = new Image();
      
      img.onload = () => {
        // Once image is loaded, store it
        if (imageType === 'positive') {
          setPositiveImageData(img);
          setPositiveImageLoaded(true);
        } else {
          setNegativeImageData(img);
          setNegativeImageLoaded(true);
        }
      };
      
      img.onerror = () => {
        setStatusMessage(`ERROR LOADING ${imageType.toUpperCase()} IMAGE`);
      };
      
      // Set the source to trigger loading
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      setStatusMessage(`ERROR READING ${imageType.toUpperCase()} FILE`);
    };
    
    reader.readAsDataURL(file);
  };
  
  // Reset to default images
  const resetImages = () => {
    setStatusMessage("LOADING DEFAULT IMAGES...");
    setPositiveImageLoaded(false);
    setNegativeImageLoaded(false);
    
    // Load positive default image
    const positiveImg = new Image();
    positiveImg.onload = () => {
      setPositiveImageData(positiveImg);
      setPositiveImageLoaded(true);
    };
    positiveImg.onerror = () => {
      setStatusMessage("ERROR LOADING DEFAULT POSITIVE IMAGE");
    };
    positiveImg.src = "/images/laughing-baby.jpg";
    
    // Load negative default image
    const negativeImg = new Image();
    negativeImg.onload = () => {
      setNegativeImageData(negativeImg);
      setNegativeImageLoaded(true);
    };
    negativeImg.onerror = () => {
      setStatusMessage("ERROR LOADING DEFAULT NEGATIVE IMAGE");
    };
    negativeImg.src = "/images/demon-face.jpg";
  };
  
  // Initialize with default images
  useEffect(() => {
    resetImages();
  }, []);
  
  // Render canvas when images are ready or slider changes
  useEffect(() => {
    if (!imagesReady || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const progress = sliderValue / 100;

    
    // Set explicit canvas dimensions
    canvas.width = 600;
    canvas.height = 400;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
      // Draw positive image
      ctx.globalAlpha = 1 - progress;
      ctx.drawImage(positiveImageData, 0, 0, canvas.width, canvas.height);
      
      // Draw negative image
      ctx.globalAlpha = progress;
      ctx.drawImage(negativeImageData, 0, 0, canvas.width, canvas.height);
      
      // Apply scanline effect if enabled
      if (scanlineEffect) {
        applyScanlineEffect(ctx, canvas.width, canvas.height);
      }
      
      // Removed pixel highlight effect
      
      // Add digital border
      drawDigitalBorder(ctx, canvas.width, canvas.height, progress);
    } catch (error) {
      console.error("Error rendering images to canvas:", error);
      setStatusMessage(`RENDERING ERROR: ${error.message}`);
    }
  }, [sliderValue, imagesReady, positiveImageData, negativeImageData, scanlineEffect]);

  // Add this useEffect for meditation mode
  useEffect(() => {
    if (!meditationMode) return;
    
    // Set slider to 0 immediately when entering meditation mode
    setSliderValue(0);
    
    // Track time since meditation started
    const startTime = Date.now();
    
    // Timer for automatic slider movement in meditation mode
    const meditationTimer = setInterval(() => {
      // Calculate elapsed time since meditation started
      const elapsedTime = Date.now() - startTime;
      
      // Create oscillation that starts at 0, goes to 100, then back to 0
      // Using cosine wave that starts at 1, goes to -1, then back to 1
      const time = elapsedTime / 30000; // 30 second full cycle
      const newValue = Math.round(50 - 50 * Math.cos(time * Math.PI));
      
      setSliderValue(newValue);
    }, 50); // Update frequently for smooth movement
    
    // Cleanup timer when meditation mode is turned off
    return () => {
      clearInterval(meditationTimer);
    };
  }, [meditationMode]);
  
  // Draw futuristic digital border
  const drawDigitalBorder = (ctx, width, height, progress) => {
    const cornerSize = 20;
    const progressBarHeight = 2;
    
    // Set border style
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    
    // Draw border corners
    // Top left
    ctx.beginPath();
    ctx.moveTo(0, cornerSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.stroke();
    
    // Top right
    ctx.beginPath();
    ctx.moveTo(width - cornerSize, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, cornerSize);
    ctx.stroke();
    
    // Bottom left
    ctx.beginPath();
    ctx.moveTo(0, height - cornerSize);
    ctx.lineTo(0, height);
    ctx.lineTo(cornerSize, height);
    ctx.stroke();
    
    // Bottom right
    ctx.beginPath();
    ctx.moveTo(width - cornerSize, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, height - cornerSize);
    ctx.stroke();
    
    // Draw progress indicator on top
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(0, 0, width * progress, progressBarHeight);
    
    // Draw progress indicator on bottom
    ctx.fillRect(0, height - progressBarHeight, width * progress, progressBarHeight);
    
    // Add digital readout
    ctx.font = "14px 'Iceland', monospace";
    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`VALENCE: ${Math.round(progress * 100)}%`, 10, height - 10);
  };
  
  // Simple scanline effect
  const applyScanlineEffect = (ctx, width, height) => {
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#000000';
    for (let i = 0; i < height; i += 4) {
      ctx.fillRect(0, i, width, 1);
    }
    ctx.globalAlpha = 1;
  };
  
  // Removed applyHighlightEffect function
  
  // Toggle features
  // Removed togglePixelHighlight function
  const toggleMeditationMode = () => setMeditationMode(!meditationMode);
  const toggleScanlineEffect = () => setScanlineEffect(!scanlineEffect);

  // Custom colors - using saffron and cyan
  const colors = {
    saffron: '#D4804D',
    cyan: '#4FD4C6',
    dark: '#111827',
    darkSecondary: '#1f2937',
    light: '#ecfeff'
  };

  // ===== STYLES =====
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.5rem',
      backgroundColor: colors.dark,
      color: colors.cyan,
      borderRadius: '0.5rem',
      maxWidth: '64rem',
      margin: '0 auto',
      border: `1px solid ${colors.cyan}`,
      boxShadow: `0 10px 15px -3px ${colors.cyan}33`,
      fontFamily: '"Iceland", sans-serif'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: colors.saffron,
      textAlign: 'center',
      letterSpacing: '0.05em',
      textShadow: `0 0 8px ${colors.saffron}33`,
      textTransform: 'uppercase'
    },
    titleSpan: {
      color: colors.cyan
    },
    subtitle: {
      fontSize: '1.2rem',
      marginBottom: '1.5rem',
      color: colors.cyan,
      textAlign: 'center',
      letterSpacing: '0.08em'
    },
    uploadSection: {
      width: '100%',
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: colors.darkSecondary,
      borderRadius: '0.5rem',
      border: `1px solid ${colors.cyan}aa`
    },
    label: {
      display: 'block',
      fontSize: '1rem',
      fontWeight: 'bold',
      color: colors.saffron,
      marginBottom: '0.5rem',
      textAlign: 'center',
      letterSpacing: '0.05em'
    },
    uploadRow: {
      margin: '0.75rem 0',
      textAlign: 'center'
    },
    fileInput: {
      maxWidth: '300px',
      margin: '0 auto',
      padding: '5px',
      backgroundColor: colors.dark,
      color: colors.cyan,
      border: `1px solid ${colors.cyan}aa`,
      borderRadius: '4px',
      fontFamily: '"Iceland", sans-serif',
      fontSize: '0.9rem'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'center',
      margin: '1rem 0'
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: colors.darkSecondary,
      color: colors.cyan,
      borderRadius: '0.25rem',
      fontSize: '1rem',
      border: `1px solid ${colors.cyan}`,
      cursor: 'pointer',
      fontFamily: '"Iceland", sans-serif',
      letterSpacing: '0.05em'
    },
    canvasContainer: {
      position: 'relative',
      width: '100%',
      marginBottom: '1.5rem',
      backgroundColor: '#000',
      borderRadius: '0.5rem',
      border: `1px solid ${colors.cyan}`,
      padding: '0.25rem',
      height: '400px',
      overflow: 'hidden'
    },
    canvas: {
      width: '100%',
      height: '100%',
      display: 'block'
    },
    loadingContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.dark,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingText: {
      color: colors.saffron,
      fontSize: '1.3rem',
      marginBottom: '1.5rem',
      fontFamily: '"Iceland", sans-serif',
      letterSpacing: '0.1em',
      textShadow: `0 0 8px ${colors.saffron}33`
    },
    statusInfo: {
      color: colors.cyan,
      fontSize: '1rem',
      padding: '0.75rem',
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: '4px',
      maxWidth: '80%',
      textAlign: 'center',
      fontFamily: '"Iceland", sans-serif',
      letterSpacing: '0.05em'
    },
    sliderContainer: {
      width: '100%',
      padding: '0.75rem 1rem',
      marginBottom: '1rem', // Reduced from 1.5rem to bring controls closer
      backgroundColor: colors.darkSecondary,
      borderRadius: '0.5rem',
      border: `1px solid ${colors.cyan}aa`
    },
    sliderLabels: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
      fontSize: '1rem',
      color: colors.saffron,
      fontFamily: '"Iceland", sans-serif',
      letterSpacing: '0.05em'
    },
    slider: {
      width: '100%',
      height: '6px',
      backgroundColor: colors.dark,
      appearance: 'none',
      WebkitAppearance: 'none',
      outline: 'none',
      borderRadius: '3px'
    },
    sliderValue: {
      marginTop: '0.75rem',
      textAlign: 'center',
      color: colors.cyan,
      fontFamily: '"Iceland", sans-serif',
      fontSize: '1.1rem',
      letterSpacing: '0.05em'
    },
    controlButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.8rem',
      justifyContent: 'center',
      marginBottom: '1.5rem', // Added margin to separate from instructions below
    },
    controlButton: (active) => ({
      padding: '0.5rem 1rem',
      margin: '0.25rem',
      backgroundColor: active ? colors.darkSecondary : colors.dark,
      color: active ? colors.saffron : colors.cyan,
      borderRadius: '0.5rem',
      border: `1px solid ${active ? colors.saffron : colors.cyan}`,
      cursor: 'pointer',
      fontSize: '1rem',
      fontFamily: '"Iceland", sans-serif',
      letterSpacing: '0.05em'
    }),
    meditationInstructions: {
      backgroundColor: colors.darkSecondary,
      padding: '1rem',
      borderRadius: '0.5rem',
      width: '100%',
      marginBottom: '1rem',
      border: `1px solid ${colors.cyan}aa`
    },
    instructionsTitle: {
      fontSize: '1.3rem',
      fontWeight: 'semibold',
      marginBottom: '0.75rem',
      color: colors.saffron,
      textAlign: 'center',
      fontFamily: '"Iceland", sans-serif',
      letterSpacing: '0.05em',
      textShadow: `0 0 8px ${colors.saffron}33`
    },
    instructionsText: {
      color: colors.light,
      marginBottom: '0.75rem',
      fontSize: '1.2rem',
      textAlign: 'center',
      fontFamily: '"Iceland", sans-serif',
      lineHeight: '1.4'
    },
    instructionsBox: {
        backgroundColor: colors.dark,
        padding: '0.75rem',
        borderRadius: '0.25rem',
        border: `1px solid ${colors.cyan}aa`,
        fontSize: '1.1rem',
        color: colors.cyan,
        fontFamily: '"Iceland", sans-serif'
    },
    footer: {
      marginTop: '1rem',
      textAlign: 'center',
      fontSize: '1rem',
      color: colors.saffron,
      fontFamily: '"Iceland", sans-serif',
      letterSpacing: '0.05em',
      textShadow: `0 0 8px ${colors.saffron}33`
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>
        <span style={styles.titleSpan}></span> Valence Configuration Protocol <span style={styles.titleSpan}></span>
      </h2>
      <p style={styles.subtitle}>
        
      </p>
      
      {/* Image Upload Controls */}
      <div style={styles.uploadSection}>
        <div style={styles.uploadRow}>
          <label style={styles.label}>POSITIVE STATE:</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'positive')}
            style={styles.fileInput}
          />
        </div>
        
        <div style={styles.uploadRow}>
          <label style={styles.label}>NEGATIVE STATE:</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'negative')}
            style={styles.fileInput}
          />
        </div>
        
        <div style={styles.buttonContainer}>
          <button onClick={resetImages} style={styles.button}>
            RESET DEFAULT IMAGES
          </button>
        </div>
      </div>
      
      {/* Canvas Display */}
      <div style={styles.canvasContainer}>
        {!imagesReady ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingText}>{statusMessage}</div>
            <div style={styles.statusInfo}>
              Positive image: {positiveImageLoaded ? "Loaded" : "Waiting"}<br/>
              Negative image: {negativeImageLoaded ? "Loaded" : "Waiting"}
            </div>
          </div>
        ) : (
          <canvas ref={canvasRef} style={styles.canvas} />
        )}
      </div>
      
      {/* Slider controls */}
      <div style={styles.sliderContainer}>
        <div style={styles.sliderLabels}>
          <span>POSITIVE STATE</span>
          <span>NEGATIVE STATE</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={(e) => setSliderValue(parseInt(e.target.value))}
          disabled={meditationMode}
          style={styles.slider}
        />
        <div style={styles.sliderValue}>
          CURRENT VALENCE: {sliderValue}%
        </div>
      </div>
      
      {/* Control buttons - Moved up above meditation instructions */}
      <div style={styles.controlButtons}>
        <button
          onClick={toggleMeditationMode}
          style={styles.controlButton(meditationMode)}
        >
          {meditationMode ? '◉ EXIT' : '○ ENTER'} MEDITATION MODE
        </button>
        
        <button
          onClick={toggleScanlineEffect}
          style={styles.controlButton(scanlineEffect)}
        >
          {scanlineEffect ? '◉ DISABLE' : '○ ENABLE'} CYBER OVERLAY
        </button>
      </div>
      
      {/* Meditation instructions */}
      <div style={styles.meditationInstructions}>
        <h3 style={styles.instructionsTitle}>◊ MEDITATION PROTOCOL ◊</h3>
        <p style={styles.instructionsText}>
          Move through the spectrum of valence states with mindful attention. 
          Observe precisely when perception shifts between positive and negative.
          Notice how each image is the same screen with a different configuration of pixels.
        </p>
        <div style={styles.instructionsBox}>
          <p style={{marginBottom: '0.8rem', fontSize: '1.1rem'}}>
            <span style={{color: colors.saffron}}>▹</span> Is there a discrete boundary between experiences, or a continuous spectrum?
          </p>
          <p style={{marginBottom: '0.8rem', fontSize: '1.1rem'}}>
            <span style={{color: colors.saffron}}>▹</span> Are these truly different states, or reconfigurations of the same consciousness?
          </p>
          <p style={{marginBottom: '0.8rem', fontSize: '1.1rem'}}>
            <span style={{color: colors.saffron}}>▹</span> Notice how the self that perceives both states remains unchanged throughout.
          </p>
          <p>
            <span style={{color: colors.saffron}}>▹</span> Your everyday experience is the same consciousness moving the same elements around to create different valence states.
          </p>
        </div>
      </div>
      
      <div style={styles.footer}>
        ॐ SATTVAGENIC CONSCIOUSNESS TECHNOLOGIES ॐ
      </div>
    </div>
  );
};

export default CyberSanghaConsciousnessExplorer;
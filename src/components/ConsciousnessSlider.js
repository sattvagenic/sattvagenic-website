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

  // Define default image pairs
  const defaultImagePairs = [
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
      positive: "/images/sunrise.jpg",
      negative: "/images/storm.jpg",
      name: "Dawn / Storm",
      audio: "/audio/dawn-storm.mp3"
    },
    {
      positive: "/images/flower.jpg",
      negative: "/images/decay.jpg",
      name: "Growth / Decay",
      audio: "/audio/growth-decay.mp3"
    },
    {
      positive: "/images/celebration.jpg",
      negative: "/images/sorrow.jpg",
      name: "Celebration / Sorrow",
      audio: "/audio/celebration-sorrow.mp3"
    },
    {
      positive: "/images/calm-water.jpg",
      negative: "/images/turbulent-sea.jpg",
      name: "Calm / Turbulent",
      audio: "/audio/calm-turbulent.mp3"
    }
  ];

  const [currentDefaultPairIndex, setCurrentDefaultPairIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const canvasRef = useRef(null);
  const [imagesReady, setImagesReady] = useState(false);
  const [meditationMode, setMeditationMode] = useState(false);
  const [scanlineEffect, setScanlineEffect] = useState(true);
  const [audioMuted, setAudioMuted] = useState(true); // Changed from audioEnabled to audioMuted, defaulting to true
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  
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
  
  // Load specific default pair
  const loadDefaultPair = (index) => {
    const pair = defaultImagePairs[index];
    setStatusMessage(`LOADING DEFAULT PAIR: ${pair.name.toUpperCase()}...`);
    setPositiveImageLoaded(false);
    setNegativeImageLoaded(false);
    
    // Load positive default image
    const positiveImg = new Image();
    positiveImg.onload = () => {
      setPositiveImageData(positiveImg);
      setPositiveImageLoaded(true);
    };
    positiveImg.onerror = () => {
      // If default image fails, create a placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#4FD4C6';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#000';
      ctx.font = '30px Iceland';
      ctx.textAlign = 'center';
      ctx.fillText('POSITIVE STATE', 300, 200);
      
      const placeholderImg = new Image();
      placeholderImg.onload = () => {
        setPositiveImageData(placeholderImg);
        setPositiveImageLoaded(true);
      };
      placeholderImg.src = canvas.toDataURL();
    };
    positiveImg.src = pair.positive;
    
    // Load negative default image
    const negativeImg = new Image();
    negativeImg.onload = () => {
      setNegativeImageData(negativeImg);
      setNegativeImageLoaded(true);
    };
    negativeImg.onerror = () => {
      // If default image fails, create a placeholder
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#D4804D';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#000';
      ctx.font = '30px Iceland';
      ctx.textAlign = 'center';
      ctx.fillText('NEGATIVE STATE', 300, 200);
      
      const placeholderImg = new Image();
      placeholderImg.onload = () => {
        setNegativeImageData(placeholderImg);
        setNegativeImageLoaded(true);
      };
      placeholderImg.src = canvas.toDataURL();
    };
    negativeImg.src = pair.negative;
  };
  
  // Navigate to previous default pair
  const previousDefaultPair = () => {
    const newIndex = (currentDefaultPairIndex - 1 + defaultImagePairs.length) % defaultImagePairs.length;
    setCurrentDefaultPairIndex(newIndex);
    loadDefaultPair(newIndex);
  };
  
  // Navigate to next default pair
  const nextDefaultPair = () => {
    const newIndex = (currentDefaultPairIndex + 1) % defaultImagePairs.length;
    setCurrentDefaultPairIndex(newIndex);
    loadDefaultPair(newIndex);
  };
  
  // Initialize audio - create it but don't play yet
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.crossOrigin = "anonymous";
      audio.muted = audioMuted; // Use current mute state
      audioRef.current = audio;
      
      // Create Web Audio API context for volume control
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      const source = audioContextRef.current.createMediaElementSource(audio);
      gainNodeRef.current = audioContextRef.current.createGain();
      
      source.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      // Load audio but don't play yet
      const currentPair = defaultImagePairs[currentDefaultPairIndex];
      if (currentPair.audio) {
        audio.src = currentPair.audio;
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update audio source when changing pairs
  useEffect(() => {
    if (audioRef.current) {
      const currentPair = defaultImagePairs[currentDefaultPairIndex];
      if (currentPair.audio) {
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.src = currentPair.audio;
        // Only play if it was already playing (meditation mode is on)
        if (wasPlaying) {
          audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        }
      }
    }
  }, [currentDefaultPairIndex]);

  // Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = audioMuted;
    }
  }, [audioMuted]);

  // Update audio volume based on slider value - NO FADE IN, direct control
  useEffect(() => {
    if (audioRef.current && gainNodeRef.current) {
      const normalizedValue = sliderValue / 100;
      
      // Direct volume control based on slider position
      // At 0% (positive): full volume
      // At 50%: mid volume  
      // At 100% (negative): full volume
      // This creates a dip in the middle, or you can adjust as needed
      
      // Option 1: Simple linear volume (always full)
      gainNodeRef.current.gain.setValueAtTime(
        1.0, // Always full volume, no fade
        audioContextRef.current.currentTime
      );
      
      // Option 2: If you want volume to follow morph (uncomment below, comment above)
      // const volume = 1.0 - Math.abs(normalizedValue - 0.5) * 0.5; // Dips to 0.75 at midpoint
      // gainNodeRef.current.gain.setValueAtTime(
      //   volume,
      //   audioContextRef.current.currentTime
      // );
    }
  }, [sliderValue]);
  
  // Initialize with first default pair
  useEffect(() => {
    loadDefaultPair(0);
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
      
      // Add digital border
      drawDigitalBorder(ctx, canvas.width, canvas.height, progress);
    } catch (error) {
      console.error("Error rendering images to canvas:", error);
      setStatusMessage(`RENDERING ERROR: ${error.message}`);
    }
  }, [sliderValue, imagesReady, positiveImageData, negativeImageData]);

  // Add this useEffect for meditation mode
  useEffect(() => {
    if (!meditationMode) {
      // Stop audio when exiting meditation
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }
    
    // Start audio when entering meditation
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    
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
      const time = elapsedTime / 31500; // 30 second full cycle
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
  
  // Toggle features
  const toggleMeditationMode = () => setMeditationMode(!meditationMode);
  const toggleAudioMuted = () => setAudioMuted(!audioMuted); // Changed function name

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
      alignItems: 'center',
      margin: '1rem 0',
      gap: '0.5rem'
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
    arrowButton: {
      padding: '0.5rem 0.75rem',
      backgroundColor: colors.darkSecondary,
      color: colors.saffron,
      borderRadius: '0.25rem',
      fontSize: '1.2rem',
      border: `1px solid ${colors.saffron}`,
      cursor: 'pointer',
      fontFamily: '"Iceland", sans-serif',
      minWidth: '40px'
    },
    defaultPairIndicator: {
      color: colors.cyan,
      fontSize: '0.9rem',
      marginTop: '0.5rem',
      textAlign: 'center',
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
      marginBottom: '1rem',
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
      marginBottom: '1.5rem',
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
          <button onClick={previousDefaultPair} style={styles.arrowButton} title="Previous default pair">
            ◀
          </button>
          <button onClick={() => loadDefaultPair(currentDefaultPairIndex)} style={styles.button}>
            LOAD DEFAULT PAIR
          </button>
          <button onClick={nextDefaultPair} style={styles.arrowButton} title="Next default pair">
            ▶
          </button>
        </div>
        <div style={styles.defaultPairIndicator}>
          [{currentDefaultPairIndex + 1}/{defaultImagePairs.length}] {defaultImagePairs[currentDefaultPairIndex].name}
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
      
      {/* Control buttons */}
      <div style={styles.controlButtons}>
        <button
          onClick={toggleMeditationMode}
          style={styles.controlButton(meditationMode)}
        >
          {meditationMode ? '◉ EXIT' : '○ ENTER'} MEDITATION MODE
        </button>
        
        <button
          onClick={toggleAudioMuted}
          style={styles.controlButton(!audioMuted)}
        >
          {audioMuted ? '🔇 UNMUTE' : '🔊 MUTE'} AUDIO
        </button>
      </div>
      
      {/* Meditation instructions */}
      <div style={styles.meditationInstructions}>
        <h3 style={styles.instructionsTitle}>◊ MEDITATION PROTOCOL ◊</h3>
        <p style={styles.instructionsText}>
          Move through the spectrum of valence states with mindful attention. 
          Observe precisely when perception shifts between positive and negative.
          Notice the subtle reactions in the body and mind.
        </p>
        <div style={styles.instructionsBox}>
          <p style={{marginBottom: '0.8rem', fontSize: '1.1rem'}}>
            <span style={{color: colors.saffron}}>▹</span> Is there a discrete boundary between experiences, or a continuous spectrum?
          </p>
          <p style={{marginBottom: '0.8rem', fontSize: '1.1rem'}}>
            <span style={{color: colors.saffron}}>▹</span> Are these truly different states, or reconfigurations of the same consciousness?
          </p>
          <p style={{marginBottom: '0.8rem', fontSize: '1.1rem'}}>
            <span style={{color: colors.saffron}}>▹</span> Notice how the awareness that perceives both states remains unchanged throughout.
          </p>
          <p>
            <span style={{color: colors.saffron}}>▹</span> Your everyday experience is the same consciousness moving the same elements around to create different valence states.
          </p>
        </div>
      </div>
      
      <div style={styles.footer}>
        ॐ SATTVAGENIC LABS ॐ
      </div>
    </div>
  );
};

export default CyberSanghaConsciousnessExplorer;
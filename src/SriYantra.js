import { useState, useEffect, useRef } from 'react'; 
import GlyphButton from './components/GlyphButton';
import templeFrame from './images/templeDoor.png';
import Pranayama from './components/Pranayama';
import MeditationAnalysis from './components/MeditationAnalysis';

const SriYantra = () => {
    const [stage, setStage] = useState('glyph');
    const [isStrobing, setIsStrobing] = useState(true);
    const [isAppearing, setIsAppearing] = useState(false);
    const [isDisappearing, setIsDisappearing] = useState(false);
    const [audio] = useState(new Audio('/audio/yantra-meditation.mp3')); 
    const fullscreenRef = useRef(null);
    const [showFullscreenText, setShowFullscreenText] = useState(false);
    const [meditationStartTime, setMeditationStartTime] = useState(null);
    const [yantraFaded, setYantraFaded] = useState(false);
    const [showCoherenceMessage, setShowCoherenceMessage] = useState(false);
    const [coherenceMessage, setCoherenceMessage] = useState("Perceptual Hyper-coherence Achieved");
    const [showButtons, setShowButtons] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [wakeLock, setWakeLock] = useState(null);
    
   // New refs and state for dynamic positioning
const templeImageRef = useRef(null);

const [doorwayStyle, setDoorwayStyle] = useState({
  position: 'absolute',
  opacity: 0, // Hide until positioned
});

const [blackBackdropStyle, setBlackBackdropStyle] = useState({
  position: 'absolute',
  background: 'black',
  opacity: 0, // Hide until positioned
});

// Add state for calibration mode
const [isCalibrating, setIsCalibrating] = useState(false);
const [calibrationValues, setCalibrationValues] = useState({
  left: 729,   // Actual pixel position of doorway from left
  top: 596,    // Actual pixel position of doorway from top
  width: 631,  // Width from inch calculations
  height: 907  // Height from inch calculations
});

// Temple configuration - using actual pixel measurements
const TEMPLE_CONFIG = {
  originalWidth: 2048,
  originalHeight: 2048,
  doorway: calibrationValues
};

// ---- Safari-safe constants (declare ONCE in this file) ----
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const BACKDROP_TOP_PAD = 10;       // same as before
const BACKDROP_BOTTOM_PAD = 17;    // extra black at bottom
const BACKDROP_SIDE_PAD = 10;      // same as before
const SAFARI_SHIFT = 6;            // nudge backdrop DOWN in Safari

// Function to calculate doorway position (Safari-safe)
const calculateDoorwayPosition = () => {
  if (!templeImageRef.current) return;
  const img = templeImageRef.current;

  // Defer to next frame so Safari has finished layout/paint
  requestAnimationFrame(() => {
    const renderedWidth = img.offsetWidth;
    const scale = renderedWidth / TEMPLE_CONFIG.originalWidth;

    // Scale doorway measurements
    const doorwayLeft = TEMPLE_CONFIG.doorway.left * scale;
    const doorwayTop = TEMPLE_CONFIG.doorway.top * scale;
    const doorwayWidth = TEMPLE_CONFIG.doorway.width * scale;
    const doorwayHeight = TEMPLE_CONFIG.doorway.height * scale;

    // Round to avoid fractional shortfalls
    const w = Math.ceil(doorwayWidth);
    const h = Math.ceil(doorwayHeight);

    // Black backdrop: with Safari downward shift + extra bottom padding
    setBlackBackdropStyle({
      position: 'absolute',
      left:   `${Math.floor(doorwayLeft - BACKDROP_SIDE_PAD)}px`,
      top:    `${Math.floor(doorwayTop  - BACKDROP_TOP_PAD + (isSafari ? SAFARI_SHIFT : 0))}px`,
      width:  `${w + BACKDROP_SIDE_PAD * 2}px`,
      height: `${h + BACKDROP_TOP_PAD + BACKDROP_BOTTOM_PAD}px`,
      background: 'black',
      opacity: 1,
      zIndex: 0,
    });

    // Doorway content: exact fit (no shift)
    // Doorway content: exact fit, with Safari nudge for text centering
setDoorwayStyle({
  position: 'absolute',
  left:   `${Math.round(doorwayLeft)}px`,
  top:    `${Math.round(doorwayTop + (isSafari ? 26 : 0))}px`, // shift text down 2px on Safari
  width:  `${w}px`,
  height: `${h}px`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 1,
  transition: 'opacity 0.3s ease',
  zIndex: 3,
  margin: 0,
  marginTop: 0,
  transform: 'none',
  padding: 0,
});

  });
};

// Set up resize observer and image load handler
useEffect(() => {
  // run once, then again next tick (some Safari builds need the second pass)
  calculateDoorwayPosition();
  setTimeout(calculateDoorwayPosition, 0);

  const handleResize = () => calculateDoorwayPosition();

  if (window.ResizeObserver && templeImageRef.current) {
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(templeImageRef.current);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', handleResize);
    };
  } else {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }
}, []);

// Ensure positioning updates when image loads (Safari-safe delay)
useEffect(() => {
  if (!templeImageRef.current) return;
  const img = templeImageRef.current;

  if (img.complete) {
    requestAnimationFrame(calculateDoorwayPosition);
  } else {
    const onLoad = () => requestAnimationFrame(calculateDoorwayPosition);
    img.addEventListener('load', onLoad);
    return () => img.removeEventListener('load', onLoad);
  }
}, []);



    const resetAllStates = () => {
        console.log('Resetting all states');
        setShowAnalysis(false);
        setShowCoherenceMessage(false);
        setShowButtons(false);
        setYantraFaded(false);
        setIsStrobing(false);
        setIsAppearing(false);
        setIsDisappearing(false);
        setShowFullscreenText(false);
        setStage('glyph');
    };

    // Add audio effect
    useEffect(() => {
        if (stage === 'fullscreen-strobing') {
            audio.play().catch(error => console.log('Audio play failed:', error));
        } else {
            audio.pause();
            audio.currentTime = 0;
        }
    }, [stage, audio]);

    // Add audio cleanup
    useEffect(() => {
        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [audio]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                console.log('Exiting fullscreen, forcing reset to initial state');
                setStage('glyph');
                setIsStrobing(false);
                resetAllStates();
            }
        };
    
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Reset fullscreen on mount
    useEffect(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log('Error exiting fullscreen:', err));
        }
    }, []);

    useEffect(() => {
        if (stage !== 'fullscreen-strobing') {
          setIsStrobing(false);
        }
    }, [stage]);

    useEffect(() => {
    let keepAliveInterval;
    let video;

    const preventSleep = async () => {
        // Native Wake Lock API
        if ('wakeLock' in navigator) {
            try {
                const lock = await navigator.wakeLock.request('screen');
                setWakeLock(lock);
                console.log('Wake Lock activated');
                lock.addEventListener('release', () => console.log('Wake Lock released'));
            } catch (err) {
                console.log('Wake Lock error:', err);
            }
        }

        // iOS Safari fallback: hidden looping video
        video = document.createElement('video');
        video.setAttribute('loop', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.setAttribute(
            'style',
            'position: fixed; top: 0; left: 0; width: 1px; height: 1px; opacity: 0;'
        );
        document.body.appendChild(video);
        video.play().catch(() => console.log('Video play failed'));

        // Periodic small DOM change to keep screen awake
        keepAliveInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                document.body.style.opacity =
                    document.body.style.opacity === '0.999999' ? '1' : '0.999999';
            }
        }, 30000);
    };

    // Only run wake lock during these stages
    if (
        stage === 'pranayama' ||
        stage === 'still-yantra' ||
        stage === 'fullscreen-strobing' ||
        stage === 'fullscreen-still'
    ) {
        preventSleep();
    }

    return () => {
        if (wakeLock) wakeLock.release();
        if (video && video.parentNode) video.parentNode.removeChild(video);
        if (keepAliveInterval) clearInterval(keepAliveInterval);
    };
}, [stage]);


    


    useEffect(() => {
        console.log('Stage changed to:', stage);
    }, [stage]);

    useEffect(() => {
        if (stage === 'yantra') {
            setIsStrobing(true);
        }
    }, [stage]);

    useEffect(() => {
        if (stage === 'still-yantra') {
            setTimeout(() => {
                setIsAppearing(true);
            }, 50);
        } else {
            setIsAppearing(false);
        }
    }, [stage]);

    const handleYantraClick = () => {
        console.log('Current stage:', stage);
    
        if (stage === 'still-yantra') {
            if (fullscreenRef.current) {
                fullscreenRef.current.requestFullscreen().then(() => {
                    setStage('fullscreen-strobing');
                    setIsStrobing(true);
                    setMeditationStartTime(Date.now());
                    setShowFullscreenText(true);
    
                    setTimeout(() => {
                        setShowFullscreenText(false);
                    }, 6000);
    
                    setTimeout(() => {
                        const duration = (Date.now() - meditationStartTime) / 1000;
                        if (duration >= 600) {
                            setCoherenceMessage("Perceptual Hyper-coherence Achieved");
                        }
                        setIsStrobing(false);
                        setStage('fullscreen-still');
                    }, 600000);
                });
            }
        } else if (stage === 'fullscreen-strobing') {
            const duration = meditationStartTime ? (Date.now() - meditationStartTime) / 1000 : 0;
            if (duration < 600) {
                setCoherenceMessage("Perceptual Hyper-coherence Incomplete");
            }
            setIsStrobing(false);
            setStage('fullscreen-still');
        } else if (stage === 'fullscreen-still') {
            setYantraFaded(true);
            setTimeout(() => {
                setShowCoherenceMessage(true);
                setTimeout(() => {
                    setShowButtons(true);
                }, 2000);
            }, 800);
        }
    };

    const handleAnalysis = () => {
        if (fullscreenRef.current) {
            fullscreenRef.current.classList.add('exiting');
        }
        
        setTimeout(() => {
            if (document.fullscreenElement) {
                document.exitFullscreen().then(() => {
                    setIsDisappearing(true);
                    setTimeout(() => {
                        setStage('glyph');
                        setIsDisappearing(false);
                        if (fullscreenRef.current) {
                            fullscreenRef.current.classList.remove('exiting');
                        }
                        resetAllStates();
                        setTimeout(() => {
                            setShowAnalysis(true);
                        }, 500);
                    }, 800);
                });
            }
        }, 700);
    };

    const handleCloseAnalysis = () => {
        setShowAnalysis(false);
        resetAllStates();  
    };

    useEffect(() => {
        if (stage === 'fullscreen-still' && !document.fullscreenElement) {
            console.log('Caught incorrect fullscreen stage, resetting to glyph');
            setStage('glyph');
            resetAllStates();
        }
    }, [stage]);

    return (
        <>
            <div className="temple-container">
                <div className="content-wrapper" style={{ 
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    aspectRatio: '1/1'  // Make wrapper square
                }}>
                    <img 
                        ref={templeImageRef}
                        src={templeFrame} 
                        alt="Ancient temple doorway"
                        // NO className - we don't want .temple-frame styles
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            display: 'block',
                            objectFit: 'contain',  // This keeps aspect ratio
                            margin: 0,
                            padding: 0,
                            transform: 'none',
                            zIndex: 1
                        }}
                        onLoad={calculateDoorwayPosition}
                    />
                    
                    {/* Both backdrop and doorway positioned absolutely within content-wrapper */}
                    <div style={blackBackdropStyle} />
                    <div className="doorway-content" style={doorwayStyle}>
                       {stage === 'glyph' && (
    <div style={{
        width: '30%',
        height: '30%',
        maxWidth: '120px',
        maxHeight: '120px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }}>
        <GlyphButton 
    onClick={() => setStage('pranayama')}
    className="entrance-glyph responsive-glyph"
/>
    </div>
)}
                        
                        {stage === 'pranayama' && (
                            <Pranayama onComplete={() => setStage('still-yantra')} />
                        )}

                        {(stage === 'still-yantra' || stage === 'fullscreen-strobing' || stage === 'fullscreen-still') && (
                            <div 
                                ref={fullscreenRef}
                                className={`yantra-container ${(stage === 'fullscreen-strobing' || stage === 'fullscreen-still') ? 'fullscreen' : ''} 
                                ${isDisappearing ? 'disappear' : ''} ${isAppearing ? 'appear' : ''}`}
                                onClick={handleYantraClick}
                                style={{ 
                                    cursor: 'pointer',
                                    position: 'relative',
                                    zIndex: 100,
                                    width: '100%',
                                    height: '100%'
                                }}
                            >
                                {stage === 'still-yantra' && (
                                    <div className="kosha-text visible">
                                        Activate Photonic Yantra Entrainment
                                    </div>
                                )}
                                {stage === 'fullscreen-strobing' && showFullscreenText && (
                                    <div className="fullscreen-instruction visible">
                                        Commencing Re-patterning Protocol...
                                    </div>
                                )}
                                {showCoherenceMessage && (
                                    <>
                                        <div className="coherence-message visible">
                                            {coherenceMessage}
                                        </div>
                                    </>
                                )}
                                <div className="energy-field"></div>
                                <svg 
                                    id="Layer_1" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    version="1.1" 
                                    viewBox="0 0 432 432"
                                    className={`sri-yantra ${isStrobing ? 'strobing' : ''}`}
                                    style={{ 
                                        stroke: '#FF0000',  // Temporary RED color to make it visible
                                        fill: 'none',
                                        strokeWidth: '2px',
                                        transition: 'filter 0.3s ease, opacity 0.8s ease',
                                        opacity: yantraFaded ? 0.1 : 1,
                                        width: '80%',  // Make it 80% of container
                                        height: '80%',
                                        position: 'absolute',
                                        top: '10%',
                                        left: '12%'
                                    }}
                                    title={isStrobing ? "Click to stop" : "Click to start strobing"}
                                >
                                    {/* Your full SVG yantra code goes here */}
                                    <svg 
                                    id="Layer_1" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    version="1.1" 
                                    viewBox="0 0 432 432"
                                    className={`sri-yantra ${isStrobing ? 'strobing' : ''}`}
                                    style={{ 
                                        stroke: '#4FD4C6',
                                        transition: 'filter 0.3s ease, opacity 0.8s ease',
                                        opacity: yantraFaded ? 0.1 : 1
                                    }}
                                    title={isStrobing ? "Click to stop" : "Click to start strobing"}
                                >
                                    {/* Your full SVG yantra code goes here */}
                                    <g>
    <circle cx="216" cy="216" r="122.77" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <circle cx="216" cy="216" r="126.78" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <circle cx="216" cy="216" r="130.43" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <circle cx="216" cy="216" r="134.83" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
  </g>
  <g>
    <polygon points="216 306.44 302.69 193.74 129.31 193.74 216 306.44" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polygon points="216 278.96 277.88 174.25 154.12 174.25 216 278.96" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polygon points="216 227.62 267.15 154.03 164.85 154.03 216 227.62" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polygon points="216 260.94 245.09 202.97 186.91 202.97 216 260.94" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polygon points="216 239.26 237.51 212.3 194.49 212.3 216 239.26" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
  </g>
  <g>
    <polygon points="216 126.55 302.69 239.26 129.31 239.26 216 126.55" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polygon points="216 154.03 280.37 260.94 151.63 260.94 216 154.03" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polygon points="216 193.74 260.5 278.96 171.5 278.96 216 193.74" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polygon points="216 174.25 246.17 227.62 185.83 227.62 216 174.25" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
  </g>
  <g>
    <circle cx="216" cy="216" r="90.35" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <circle cx="216" cy="216" r="104.38" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <g>
      <path d="M181.93,300.51s-.52,6.73,4.98,9.42,20.24,3.4,29.04,10.46c8.8-7.05,23.54-7.75,29.04-10.43s4.99-9.41,4.99-9.41" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <path d="M132.16,251.67s-5.13,4.39-3.14,10.18c1.99,5.79,11.91,16.72,13.13,27.93,11.21,1.23,22.13,11.16,27.92,13.16s10.19-3.13,10.19-3.13" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <path d="M131.49,181.93s-6.73-.52-9.42,4.98c-2.68,5.5-3.4,20.24-10.46,29.04,7.05,8.8,7.75,23.54,10.43,29.04s9.41,4.99,9.41,4.99" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <path d="M180.33,132.16s-4.39-5.13-10.18-3.14c-5.79,1.99-16.72,11.91-27.93,13.13-1.23,11.21-11.16,22.13-13.16,27.92s3.13,10.19,3.13,10.19" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <path d="M250.07,131.49s.52-6.73-4.98-9.42c-5.5-2.68-20.24-3.4-29.04-10.46-8.8,7.05-23.54,7.75-29.04,10.43-5.51,2.68-4.99,9.41-4.99,9.41" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <path d="M299.84,180.33s5.13-4.39,3.14-10.18c-1.99-5.79-11.91-16.72-13.13-27.93-11.21-1.23-22.13-11.16-27.92-13.16s-10.19,3.13-10.19,3.13" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <path d="M300.51,250.07s6.73.52,9.42-4.98,3.4-20.24,10.46-29.04c-7.05-8.8-7.75-23.54-10.43-29.04-2.68-5.51-9.41-4.99-9.41-4.99" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <path d="M251.67,299.84s4.39,5.13,10.18,3.14c5.79-1.99,16.72-11.91,27.93-13.13,1.23-11.21,11.16-22.13,13.16-27.92s-3.13-10.19-3.13-10.19" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </g>
    <g>
      <g id="_x3C_Radial_Repeat_x3E_">
        <path d="M194.99,319.15s-.34,6.28,2.97,8.79c3.31,2.52,12.19,3.22,17.46,9.82,5.33-6.56,14.22-7.17,17.56-9.66s3.05-8.76,3.05-8.76" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_1" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M157.12,303.26s-2.72,5.67-.63,9.26c2.09,3.59,10.03,7.64,12.37,15.76,7.44-4.02,15.89-1.18,19.92-2.2s6.17-6.93,6.17-6.93" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_2" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M128.2,274.09s-4.68,4.2-4.12,8.31c.56,4.12,6.35,10.9,5.4,19.3,8.41-.86,15.13,4.99,19.24,5.58,4.11.6,8.35-4.04,8.35-4.04" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_3" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M112.66,236.07s-5.93,2.09-6.99,6.1c-1.06,4.02,1.69,12.5-2.39,19.89,8.1,2.42,12.07,10.4,15.64,12.52,3.57,2.13,9.26-.54,9.26-.54" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_4" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M112.84,194.99s-6.28-.34-8.79,2.97c-2.52,3.31-3.22,12.19-9.82,17.46,6.56,5.33,7.17,14.22,9.66,17.56,2.49,3.33,8.76,3.05,8.76,3.05" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_5" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M128.74,157.12s-5.67-2.72-9.26-.63c-3.59,2.09-7.64,10.03-15.76,12.37,4.02,7.44,1.18,15.89,2.2,19.92,1.02,4.03,6.93,6.17,6.93,6.17" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_6" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M157.91,128.2s-4.2-4.68-8.31-4.12c-4.12.56-10.9,6.35-19.3,5.4.86,8.41-4.99,15.13-5.58,19.24-.6,4.11,4.04,8.35,4.04,8.35" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_7" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M195.93,112.66s-2.09-5.93-6.1-6.99c-4.02-1.06-12.5,1.69-19.89-2.39-2.42,8.1-10.4,12.07-12.52,15.64-2.13,3.57.54,9.26.54,9.26" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_8" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M237.01,112.84s.34-6.28-2.97-8.79c-3.31-2.52-12.19-3.22-17.46-9.82-5.33,6.56-14.22,7.17-17.56,9.66-3.33,2.49-3.05,8.76-3.05,8.76" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_9" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M274.88,128.74s2.72-5.67.63-9.26c-2.09-3.59-10.03-7.64-12.37-15.76-7.44,4.02-15.89,1.18-19.92,2.2-4.03,1.02-6.17,6.93-6.17,6.93" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_10" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M303.8,157.91s4.68-4.2,4.12-8.31c-.56-4.12-6.35-10.9-5.4-19.3-8.41.86-15.13-4.99-19.24-5.58-4.11-.6-8.35,4.04-8.35,4.04" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_11" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M319.34,195.93s5.93-2.09,6.99-6.1c1.06-4.02-1.69-12.5,2.39-19.89-8.1-2.42-12.07-10.4-15.64-12.52-3.57-2.13-9.26.54-9.26.54" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_12" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M319.15,237.01s6.28.34,8.79-2.97c2.52-3.31,3.22-12.19,9.82-17.46-6.56-5.33-7.17-14.22-9.66-17.56-2.49-3.33-8.76-3.05-8.76-3.05" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_13" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M303.26,274.88s5.67,2.72,9.26.63c3.59-2.09,7.64-10.03,15.76-12.37-4.02-7.44-1.18-15.89-2.2-19.92-1.02-4.03-6.93-6.17-6.93-6.17" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_14" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M274.09,303.8s4.2,4.68,8.31,4.12c4.12-.56,10.9-6.35,19.3-5.4-.86-8.41,4.99-15.13,5.58-19.24.6-4.11-4.04-8.35-4.04-8.35" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
      <g id="_x3C_Radial_Repeat_x3E_15" data-name="_x3C_Radial_Repeat_x3E_">
        <path d="M236.07,319.34s2.09,5.93,6.1,6.99c4.02,1.06,12.5-1.69,19.89,2.39,2.42-8.1,10.4-12.07,12.52-15.64,2.13-3.57-.54-9.26-.54-9.26" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      </g>
    </g>
  </g>
  <g>
    <polygon points="351.14 351.14 351.16 248.48 383.44 248.48 383.44 280.66 395.86 280.66 395.86 151.43 383.44 151.43 383.44 183.61 351.16 183.61 351.1 80.9 248.39 80.84 248.39 48.56 280.57 48.56 280.57 36.14 151.34 36.14 151.34 48.56 183.52 48.56 183.52 80.84 80.86 80.86 80.84 183.52 48.56 183.52 48.56 151.34 36.14 151.34 36.14 280.57 48.56 280.57 48.56 248.39 80.84 248.39 80.9 351.1 183.61 351.16 183.61 383.44 151.43 383.44 151.43 395.86 280.66 395.86 280.66 383.44 248.48 383.44 248.48 351.16 351.14 351.14" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polygon points="355.99 76.01 356.04 178.07 378.54 178.07 378.54 145.03 402.35 145.03 402.35 287.06 378.54 287.06 378.54 254.03 356.04 254.03 356.03 356.04 254.02 356.05 254.02 378.55 287.05 378.55 287.05 402.36 145.02 402.36 145.02 378.55 178.06 378.55 178.06 356.05 76.01 355.99 75.96 253.93 53.46 253.93 53.46 286.97 29.65 286.97 29.65 144.94 53.46 144.94 53.46 177.97 75.96 177.97 75.97 75.96 177.98 75.95 177.98 53.45 144.95 53.45 144.95 29.64 286.98 29.64 286.98 53.45 253.94 53.45 253.94 75.95 355.99 76.01" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    <polygon points="360.95 360.69 361.29 260.82 372.37 260.82 372.37 293.44 409.16 293.44 409.16 215.97 409.16 138.51 372.37 138.51 372.37 171.12 361.29 171.12 361.04 71.29 260.95 71.3 260.95 60.22 293.56 60.22 293.56 23.43 216.1 23.43 138.63 23.43 138.63 60.22 171.24 60.22 171.24 71.3 71.05 71.31 70.71 171.18 59.63 171.18 59.63 138.56 22.84 138.56 22.84 216.03 22.84 293.49 59.63 293.49 59.63 260.88 70.71 260.88 70.96 360.71 171.05 360.7 171.05 371.78 138.44 371.78 138.44 408.57 215.9 408.57 293.37 408.57 293.37 371.78 260.76 371.78 260.76 360.7 360.95 360.69" fill="none" stroke="#4FD4C6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
  </g>
  <circle cx="216" cy="216" r="1.29" fill="#4FD4C6"/>
  </svg>
                                </svg>
                                {showCoherenceMessage && (
                                    <div className="message-overlay">
                                        <div className="coherence-message visible">
                                            {coherenceMessage}
                                        </div>
                                        {showButtons && (
                                            <div className="meditation-buttons visible">
                                                <button 
                                                    className="analysis-button"
                                                    onClick={handleAnalysis}
                                                >
                                                    View Analysis
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <MeditationAnalysis 
                isVisible={showAnalysis} 
                onClose={handleCloseAnalysis}
                duration={meditationStartTime ? (Date.now() - meditationStartTime) / 60000 : 0}
            />
        </>  
    );  
}  

export default SriYantra;
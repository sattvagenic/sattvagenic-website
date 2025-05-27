// ================ IMPORTS ================
import React, { useEffect, useState } from 'react';

// Color constants
const BODY_COLOR = {
  stroke: '#4FD4C6',
  glow: 'rgba(79, 212, 198, 0.6)'
};

const CHAKRA_COLORS = {
  muladhar: { color: '#FF3366', glow: '#CC295A' },
  swadhistan: { color: '#FF6B33', glow: '#CC5629' },
  manipur: { color: '#FFDB4D', glow: '#CCB040' },
  anahat: { color: '#33FF88', glow: '#29CC6E' },
  vishuddh: { color: '#33DDFF', glow: '#29B4D4' },
  ajana: { color: '#9933FF', glow: '#7B2BCC' },
  sahastra: { color: '#FFFFFF', glow: '#4FD4C6' }
};

const SubtleBody = ({ currentChakra, isBreathingIn, isInitializing, meditationStarted, onScanComplete }) => {
    const [scanProgress, setScanProgress] = useState(0);
    const [showInterference, setShowInterference] = useState(false);
    const [hasScanned, setHasScanned] = useState(false); 

  // Scan effect
  useEffect(() => {
    if (isInitializing && !hasScanned) {
        console.log('Starting scan animation');
        const startTime = Date.now();
        const duration = 4000;

        const animateScan = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setScanProgress(progress);

            if (progress < 1) {
                requestAnimationFrame(animateScan);
            } else {
                setHasScanned(true);
                onScanComplete();
            }
        };

        requestAnimationFrame(animateScan);
    }
}, [isInitializing, onScanComplete, hasScanned]);

useEffect(() => {
    if (meditationStarted) {
        const triggerRandomSurge = () => {
            setShowInterference(true);
            setTimeout(() => {
                setShowInterference(false);
                // Random interval between 25000ms (25s) and 35000ms (35s)
                setTimeout(triggerRandomSurge, Math.random() * 10000 + 25000);
            }, 400); // Keep the shudder duration at 0.4s
        };

        // Initial delay also between 25-35 seconds
        const initialDelay = Math.random() * 10000 + 25000;
        const timer = setTimeout(triggerRandomSurge, initialDelay);

        return () => clearTimeout(timer);
    }
}, [meditationStarted]);

  // Style helpers
  const getChakraStyles = (chakraId) => ({
    stroke: currentChakra === chakraId ? CHAKRA_COLORS[chakraId].color : BODY_COLOR.stroke,
    transform: currentChakra === chakraId && meditationStarted ? `scale(${isBreathingIn ? 2 : 1})` : 'scale(1)',
    transformBox: 'fill-box',
    transformOrigin: 'center',
    animation: currentChakra === chakraId && meditationStarted ? 'chakraPulse 30s ease-in-out infinite' : 'none',
    transition: 'all 3s ease',
    filter: currentChakra === chakraId && meditationStarted ? 
      `drop-shadow(0 0 5px ${CHAKRA_COLORS[chakraId].glow}) drop-shadow(0 0 10px ${CHAKRA_COLORS[chakraId].glow})` : 
      'none',
    opacity: currentChakra === chakraId && meditationStarted ? 1 : 0.6
  });

  const commonPathProps = {
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "0.5"
  };

  return (
    <svg
      id="Layer_1" 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="35 20 280 480"
      style={{ maxHeight: '80vh' }}
    >
      <defs>
      <filter id="interference">
    <feTurbulence 
        type="turbulence"
        baseFrequency="0.3"
        numOctaves="5"
        seed="1"
        stitchTiles="stitch"
        result="noise"
    />
    <feDisplacementMap 
        in="SourceGraphic" 
        in2="noise" 
        scale="30"
        xChannelSelector="R" 
        yChannelSelector="G"
    />
    <feColorMatrix
        type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 5 -1"
    />
</filter>
        <clipPath id="scanMask">
          <rect 
            x="35"
            y="20"
            width="280"
            height={scanProgress * 460}
            style={{ fill: '#4FD4C6' }}  // Add this to see the mask
          />
        </clipPath>
        <filter id="glowLine">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite operator="over" in="blur" />
        </filter>
      </defs>


      <g clipPath="url(#scanMask)">
    <g style={{ 
        filter: showInterference ? 'url(#interference)' : 'none',
        transition: 'filter 0.3s ease'
    }}></g>
      <g id="body" 
  className={`body-glow ${showInterference ? 'energy-surge' : ''}`}
  style={{ 
    stroke: BODY_COLOR.stroke, 
    opacity: 0.8
  }}>
      {/* Main body group with just the figure paths */}
  <path d="M140.1,176.89s-.8,10.66,3.2,17.19c3.46,5.64-1.16,13.56,2.34,20.27,1.51,2.9,5.96,4.26,5.37-5.05-.2-3.14,1.29-4.2,1.51-5.98.01-.08.12-.1.15-.02.78,2.68,5.71,16.64,23.56,16.64" {...commonPathProps} />
  <path d="M162.19,374.76c-6.49-1.1-12.11-2.79-10.32-4.82,3.15-3.57,14.9-6.17,14.26-7.34-1.58-2.9-16.81-1.81-24.16,6.49" {...commonPathProps} />
  <path d="M152.48,203.87s5.7,18.11.52,20.66-41.89,2-49.97,12.92c-9.36,12.66-17.03,61.51-14.47,89.92,0,0,23.41,46.66,65.46,56.31.1.02.19.03.29.04,1.25.04,10.38,2.24,19.05.58" {...commonPathProps} />
  <path d="M101,321.3s7.82-7.22,23.77,19.05c12.66,20.86,21.4,25.19,21.4,25.19" {...commonPathProps} />
  <path d="M109.49,322.29l14.1-53.34s4.59,24.13,15.09,42.46c7.5,13.09-.33,23.61,0,31.56.41,9.93.32,9.94.32,9.94l-4.41,1.61" {...commonPathProps} />
  <path d="M182.79,384.59c-1.68.61-2.58,2.24-3.05,3.73-.54,1.7-2.19,2.8-3.98,2.71-9.97-.52-38.88-1.8-51.46.03-15,2.19-21.13,3.92-26.02,5.49-.2.06-.38.14-.57.24-1.64.84-10.85,5.14-17.04-1.32" {...commonPathProps} />
  <path d="M115.71,362.44s-52.38,17.61-61.63,38.68,22.99,31.92,36.39,25.54c13.41-6.38,80.13-11.17,111.74-22.99,0,0,18.52,1.28,23.31-1.6,0,0,9.9,1.6,13.73,0s5.43-2.87,7.66-1.92c0,0,3.45-9.42-6.77-7.4-.05,0-.08-.05-.04-.07.62-.38,2.37-1.63,2.55-3.81,0,0-1.92-4.47-6.07-3.3,0,0-2.02-4.26-6.7-2.55,0,0-2.55-2.34-5.64-.32,0,0-3.19-1.7-3.94,4.47,0,0-19.34-.68-22.32-3.44" {...commonPathProps} />
  <path d="M118.49,257.38c4.73,4.31,6.58,10.83,8.97,16.77,2.39,5.94,5.12,16.11,11.32,17.68" {...commonPathProps} />
  <path d="M212.21,176.89s-8.68-3.72-10.49,3.84c0,0,2.55-25.91-19.69-20.19,0,0-3.12,1.12-5.87,1.14-2.75-.02-5.88-1.14-5.88-1.14-22.24-5.72-19.69,20.19-19.69,20.19-1.81-7.56-10.49-3.84-10.49-3.84-1.22-21.55,7.84-30.57,17.18-34.21,2.74-1.07,5.5-1.68,8.03-2,5.67-.72,10.22-.04,10.85.07.65-.11,5.18-.79,10.84-.07,2.53.32,5.29.93,8.03,2,9.35,3.64,18.4,12.67,17.18,34.21Z" {...commonPathProps} />
  <path d="M212.21,176.89s.8,10.66-3.2,17.19c-3.46,5.64,1.16,13.56-2.34,20.27-1.51,2.9-5.96,4.26-5.37-5.05.2-3.14-1.29-4.2-1.51-5.98-.01-.08-.12-.1-.15-.02-.78,2.68-5.71,16.64-23.56,16.64" {...commonPathProps} />
  <path d="M199.91,203.87s-5.92,18.11-.74,20.66,42.05,2,50.12,12.92c9.36,12.66,17.03,61.51,14.47,89.92,0,0-23.46,46.77-65.61,56.35,0,0-19.63,1.78-26.34.33-2.67-.58-8.05-6.51-9.63-9.29,3,.43,42.86.4,38.25-4.82-3.15-3.57-14.9-6.17-14.26-7.34,1.58-2.9,16.81-1.81,24.16,6.49" {...commonPathProps} />
  <path d="M251.31,321.3s-7.82-7.22-23.77,19.05c-12.66,20.86-21.4,25.19-21.4,25.19" {...commonPathProps} />
  <path d="M242.83,322.29l-14.1-53.34s-4.59,24.13-15.09,42.46c-7.5,13.09.33,23.61,0,31.56-.41,9.93-.32,9.94-.32,9.94l4.41,1.61" {...commonPathProps} />
  <path d="M233.83,257.38c-4.73,4.31-6.58,10.83-8.97,16.77-2.39,5.94-5.12,16.11-11.32,17.68" {...commonPathProps} />
  <path d="M182.79,384.59c-2.55,7.66,5.97,8.14,12.07,8.61,5.53.42,11.33.75,19.9.5,16.97-.5,14.68,5.4,21.32,3.05,3.88-1.38,9-.94,10.81,3.42" {...commonPathProps} />
  <path d="M240.98,396.15c-1.05,1.46-1.19,3.53-.35,5.12" {...commonPathProps} />
  <path d="M220.01,387.16c5.5.98,11.13,4.15,14.6,8.53,1.48-1,4.41-2.18,5.89-3.18" {...commonPathProps} />
  <path d="M236.58,385.58c-2.26,1.3-4.22,5.01-4.26,7.62" {...commonPathProps} />
  <path d="M229.78,382.96c-1.21,2.31-1.55,5.06-.94,7.6" {...commonPathProps} />
  <path d="M224.09,382.83c-.49,1.19-.49,2.57-.01,3.76s1.4,2.28,2.58,2.8" {...commonPathProps} />
  <path d="M240.1,392.69c-2.39.51-4.15-1.06-4.27-2.44s.92-2.75,2.27-3.03c.74-.15,1.53,0,2.2.34.99.51,1.76,1.44,2.07,2.51" {...commonPathProps} />
  <path d="M98.77,396.39c-.3-2.05-.6-4.86.53-6.6.78-1.19,2.11-1.94,3.49-2.29,3.32-.86,7.1.46,9.16,3.2,1.51-2.6,3.94-4.6,6.8-5.51s6.06-.73,8.79.51" {...commonPathProps} />
  <path d="M106.63,387.42c-.85-.33-3.18-3.35-1.62-5.7.85-1.28,2.5-1.88,4.03-1.69,1.62.2,3.12,1.17,3.99,2.55s.93,4.55.41,6.09" {...commonPathProps} />
  <path d="M110.68,380.51c.22-1.34,1.53-3.13,2.82-3.53s2.8-.03,3.74.94c.86.88,1.23,2.15,1.21,3.38s-.42,3.2-.88,4.34" {...commonPathProps} />
  <path d="M117.48,378.18c.49-.48,2.1-1.18,2.78-1.1s1.31.47,1.68,1.05c.42.66.47,1.48.41,2.26-.12,1.44-.86,3.25-1.66,4.46" {...commonPathProps} />
  <path d="M122.22,378.76c.59-.13,2.08-.31,2.68-.3s1.22.2,1.66.62c.48.45.97,1.68.45,2.87" {...commonPathProps} />
  <path d="M104.62,384.09c.49-.68,1.22-1.2,2.04-1.37s1.73.04,2.34.61c.65.6.91,1.53.89,2.42s-.28,1.74-.54,2.59" {...commonPathProps} />
  <path d="M142.33,379.86c-4.36,1.88-9.2,2.62-13.92,2.13-2.82-.29-5.71.45-7.49,2.59" {...commonPathProps} />
  <path d="M147.8,180.01c-9.31-.99-2.95,12.13-2.63,16.73.25,1.56,1.11,3.72,3.15,3.56.91-.11,1.66-1.08,1.27-1.85" {...commonPathProps} />
  <path d="M149.6,183.89c-1.05-1.42-3.45-.41-3.16,1.34.16,1.09,1.26,1.78,1.78,2.75,1.05,2.07-.43,4.28-.86,6.31-.77,2.07,1.31,5.16,3.4,3.43" {...commonPathProps} />
  <path d="M204.52,180.01c9.31-.99,2.95,12.13,2.63,16.73-.25,1.56-1.11,3.72-3.15,3.56-.91-.11-1.66-1.08-1.27-1.85" {...commonPathProps} />
  <path d="M202.72,183.89c1.05-1.42,3.45-.41,3.16,1.34-.16,1.09-1.26,1.78-1.78,2.75-1.05,2.07.43,4.28.86,6.31.77,2.07-1.31,5.16-3.4,3.43" {...commonPathProps} />
  <path d="M171.63,182.45c-5.19-4.07-12.82-4.96-18.86-2.18" {...commonPathProps} />
  <path d="M152.91,184.47c6.5-1.29,13.34-.78,18.58,1.82-2.9.58-5.4.66-8.42.36s-5.24-.97-6.97-2.64" {...commonPathProps} />
  <path d="M159.21,183.79c-1.28,2.41,7.67,3.44,7.91.89" {...commonPathProps} />
  <path d="M161.46,183.93c-.21.37-.03.8.45,1.07s1.22.35,1.84.21s1.06-.5,1.1-.89" {...commonPathProps} />
  <path d="M180.69,182.45c5.19-4.07,12.82-4.96,18.86-2.18" {...commonPathProps} />
  <path d="M199.41,184.47c-6.5-1.29-13.34-.78-18.58,1.82,2.9.58,5.4.66,8.42.36s5.24-.97,6.97-2.64" {...commonPathProps} />
  <path d="M193.1,183.79c1.28,2.41-7.67,3.44-7.91.89" {...commonPathProps} />
  <path d="M190.86,183.93c.21.37.03.8-.45,1.07s-1.22.35-1.84.21s-1.06-.5-1.1-.89" {...commonPathProps} />
  <path d="M181.12,198.73c1.35,2.49-2.72,2.18-4.49,3.06-.29.15-.64.15-.93,0-1.78-.88-5.84-.57-4.49-3.06" {...commonPathProps} />
  <path d="M175.62,210.28c.33-.05.67-.05,1,0,1.49.23,3.09-.53,4.4-1.44,1.49-1.03,3.69-2.43,5.47-2.42.06,0,.06-.1,0-.12-2.24-.66-5.25-.16-7.44.35l-2.44.56c-.33.08-.67.08-1.01,0l-2.44-.56c-2.07-.48-5.09-.95-7.33-.44-.11.02-.1.22.01.23,1.76.17,3.97,1.44,5.35,2.4,1.31.91,2.92,1.67,4.4,1.44Z" {...commonPathProps} />
  <path d="M173.57,208.28c2.28.72,2.68.83,4.95.06" {...commonPathProps} />
  <path d="M251.31,321.3s-7.82-7.22-23.77,19.05c-12.66,20.86-21.4,25.19-21.4,25.19" {...commonPathProps} />
<path d="M242.83,322.29l-14.1-53.34s-4.59,24.13-15.09,42.46c-7.5,13.09.33,23.61,0,31.56-.41,9.93-.32,9.94-.32,9.94l4.41,1.61" {...commonPathProps} />
<path d="M236.61,362.44s52.38,17.61,61.63,38.68c9.26,21.07-22.99,31.92-36.39,25.54-10.57-5.03-54.98-7.88-88.5-15.15" {...commonPathProps} />
<path d="M247.46,397.66s3.48-1.51,7.05,1.54c2.78,2.38,5.96,5.69,11.12,2.07" {...commonPathProps} />
<path d="M233.83,257.38c-4.73,4.31-6.58,10.83-8.97,16.77-2.39,5.94-5.12,16.11-11.32,17.68" {...commonPathProps} />
</g>

      {/* Chakras */}
      <g id="chakras">
      <g id="muladhar" style={getChakraStyles('muladhar')}>
  <rect x="164.94" y="369" width="22.44" height="22.44" {...commonPathProps} />
  <rect x="166.71" y="370.77" width="18.89" height="18.89" {...commonPathProps} />
</g>

<g id="swadhistan" style={getChakraStyles('swadhistan')}>
  <circle cx="176.16" cy="346.32" r="11.22" {...commonPathProps} />
  <path d="M187.37,346.32c0,6.19-5.02,11.21-11.22,11.21s-11.21-5.02-11.21-11.21c0-1.18.18-2.31.52-3.38,1.43,4.54,5.68,7.83,10.69,7.83s9.27-3.3,10.7-7.83c.34,1.07.52,2.2.52,3.38Z" {...commonPathProps} />
</g>

<g id="manipur" style={getChakraStyles('manipur')}>
  <polygon points="176.16 298.4 187.37 317.83 164.94 317.83 176.16 298.4" {...commonPathProps} />
  <polygon points="176.16 301.96 184.34 316.12 167.98 316.12 176.16 301.96" {...commonPathProps} />
</g>

<g id="anahat" style={getChakraStyles('anahat')}>
  <polygon points="176.16 254.49 187.37 273.92 164.94 273.92 176.16 254.49" {...commonPathProps} />
  <polygon points="176.16 280.52 187.37 261.09 164.94 261.09 176.16 280.52" {...commonPathProps} />
</g>

<g id="vishuddh" style={getChakraStyles('vishuddh')}>
  <circle cx="176.16" cy="232.71" r="9.25" {...commonPathProps} />
  <circle cx="176.16" cy="232.71" r="11.22" {...commonPathProps} />
</g>

<g id="ajana" style={getChakraStyles('ajana')}>
  <polygon points="176.16 184.85 187.37 165.42 164.94 165.42 176.16 184.85" {...commonPathProps} />
  <polygon points="176.16 181.29 184.34 167.12 167.98 167.12 176.16 181.29" {...commonPathProps} />
</g>

<g id="sahastra" style={getChakraStyles('sahastra')}>
  <g>
    <g>
      <path d="M173.46,138.06c-2.68.15-7.17-.36-9.92-4.77-2.47-3.96-2.98-10.16-2.99-14.5,0-2.91.21-4.97.21-4.97,0,0,5.12-1.55,9.67,2.01" {...commonPathProps} />
      <path d="M181.93,115.88c4.55-3.51,9.63-1.97,9.63-1.97,0,0,.21,2.02.21,4.88,0,4.34-.5,10.61-2.99,14.59-2.78,4.47-7.35,4.94-10.02,4.77" {...commonPathProps} />
    </g>
    <g>
      <path d="M167.01,140.08s-1.29.24-1.7.6c-2.53.32-5.29.93-8.03,2-2.56-1.31-4.15-4.33-4.15-4.33,0,0,2.11-2.24,4.73-2.97.21.27.45.52.7.77,1.98,1.98,4.62,3.07,7.22,3.64.11.19,1.23.3,1.23.3Z" {...commonPathProps} />
      <path d="M165.31,140.68c-2.53.32-5.29.93-8.03,2" {...commonPathProps} />
      <path d="M199.18,138.35s-1.59,3.02-4.15,4.33c-2.74-1.07-5.5-1.68-8.03-2-.4-.36-1.7-.6-1.7-.6,0,0,1.12-.11,1.23-.3,2.6-.57,5.24-1.65,7.22-3.64.25-.25.48-.5.7-.77,2.62.73,4.73,2.97,4.73,2.97Z" {...commonPathProps} />
      <path d="M195.03,142.68c-2.74-1.07-5.5-1.68-8.03-2" {...commonPathProps} />
    </g>
    <g>
      <path d="M175.67,139.98c0,.05-.01.31-.01.31,0,0-4.88.58-9.88-.51-2.6-.57-5.24-1.65-7.22-3.64-.25-.25-.48-.5-.7-.77-4.95-5.98-3.22-16.34-3.22-16.34,0,0,2.58-.43,5.91-.25.01,4.34.52,10.54,2.99,14.5,2.75,4.42,7.24,4.92,9.92,4.77.93.89,1.73,1.54,2.21,1.92Z" {...commonPathProps} />
      <path d="M194.45,135.37c-.21.27-.45.52-.7.77-1.98,1.98-4.62,3.07-7.22,3.64-5,1.09-9.88.51-9.88.51,0,0,0-.26-.01-.31h0c.46-.37,1.23-1,2.11-1.84,2.67.17,7.24-.3,10.02-4.77,2.49-3.99,2.98-10.26,2.99-14.59,3.33-.18,5.91.25,5.91.25,0,0,1.73,10.36-3.22,16.34Z" {...commonPathProps} />
    </g>
    <path d="M176.15,140.35c12.51-9.56,12.16-21.07,0-29.73-12.16,8.66-12.51,20.17,0,29.73Z" {...commonPathProps} />
  </g>
  <rect x="172.36" y="122.07" width="7.6" height="7.6" transform="translate(-37.41 161.43) rotate(-45)" {...commonPathProps} />
</g>
</g>
      </g>
    </svg>
  );
};

export default SubtleBody;
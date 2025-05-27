import React, { useState, useEffect } from 'react';
import SubtleBody from './SubtleBody';
import SkipButton from './SkipButton';  
import InitText from './InitText';

const Pranayama = ({ onComplete }) => {
  const [currentChakra, setCurrentChakra] = useState('muladhar');
  const [isAscending, setIsAscending] = useState(true);
  const [isBreathingIn, setIsBreathingIn] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); 
  const [scanComplete, setScanComplete] = useState(false); 
  const [meditationStarted, setMeditationStarted] = useState(false); 
  const [initAudio] = useState(new Audio('/audio/init-sequence.mp3'));
  const [meditationAudio] = useState(new Audio('/audio/chakra-meditation.mp3'));

  useEffect(() => {
    if (isInitializing) {
      initAudio.play()
        .catch(error => console.log('Init audio play failed:', error));
    }
    return () => {
      initAudio.pause();
      initAudio.currentTime = 0;
    };
  }, [isInitializing]);

  const handleInitTextComplete = () => {
    setTimeout(() => {
      setIsInitializing(false);
      initAudio.pause();
      meditationAudio.play()
        .then(() => {
          setMeditationStarted(true);
        })
        .catch(error => console.log('Meditation audio play failed:', error));
    }, 500);
  };

  const chakraOrder = [
    'muladhar', 
    'swadhistan', 
    'manipur', 
    'anahat', 
    'vishuddh', 
    'ajana', 
    'sahastra'
  ];

  // Chakra transitions (unchanged)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentIndex = chakraOrder.indexOf(currentChakra);

      if (isAscending) {
        if (currentIndex === chakraOrder.length - 1) {
          setIsAscending(false);
          setCurrentChakra(chakraOrder[chakraOrder.length - 2]);
        } else {
          setCurrentChakra(chakraOrder[currentIndex + 1]);
        }
      } else {
        if (currentIndex === 0) {
          setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
              onComplete();
            }, 800);
          }, 15000);
        } else {
          setCurrentChakra(chakraOrder[currentIndex - 1]);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentChakra, isAscending, onComplete, chakraOrder]);

  return (
    <div className={`pranayama-container ${isFading ? 'fading-out' : ''}`}>
      <div className="meditation-content">
        {isInitializing && (
          <InitText 
            onComplete={handleInitTextComplete} 
            scanComplete={scanComplete} 
          />
        )}
        <SubtleBody 
          currentChakra={currentChakra}
          isBreathingIn={isBreathingIn}
          isInitializing={isInitializing}
          meditationStarted={meditationStarted}  // Add this prop
          onScanComplete={() => {
            console.log('Scan animation complete, revealing body now...');
            setScanComplete(true);
          }}
        />
      </div>
      <div style={{ 
        position: 'fixed', 
        bottom: '-170px',
        right: '92px',
        zIndex: 9999,
        transform: 'scale(0.2)',
        opacity: '0.4',
        transition: 'opacity 0.3s ease',
      }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.2'}
      >
        <SkipButton 
  onClick={() => {
    setIsFading(true);
    setTimeout(() => {
      meditationAudio.pause();
      onComplete();
    }, 800);
  }}
  className="skip-button"
/>
      </div>
    </div>
  );
};

export default Pranayama;

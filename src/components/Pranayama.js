import React, { useState, useEffect } from 'react';
import SubtleBody from './SubtleBody';
import InitText from './InitText';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // Simple useEffect - play audio immediately when initializing
  useEffect(() => {
    if (isInitializing) {
      initAudio.play()
        .catch(error => console.log('Init audio play failed:', error));
    }
    return () => {
      initAudio.pause();
      initAudio.currentTime = 0;
    };
  }, [isInitializing, initAudio]);

  const handleInitTextComplete = () => {
    setTimeout(() => {
      setIsInitializing(false);
      initAudio.pause();
      initAudio.currentTime = 0;  // Reset the audio
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

  // Chakra transitions
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
              meditationAudio.pause();
              meditationAudio.currentTime = 0;
              onComplete();
            }, 800);
          }, 15000);
        } else {
          setCurrentChakra(chakraOrder[currentIndex - 1]);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentChakra, isAscending, onComplete, chakraOrder, meditationAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      initAudio.pause();
      initAudio.currentTime = 0;
      meditationAudio.pause();
      meditationAudio.currentTime = 0;
    };
  }, [initAudio, meditationAudio]);

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
  meditationStarted={meditationStarted}
  onScanComplete={() => setScanComplete(true)}
  onSkip={() => {
    setIsFading(true);
    initAudio.pause();
    initAudio.currentTime = 0;
    meditationAudio.pause();
    meditationAudio.currentTime = 0;
    setTimeout(() => {
      onComplete(); // exactly the same as old skip button
    }, 800);
  }}
/>

      </div>
      
      {/* Skip button positioned at bottom of container */}
      <div style={{ 
        position: 'absolute',
        bottom: '10%',  // Percentage instead of fixed pixels
        left: '50%',
        transform: 'translateX(-50%) scale(0.2)',  // Center AND scale
        zIndex: 9999,
      }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.4'; }}
      >
      
      </div>
    </div>
  );
};

export default Pranayama;
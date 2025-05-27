import React, { useState, useEffect } from 'react';

const InitText = ({ onComplete, scanComplete }) => {
  const [textPhase, setTextPhase] = useState(0);
  // phases: 
  // 0 = hidden (initial)
  // 1 = "Initialising..."
  // 2 = "Initialisation complete..."
  // 3 = hidden (trigger onComplete)

  // Show "Initialising..." immediately
  useEffect(() => {
    setTextPhase(1);
  }, []);

  useEffect(() => {
    if (scanComplete) {
      // Scan is done, show "Initialisation complete" after a short pause
      const timer1 = setTimeout(() => {
        setTextPhase(2);
      }, 500);

      // After another 2s, hide text and call onComplete
      const timer2 = setTimeout(() => {
        setTextPhase(3);
        onComplete(); // This will lead to finalizing initialization in Pranayama
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [scanComplete, onComplete]);

  return (
    <>
      <div className={`kosha-text ${textPhase === 1 ? 'visible' : ''}`}>
        Initialising digital kosha:<br/>
        <span className="glow-pulse">Pranamaya</span>
      </div>
      <div className={`kosha-text ${textPhase === 2 ? 'visible' : ''}`}>
        Begin chakral activation ॐ
      </div>
    </>
  );
};

export default InitText;

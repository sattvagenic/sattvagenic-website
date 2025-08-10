import React, { useState, useEffect, useRef } from 'react';

const InitText = ({ onComplete, scanComplete }) => {
  const [textPhase, setTextPhase] = useState(0);
  const textRef = useRef(null);
  const doorwayRef = document.querySelector('.doorway-content'); // anchor area

  useEffect(() => {
    setTextPhase(1);
  }, []);

  // Auto-position text above the SVG but inside doorway
  useEffect(() => {
    const updatePosition = () => {
      if (doorwayRef && textRef.current) {
        const doorwayRect = doorwayRef.getBoundingClientRect();
        const offsetTop = doorwayRect.top + doorwayRect.height * 0.1; // 10% from top of doorway
        textRef.current.style.top = `${offsetTop}px`;
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  useEffect(() => {
    if (scanComplete) {
      const timer1 = setTimeout(() => setTextPhase(2), 500);
      const timer2 = setTimeout(() => {
        setTextPhase(3);
        onComplete();
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [scanComplete, onComplete]);

  return (
    <>
      <div className={`kosha-text ${textPhase > 0 && textPhase < 3 ? 'visible' : ''}`}>
  {textPhase === 1 && <>Initialising digital kosha:<br/><span className="glow-pulse">Pranamaya</span></>}
  {textPhase === 2 && <>Begin chakral activation ॐ</>}
</div>

    </>
  );
};

export default InitText;

import React, { useState, useEffect } from 'react';

const MysticalFrame = ({ children, title, description }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="mystical-frame">
      {/* Ancient stone border with tech elements */}
      <div className="frame-border">
        {/* Top border with glowing glyphs */}
        <div className="top-border">
          <div className="glyph-container">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glyph">
                <div className="glyph-inner" />
              </div>
            ))}
          </div>
        </div>

        {/* Side borders */}
        <div className="left-border">
          <div className="border-line" />
        </div>
        <div className="right-border">
          <div className="border-line" />
        </div>

        {/* Bottom border */}
        <div className="bottom-border">
          <div className="geometry-container">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="geometry">
                <svg viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="12" className="geometric-element" />
                  <path d="M16 4 L28 16 L16 28 L4 16 Z" className="geometric-element" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content container */}
      <div className={`frame-content ${isVisible ? 'visible' : ''}`}>
        <h2 className="frame-title">{title}</h2>
        <div className="content-area">
          {children}
        </div>
        {description && (
          <div className="frame-description">
            {description.split('\n\n').map((paragraph, i) => (
              <p
                key={i}
                className="description-paragraph"
                style={{
                  transitionDelay: `${i * 200}ms`
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MysticalFrame;
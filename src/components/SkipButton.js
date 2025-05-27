const SkipButton = ({ onClick }) => {
    return (
      <svg 
        className="glyph-button" 
        viewBox="0 0 100 100" 
        width="100" 
        height="100" 
        onClick={onClick}
        style={{ animation: 'none' }}  // Prevent spinning
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle cx="50" cy="50" r="45" className="glyph-base" />
        <circle cx="50" cy="50" r="42" className="glyph-geometry" /> {/* Added inner circle */}
        <path 
          d="M30 25 L30 75 L60 50 Z" 
          className="glyph-geometry"
          style={{ animation: 'none' }}  // Prevent spinning
        />
        <path 
          d="M50 25 L50 75 L80 50 Z" 
          className="glyph-geometry"
          style={{ animation: 'none' }}  // Prevent spinning
        />
      </svg>
    );
  };
  
  export default SkipButton;
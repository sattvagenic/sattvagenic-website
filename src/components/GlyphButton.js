// src/components/GlyphButton.js
const GlyphButton = ({ onClick }) => {
  return (
    <svg 
      className="glyph-button" 
      viewBox="0 0 100 100" 
      width="100" 
      height="100" 
      onClick={onClick}
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
      <circle cx="50" cy="50" r="40" className="glyph-geometry" />
      <path d="M50 5 L95 50 L50 95 L5 50 Z" className="glyph-geometry" />
      <path d="M50 15 L85 50 L50 85 L15 50 Z" className="glyph-geometry" />
      <path d="M25 50 C25 25, 75 25, 75 50" className="glyph-circuit" />
      <path d="M25 50 C25 75, 75 75, 75 50" className="glyph-circuit" />
      <circle cx="50" cy="50" r="20" className="glyph-geometry" />
      <circle cx="50" cy="50" r="15" className="glyph-geometry" />
      <circle cx="50" cy="50" r="5" className="glyph-center" />
      <circle cx="50" cy="50" r="3" className="glyph-core" />
    </svg>
  );
};

export default GlyphButton;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './MobileLingamMenu.css';

const MobileLingamMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="mobile-lingam-container">
      {/* Lingam Button */}
      <div 
        className={`lingam-button ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
      >
        <div className="lingam-line"></div>
        <div className="lingam-line"></div>
        <div className="lingam-line"></div>
        <div className="saffron-dot"></div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="menu-overlay" onClick={closeMenu}></div>
          <div className="lingam-dropdown">
            <div className="menu-section">
              <h3>Gallery</h3>
              <Link to="/" onClick={closeMenu}>Home</Link>
            </div>
            
            <div className="menu-section">
              <h3>Meditations</h3>
              <Link to="/meditation" onClick={closeMenu}>Chakra/Yantra Meditation</Link>
              <Link to="/metta-morph" onClick={closeMenu}>Metta-Morph</Link>
            </div>
            
            <div className="menu-section">
              <h3>Mantric Art</h3>
              <Link to="/mantra" onClick={closeMenu}>Mritunjay</Link>
              <Link to="/torus-mantra" onClick={closeMenu}>Om Namah Shivaya</Link>
            </div>
            
            <div className="menu-section">
              <h3>Writing</h3>
              <a href="#writings" onClick={closeMenu}>Essays & Texts</a>
            </div>
            
            <div className="menu-section">
              <h3>About</h3>
              <a href="#about" onClick={closeMenu}>About Sattvagenic</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileLingamMenu;
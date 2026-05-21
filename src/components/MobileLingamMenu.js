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
              <h3>Music</h3>
              <Link to="/music" onClick={closeMenu}>Releases</Link>
            </div>

            <div className="menu-section">
              <h3>Practices</h3>
              <Link to="/metta-morph" onClick={closeMenu}>Metta-Morph</Link>
              <a href="/Tratak/" target="_blank" rel="noopener noreferrer" onClick={closeMenu}>Tratak</a>
            </div>

           <div className="menu-section">
  <h3>About</h3>
  <Link to="/about" onClick={closeMenu}>About Sattvagenic</Link>
</div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileLingamMenu;
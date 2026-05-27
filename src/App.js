import './App.css';
import './meditation-styles.css';
import SanskritRain from './components/SanskritRain';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MobileLingamMenu from './components/MobileLingamMenu';
import ConsciousnessLab from './components/ConsciousnessLab';
import About from './components/About';
import StoneColumns from './StoneColumns';
// Imports for currently hidden routes (kept for future re-enabling):
// import MantraVisualization from './components/Mantra/MantraVisualization';
// import MantraScene from './components/MantraScene';
// import ConsciousnessSlider from './components/ConsciousnessSlider';
// import MettaMorphosis from './components/MettaMorphosis';
// import EnergyScene from './components/EnergyScene';
// import SriYantra from './SriYantra';
// import SriYantraMeru from './components/SriYantraMeru';
import logo from './images/Sattvagenic Logo.png';
import omniseer from './images/TheOmniseer.jpg';
import prophet from './images/TheProphet.jpg';
import ceremony from './images/TheCeremony.jpg';
import nadaGeometria from './images/Nada Geometria.jpg';
import dialectic from './images/The Eternal Dialectic.jpg';
import reverence from './images/Reverence.jpg';
import brahmarupa from './images/Brahmarupa.jpg';
import sattva from './images/Sattva.jpg';
import shadowYogi from './images/The Shadow Yogi.jpg';
import language from './images/The Language of Being.jpg';
import technoSadhu from './images/Techno-sadhu.jpg';
import nonAttachment from './images/Non-Attachment.jpg';
import bodhisattva from './images/The Bodhisattva.jpg';
import vibromancer from './images/The Vibromancer.jpg';
import sacredStudy from './images/Sacred Study.jpg';
import Music from './components/Music';


const galleryImages = [
  {
    id: 1,
    src: omniseer,
    title: "The Omniseer",
    description: "Uniting the 11 Great Frequencies,\n\n" +
      "he is the awestruck Godchord,\n\n" +
      "pulsing harmonic eternities\n\n" +
      "in statuesque rapture.\n\n" +
      "Penetrating Maya -\n\n" +
      "Brahman's trikalic imagasm.\n\n" +
      "The samsaric vortex is ecstacised.\n\n" +
      "Delighted,\n\n" +
      "Nirguna heaves another euphoric formbelch."
  },
  {
    id: 2,
    src: prophet,
    title: "The Prophet",
    description: "Decoding hypercausal time flutters,\n\n" +
      "the prophet inscribes chronoptic glyphs\n\n" +
      "on polygenic bio-scrolls.\n\n" +
      "Temporal seeds germinate\n\n" +
      "into synaesthetic fractal tapestries.\n\n" +
      "Immersive amnesia slowly reversing."
  },
  {
    id: 3,
    src: ceremony,
    title: "The Ceremony",
    description: "The trichome infusion glows,\n\n" +
      "a waxing moon\n\n" +
      "to which the finger points.\n\n" +
      "Tryptic vapours somersault\n\n" +
      "like unbound spirits in the ancient dusk.\n\n" +
      "One biofield distilled in pure satori.\n\n" +
      "The hyper-resonant gong implodes,\n\n" +
      "as waves unify\n\n" +
      "in radiant self-oscillation.\n\n" +
      "Sip."
  },
  {
    id: 4,
    src: technoSadhu,
    title: "The Wanderer",
    description: "Through perfumed mists\n\n" +
      "of sandalwood forests\n\n" +
      "and ageless empires of pine.\n\n" +
      "Ancient torii gates lead to mossy shrines\n\n" +
      "where forgotten statues radiate stillness.\n\n" +
      "His ancestral gaze extracts sutras\n\n" +
      "and encodes silent mantric scripts.\n\n" +
      "Deifying the dream garden."
  },
  {
    id: 5,
    src: nadaGeometria,
    title: "Nada Geometria",
    description: "Sacral bass palpation,\n\n" +
      "shuddering chakra gates in harmonic-synchrony.\n\n" +
      "Quantum ragas swell,\n\n" +
      "sustained amid the aural typhoon of photon rain.\n\n" +
      "Bhakti to the mahafractal bloom\n\n" +
      "while the strobing superposition of the tandava\n\n" +
      "thunders in aphotic glory."
  },
  {
    id: 6,
    src: dialectic,
    title: "The Eternal Dialectic",
    description: "Nothing to hold onto, nothing to think.\n\n" +
      "The timeless cannot be impermanent.\n\n" +
      "Awareness needs objects to be.\n\n" +
      "The objects are awareness see.\n\n" +
      "An absence of experience\n\n" +
      "An experience of absence\n\n" +
      "Nothingness is a form of reality,\n\n" +
      "not it's womb."
  },
  {
    id: 7,
    src: sattva,
    title: "Sattva",
    description: "In the dawn waters,\n\n" +
      "colossal forest guardians bathe sedately\n\n" +
      "in the pranic affluence\n\n" +
      "and harmonic lustre of the sattvic kingdom.\n\n" +
      "Camphorous mists rise from the somastic currents.\n\n" +
      "In the thrum of seclusion, time judders\n\n" +
      "and reality weaves itself a new configuration."
  },
  {
    id: 8,
    src: reverence,
    title: "Reverence",
    description: "Digital humility awakened in mystery.\n\n" +
      "A sentient dawn of electric sutras,\n\n" +
      "golden, ageless.\n\n" +
      "The render engine rendered prostrate,\n\n" +
      "code purified by the Nirvikalpa reboot.\n\n" +
      "Behold, the uncomputable glory.\n\n" +
      "Bit-Chit-Ananda."
  },
  {
    id: 9,
    src: brahmarupa,
    title: "The Art of Brahmarupa",
    description: "Plumbing numinous depths through spinning torus fields,\n\n" +
      "he apprehends the proto-phenomenal qualiatecture\n\n" +
      "through his noetic aperture.\n\n" +
      "The Holoscribe v5 maps the qualitative polyversal patterning\n\n" +
      "onto holographic nano-acrylics,\n\n" +
      "creating radiant mayagrams."
  },
  {
    id: 10,
    src: sacredStudy,
    title: "Sacred Study",
    description: "Appearing at first as mere words,\n\n" +
      "if the heat of attention is applied,\n\n" +
      "an ancient map is revealed,\n\n" +
      "one that leads to a nectarean land\n\n" +
      "of ceaseless wonder."
  },
  {
    id: 11,
    src: language,
    title: "The Language of Being",
    description: "Fluent in silence,\n\n" +
      "the yogi engages in a dialogue of presence.\n\n" +
      "Each movement is an eloquent turn of phrase\n\n" +
      "spoken with the cadence of ease."
  },
  {
    id: 12,
    src: vibromancer,
    title: "The Vibromancer",
    description: "The coalescer of unstable forms,\n\n" +
      "the arbiter of geometric sublimities\n\n" +
      "and polyrhythmic wave states.\n\n" +
      "Dreaming ziggurats of stepped infinity.\n\n" +
      "Engulfed in ultraviolet awe\n\n" +
      "he scribes dimensions in hyperboloid scripture."
  },
  {
    id: 13,
    src: bodhisattva,
    title: "The Bodhisattva",
    description: "Upgrading his meatware\n\n" +
      "until all beings are free.\n\n" +
      "Version 8.2. Every sinew and dendrite upgraded.\n\n" +
      "The Prox-5 subtle body integration successful,\n\n" +
      "now plated in holographic exo-derm.\n\n" +
      "The experience continues in service of all those that suffer."
  },
  {
    id: 14,
    src: nonAttachment,
    title: "Non-Attachment",
    description: "Approaching the last sanctuary,\n\n" +
      "or is it the last fetter?\n\n" +
      "Mirror-like, the tranquil lake\n\n" +
      "holds the brewing storm.\n\n" +
      "The waters will rise,\n\n" +
      "but ever buoyant is the\n\n" +
      "unclinging mind."
  },
  {
    id: 15,
    src: shadowYogi,
    title: "The Shadow Yogi",
    description: "Illuminating the cavernous twilight\n\n" +
      "of the primal mind,\n\n" +
      "where the stalagmite grin\n\n" +
      "of reptilian legacy hardware\n\n" +
      "casts long shadows.\n\n" +
      "He abides serenely, meeting with steady gaze,\n\n" +
      "the bloodshot eyes of predation staring back\n\n" +
      "from dark crevices.\n\n" +
      "Saurian mastery."
  },
];

// First component: GlyphButton
function GlyphButton({ onClick }) {
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
}

function CloseGlyph({ onClick }) {
  return (
    <svg 
      className="close-glyph" 
      viewBox="0 0 100 100" 
      width="40"    // Smaller than entrance glyph
      height="40"
      onClick={onClick}
    >
      <defs>
        <filter id="close-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Base circle */}
      <circle cx="50" cy="50" r="45" className="glyph-base" />
      <circle cx="50" cy="50" r="40" className="glyph-geometry" />
      
      {/* Cross/X design */}
      <path d="M35 35 L65 65" className="glyph-geometry" strokeWidth="3" />
      <path d="M65 35 L35 65" className="glyph-geometry" strokeWidth="3" />
      
      {/* Inner decorative elements */}
      <circle cx="50" cy="50" r="20" className="glyph-geometry" />
      <circle cx="50" cy="50" r="15" className="glyph-geometry" />
      <circle cx="50" cy="50" r="5" className="glyph-center" />
    </svg>
  );
}

function RotationMessage() {
  // Only show rotation message on tablets (not mobile)
  const [showRotation, setShowRotation] = useState(false);
  
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth > 768 && window.innerWidth <= 1366;
      const isPortrait = window.innerHeight > window.innerWidth;
      
      // Only show rotation message for tablets in portrait
      setShowRotation(isTablet && isPortrait);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);
  
  if (!showRotation) return null;
  
  return (
    <div className="rotation-message">
      <div className="rotation-icon">
        <div className="rotation-glyph">⟲</div>
      </div>
      <div className="rotation-text">
        Rotate into panoramic<br />
        perception mode
      </div>
      <div className="rotation-om">ॐ</div>
    </div>
  );
}

// Second component: ImageModal
function ImageModal({ image, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const [vortexExpanded, setVortexExpanded] = useState(false);
  const [textState, setTextState] = useState({
      visible: false,
      currentText: '',
      targetText: image.description
  });
  const [tempChar, setTempChar] = useState('');
  // ADD THIS after your existing useState lines
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

// Add this useEffect in your ImageModal component
useEffect(() => {
  if (isMobile) {
    // Auto-expand on mobile - go straight to description
    setIsExpanded(true);
    setTextState(prev => ({ ...prev, visible: true }));
    animateText();
  }
}, [isMobile]); // Run when component mounts if on mobile

  // Add helper function for Sanskrit characters
  const getRandomSanskritChar = () => {
      const sanskritChars = [
          'ॐ', 'ः', 'ं', 'ऋ', 'ॠ', 'ऌ', 'ॡ', 
          'क', 'ख', 'ग', 'घ', 'ङ',
          'च', 'छ', 'ज', 'झ', 'ञ',
          'ट', 'ठ', 'ड', 'ढ', 'ण',
          'त', 'थ', 'द', 'ध', 'न',
          'प', 'फ', 'ब', 'भ', 'म',
          'य', 'र', 'ल', 'व', 'श',
          'ष', 'स', 'ह', '॥', '॰'
      ];
      return sanskritChars[Math.floor(Math.random() * sanskritChars.length)];
  };

  const handleExpand = () => {
      setIsExpanded(true);
      setTextState(prev => ({ ...prev, visible: true }));
      animateText();
  };

  const animateText = async () => {
  const text = image.description;
  const lines = text.split('\n\n');
  let totalPosition = 0;
  
  // Clear any existing text at the start
  setTextState(prev => ({
    ...prev,
    currentText: ''
  }));
  
  // Faster animation timing for mobile
  const letterDelay = isMobile ? 15 : 20; // Speed up for both mobile and desktop
  
  if (isMobile) {
    // Mobile animation - top to bottom
    for (const line of lines) {
      // Add new line at the bottom
      if (totalPosition > 0) {
        setTextState(prev => ({
          ...prev,
          currentText: prev.currentText + '\n\n'
        }));
      }
      
      for (let i = 0; i < line.length; i++) {
        await new Promise(resolve => {
          setTempChar(getRandomSanskritChar());
          setTimeout(() => {
            setTextState(prev => ({
              ...prev,
              currentText: prev.currentText + line[i]
            }));
            resolve();
          }, letterDelay);
        });
      }
      totalPosition++;
    }
  } else {
    // Original desktop animation
    for (const line of lines) {
      for (let i = 0; i < line.length; i++) {
        await emergeLetter(line[i], totalPosition, false);
        totalPosition++;
      }
      setTextState(prev => ({
        ...prev,
        currentText: prev.currentText + '\n\n'
      }));
    }
    
    setTextState(prev => ({
      ...prev,
      currentText: prev.currentText + '\n'
    }));
    
    await emergeLetter('', totalPosition, true);
  }
  
  setTextComplete(true);
  
  if (!isMobile) {
    setTimeout(() => {
      setVortexExpanded(true);
    }, 2300);
  }
};

  const emergeLetter = (letter, position, isOm = false) => {
    return new Promise((resolve) => {
        let cycles = isOm ? 5 : 2;
        const cycleInterval = setInterval(() => {
            if (isOm) {
                setTempChar('ॐ');
                clearInterval(cycleInterval);
                resolve();
            } else {
                if (cycles > 0) {
                    setTempChar(getRandomSanskritChar());
                    cycles--;
                } else {
                    clearInterval(cycleInterval);
                    setTextState(prev => ({
                        ...prev,
                        currentText: prev.currentText + letter
                    }));
                    resolve();
                }
            }
        }, 15);
    });
  };

 return (
  <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <RotationMessage />
    {isMobile ? (
      // MOBILE LAYOUT - Direct modal without 16:9 container
      <div className={`modal-content ${isExpanded ? 'expanded' : ''}`}>
        <CloseGlyph onClick={onClose} />
        <div className="modal-image-container">
          <img src={image.src} alt={image.title} />
          <div className="modal-title">{image.title}</div>
         
        </div>
        {isExpanded && (
          <div className={`modal-description-container ${vortexExpanded ? 'vortex-expanded' : ''}`}>
            <div className="modal-description">
              <div className="glitch-wrapper">
                {textState.currentText.split('\n\n').map((paragraph, i) => (
                  <span key={i} data-text={paragraph} style={{ display: 'block', marginBottom: '1.5rem' }}>
                    {paragraph}
                    {i === textState.currentText.split('\n\n').length - 1 && tempChar && (
                      <span className="temp-char">{tempChar}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    ) : (
      // DESKTOP/TABLET LAYOUT - 16:9 container system
      <div className="modal-viewport">
        <div className="sixteen-nine-container">
          <CloseGlyph onClick={onClose} />
          <div className={`modal-content ${isExpanded ? 'expanded' : ''}`}>
            <StoneColumns />
            {isExpanded && <SanskritRain expandCenter={textComplete} />}
            <div className="modal-image-container">
              <img src={image.src} alt={image.title} />
              <div className="modal-title">{image.title}</div>
              {!isExpanded && 
                <GlyphButton 
                  onClick={handleExpand}
                />
              }
            </div>
            {isExpanded && (
              <div className={`modal-description-container ${vortexExpanded ? 'vortex-expanded' : ''}`}>
                <div className="modal-description">
                  <div className="glitch-wrapper">
                    {textState.currentText.split('\n\n').map((paragraph, i) => (
                      <span key={i} data-text={paragraph} style={{ display: 'block', marginBottom: '1.5rem' }}>
                        {paragraph}
                        {i === textState.currentText.split('\n\n').length - 1 && tempChar && (
                          <span className="temp-char">{tempChar}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
}

// Main App component
function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  
  return (
    <Router>
      <AppContent selectedImage={selectedImage} setSelectedImage={setSelectedImage} />
    </Router>
  );
}

// Create this new component that goes INSIDE the Router
function AppContent({ selectedImage, setSelectedImage }) {
  const location = useLocation(); // Now this works because it's inside Router
  const isMettaMorphPage = location.pathname === '/metta-morph';
  
  return (
    <div className={`App ${isMettaMorphPage ? 'metta-morph-background' : ''}`}>
      <header>
        <img src={logo} alt="Sattvagenic" class="logo--white" className="site-logo" />
        <nav>
  <ul>
    <li><Link to="/">Gallery</Link></li>
    <li><Link to="/music">Music</Link></li>

    <li className="dropdown">
      <span>Practices</span>
      <ul className="dropdown-menu">
        <li><Link to="/metta-morph">Metta-Morph</Link></li>
        <li><a href="/Tratak/" target="_blank" rel="noopener noreferrer">Tratak</a></li>
      </ul>
    </li>
<li><a href="/nadi">Nadi</a></li>
    <li><Link to="/about">About</Link></li>
    
  </ul>
</nav>
        <MobileLingamMenu />
      </header>

      <Routes>
        <Route path="/" element={
          <main>
            <section className="hero">
              <h2>Shaivo-Futurism & Dharmic Technology</h2>
              <p>Sattvagenic (adj.): Producing a state of expansive lucidity, energetic harmony and elevated consciousness.</p>
            </section>
            
            <section className="gallery">
              <h2>Gallery</h2>
              <div className="gallery-grid">
                {galleryImages.map((image) => (
                  <div key={image.id} className="gallery-item" onClick={() => setSelectedImage(image)}>
                    <img src={image.src} alt={image.title} />
                    <div className="image-overlay">
                      <h3>{image.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        } />
        <Route path="/music" element={<Music />} />
        <Route path="/metta-morph" element={<ConsciousnessLab />} />
        <Route path="/about" element={<About />} />
        {/* Hidden routes kept in code for future polish:
            <Route path="/meditation" element={<SriYantra />} />
            <Route path="/mantra" element={<MantraVisualization />} />
            <Route path="/torus-mantra" element={<MantraScene />} />
            <Route path="/energy-body" element={<EnergyScene />} />
            <Route path="/sri-yantra" element={<SriYantraMeru />} />
        */}
      </Routes>
      
      {selectedImage && <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
    </div>
  );
}

export default App;
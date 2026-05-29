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
import Music, { releases } from './components/Music';

// Pick the most recent release by parsing its "Month Year" date string.
const latestRelease = [...releases].sort(
  (a, b) => new Date(b.released) - new Date(a.released)
)[0];


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

            <div className="sg-home">
              {/* ===== Three Pillars ===== */}
              <section className="sg-pillars">
                <h2 className="sg-section-title">Three Streams, One Source</h2>
                <p className="sg-section-sub">Technology as an instrument of consciousness — plugins, music and art flowing from a single vision.</p>

                <div className="sg-pillar-grid">
                  {/* Plugins */}
                  <a className="sg-pillar" href="/nadi">
                    <div className="sg-motif" aria-hidden="true">
                      <svg viewBox="0 0 120 140">
                        {/* sushumna + ida/pingala channels */}
                        <path className="ln-soft" d="M60 14 C40 40, 80 60, 60 86 C40 112, 80 120, 60 128" />
                        <path className="ln-soft" d="M60 14 C80 40, 40 60, 60 86 C80 112, 40 120, 60 128" />
                        <line className="ln" x1="60" y1="10" x2="60" y2="130" />
                        <polygon className="accent" points="60,4 68,16 52,16" />
                        <circle className="node" cx="60" cy="26" r="3" />
                        <circle className="node" cx="60" cy="43" r="3" />
                        <circle className="node-accent" cx="60" cy="60" r="3.4" />
                        <circle className="node" cx="60" cy="77" r="3" />
                        <circle className="node" cx="60" cy="94" r="3" />
                        <circle className="node-accent" cx="60" cy="111" r="3.4" />
                        <circle className="node" cx="60" cy="128" r="3" />
                      </svg>
                    </div>
                    <span className="sg-eyebrow">Plugins</span>
                    <h3 className="sg-pillar-title">Sound Tools</h3>
                    <p className="sg-pillar-text">Chakra-inspired instruments and resonators that turn subtle energy into sound. Nadi is out now; Raga is taking shape.</p>
                    <span className="sg-enter">Enter the Plugins →</span>
                  </a>

                  {/* Music */}
                  <Link className="sg-pillar" to="/music">
                    <div className="sg-motif" aria-hidden="true">
                      <svg viewBox="0 0 120 140">
                        <circle className="ln" cx="60" cy="58" r="44" />
                        <circle className="ln-soft" cx="60" cy="58" r="33" />
                        <circle className="ln" cx="60" cy="58" r="22" />
                        <circle className="ln-soft" cx="60" cy="58" r="11" />
                        <circle className="node-accent" cx="60" cy="58" r="3.2" />
                        <g className="ln">
                          <line x1="34" y1="124" x2="34" y2="118" />
                          <line x1="42" y1="124" x2="42" y2="110" />
                          <line x1="50" y1="124" x2="50" y2="100" />
                          <line x1="58" y1="124" x2="58" y2="112" />
                          <line x1="66" y1="124" x2="66" y2="98" />
                          <line x1="74" y1="124" x2="74" y2="116" />
                          <line x1="82" y1="124" x2="82" y2="106" />
                          <line x1="90" y1="124" x2="90" y2="120" />
                        </g>
                      </svg>
                    </div>
                    <span className="sg-eyebrow">Music</span>
                    <h3 className="sg-pillar-title">Hypnotic Techno</h3>
                    <p className="sg-pillar-text">Deep, meditative techno released through Aedi Records within the Hypnus ecosystem.</p>
                    <span className="sg-enter">Hear the Music →</span>
                  </Link>

                  {/* Art & Practice */}
                  <a className="sg-pillar" href="#gallery">
                    <div className="sg-motif" aria-hidden="true">
                      <svg viewBox="0 0 120 140">
                        <circle className="ln" cx="60" cy="64" r="48" />
                        <circle className="ln-soft" cx="60" cy="64" r="40" />
                        <polygon className="ln" points="60,24 102,96 18,96" />
                        <polygon className="accent" points="60,104 102,32 18,32" />
                        <polygon className="ln-soft" points="60,46 84,86 36,86" />
                        <circle className="node-accent" cx="60" cy="64" r="3.2" />
                      </svg>
                    </div>
                    <span className="sg-eyebrow">Art &amp; Practice</span>
                    <h3 className="sg-pillar-title">The Vision</h3>
                    <p className="sg-pillar-text">A gallery of Shaivo-futurist works and contemplative tools — the soul of the project made visible.</p>
                    <span className="sg-enter">View the Gallery →</span>
                  </a>
                </div>
              </section>

              {/* ===== Featured: Nadi ===== */}
              <section className="sg-feature">
                <div className="sg-feature-grid">
                  <figure className="sg-shot">
                    <img
                      src="/assets/nadi-gui.png"
                      alt="The Nadi plugin interface — seven chakra resonator faders, the shakti energy path, and the main control knobs over a meditative figure."
                    />
                    <figcaption>NADI · SATTVAGENIC</figcaption>
                  </figure>

                  <div className="sg-feature-copy">
                    <span className="sg-eyebrow">Flagship Plugin · Out Now</span>
                    <h3 className="sg-feature-title">Nadi</h3>
                    <p className="sg-feature-tagline">Hypnotic Resonator FX for deep techno, ambient, dub and experimental sound design.</p>

                    <div className="sg-ornament" aria-hidden="true">
                      <span className="ln"></span>
                      <svg viewBox="0 0 14 14">
                        <polygon points="7,1 13,7 7,13 1,7" fill="none" stroke="currentColor" strokeWidth="1" />
                        <circle cx="7" cy="7" r="1.6" fill="currentColor" />
                      </svg>
                      <span className="ln"></span>
                    </div>

                    <p className="sg-feature-lede">Seven chakra-tuned resonators channel the flow of subtle energy into sound — rich resonances, rhythmic pulses and evolving textures. VST3 &amp; AU, Mac &amp; Windows.</p>

                    <div className="sg-cta-row">
                      <a className="sg-btn sg-btn-buy" href="/nadi">Explore Nadi →</a>
                      <a className="sg-btn sg-btn-trial" href="/nadi#trial">Free 14-day Trial</a>
                    </div>
                    <p className="sg-price-note">£25 intro · £32 full · one-off, lifetime updates.</p>
                  </div>
                </div>
              </section>

              {/* ===== Latest Release ===== */}
              <section className="sg-music">
                <h2 className="sg-section-title">Latest Release</h2>
                <p className="sg-section-sub">
                  {latestRelease.title} — {latestRelease.label}, {latestRelease.released}. Featuring “{latestRelease.sattvagenicTrack}” by Sattvagenic.
                </p>
                <div className="sg-release">
                  <figure className="sg-shot sg-shot-embed">
                    <iframe
                      title={`${latestRelease.title} – Bandcamp player`}
                      style={{ border: 0, width: '100%', height: '470px' }}
                      src={latestRelease.embedSrc}
                      seamless
                    >
                      <a href={latestRelease.bandcampUrl}>{latestRelease.title} by Aedi Records</a>
                    </iframe>
                  </figure>
                </div>
                <p className="sg-music-link">
                  <Link to="/music">All releases →</Link>
                </p>
              </section>

              {/* ===== Tratak — an experience to step into ===== */}
              <section className="sg-tratak">
                <div className="sg-tratak-inner">
                  <div className="sg-yantra" aria-hidden="true">
                    <svg viewBox="0 0 200 200">
                      {/* bhupura gate */}
                      <rect className="y-ln" x="28" y="28" width="144" height="144" />
                      <rect className="y-soft" x="36" y="36" width="128" height="128" />
                      <rect className="y-ln" x="92" y="22" width="16" height="8" />
                      <rect className="y-ln" x="92" y="170" width="16" height="8" />
                      <rect className="y-ln" x="22" y="92" width="8" height="16" />
                      <rect className="y-ln" x="170" y="92" width="8" height="16" />
                      {/* petal rings */}
                      <circle className="y-petal" cx="100" cy="100" r="70" />
                      <circle className="y-petal2" cx="100" cy="100" r="60" />
                      <circle className="y-ln" cx="100" cy="100" r="54" />
                      {/* interlocking triangles */}
                      <polygon className="y-ln" points="100,40 40,150 160,150" />
                      <polygon className="y-ln" points="100,160 40,52 160,52" />
                      <polygon className="y-soft" points="100,54 54,140 146,140" />
                      <polygon className="y-soft" points="100,146 54,62 146,62" />
                      <polygon className="y-acc" points="100,68 66,128 134,128" />
                      <polygon className="y-acc" points="100,132 66,74 134,74" />
                      {/* bindu */}
                      <circle className="y-ln" cx="100" cy="100" r="9" />
                      <circle className="y-bindu" cx="100" cy="100" r="3.4" />
                    </svg>
                  </div>
                  <span className="sg-eyebrow sg-eyebrow-dark">Practice · Experience</span>
                  <h2 className="sg-tratak-title">Tratak</h2>
                  <p className="sg-tratak-lede">A Sri Yantra that pulses at the rhythm of attention — part music visualiser, part concentration practice. Gaze into the centre, let the breath settle, and let single-pointed focus arise. Best full-screen, with sound.</p>
                  <a className="sg-btn sg-tratak-btn" href="/Tratak/" target="_blank" rel="noopener noreferrer">Enter Tratak →</a>
                </div>
              </section>
            </div>

            <section className="gallery" id="gallery">
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
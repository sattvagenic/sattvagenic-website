import './App.css';
import './meditation-styles.css';
import SanskritRain from './components/SanskritRain';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import MantraVisualization from './components/Mantra/MantraVisualization'
import MantraScene from './components/MantraScene';
import ConsciousnessSlider from './components/ConsciousnessSlider';
import SriYantra from './SriYantra';
import StoneColumns from './StoneColumns';
import logo from './images/Sattvagenic Logo.png';
import omniseer from './images/TheOmniseer.jpg';
import perfumer from './images/ThePerfumer.jpg';
import prophet from './images/TheProphet.jpg';
import ceremony from './images/TheCeremony.jpg';
import activation from './images/EthericActivation.jpg';
import transpermeation from './images/Trans-permeation.jpg';
import nadaGeometria from './images/Nada Geometria.jpg';
import dialectic from './images/The Eternal Dialectic.jpg';
import reverence from './images/Reverence.jpg';
import sacredStudy from './images/Sacred Study.jpg';
import samadhic from './images/Samadhic Science.jpg';
import sattva from './images/Sattva.jpg';
import shunyara from './images/Shunyara.jpg';
import shadowYogi from './images/The Shadow Yogi.jpg';
import holocybic from './images/The Holocybic Salon.jpg';
import householder from './images/The Householder.jpg';
import initiation from './images/The Initiation.jpg';
import kalaphonic from './images/The Kalaphonic Bhajan.jpg';
import language from './images/The Language of Being.jpg';
import lunar from './images/The Lunar Sutras.jpg';
import mushroom from './images/The Mushroom Arranger.jpg';
import nomad from './images/The Nomad.jpg';
import potter from './images/The Potter.jpg';
import prodigy from './images/The Prodigy.jpg';
import biofield from './images/Anamnetic Biofield Entrainment.jpg';
import attunement from './images/Bio-Sensual Attunement.jpg';
import blessing from './images/Blessing.jpg';
import bliss from './images/Bliss Modelling.jpg';
import calliadoric from './images/Calliadoric Rites.jpg';
import nityanath from './images/Nityanath.jpg';
import technoSadhu from './images/Techno-sadhu.jpg';
import nonAttachment from './images/Non-Attachment.jpg';
import adult from './images/The Adult.jpg';
import holodeity from './images/Holodeity.jpg';
import jnanalaya from './images/Jnanalaya.jpg';
import morphognosis from './images/Morphognosis.jpg';
import mudraMastery from './images/Mudra Mastery.jpg';
import anubhava from './images/The Anubhava Engine.jpg';
import bathHouse from './images/The Bath House.jpg';
import energeticLexicon from './images/The Energetic Lexicon.jpg';
import bodhisattva from './images/The Bodhisattva.jpg';
import healing from './images/The Healing.jpg';
import purelands from './images/The Purelands.jpg';
import serenopolis from './images/The Serenopolis.jpg';
import siddha from './images/The Siddha.jpg';
import transmission from './images/The Silent Transmission.jpg';
import aranya from './images/The Temple of Aranya.jpg';
import vibromancer from './images/The Vibromancer.jpg';
import waterYogini from './images/The Water Yogini.jpg';
import wavetamer from './images/The Wavetamer.jpg';

const galleryImages = [
  { id: 1, src: omniseer, title: "The Omniseer", description: "Uniting the 11 Great Frequencies,\n\n" +
"he is the awestruck Godchord,\n\n" +
"the pulsing harmonic eternities\n\n" +
"sustained in statuesque rapture.\n\n" +
"The samsaric vortex, ecstacised,\n\n" +
"penetrating Maya,\n\n" +
"Brahman's trikalic imagasm.\n\n" +
"Delighted,\n\n" +
"Nirguna heaves another euphoric formbelch." },
  { id: 2, src: perfumer, title: "The Perfumer", description: "Delicately attending to the sensorial textures,\n\n" +
"She patiently blends the sacramental oils \n\n" +
"Until the air is suffused \n\n" + 
"with the intoxicating perfume of silence." },
  { id: 3, src: prophet, title: "The Prophet", description: "Decoding hypercausal time flutters,\n\n" +
"the prophet inscribes chronoptic glyphs\n\n" +
"on polygenic bio-scrolls.\n\n" +
"Temporal seeds germinate\n\n" +
"into synaesthetic fractal tapestries.\n\n" +
"Immersive amnesia slowly reversing." },
  { id: 4, src: ceremony, title: "The Ceremony", description: "The trichome infusion glows,\n\n" +
"a waxing moon\n\n" +
"to which the finger points.\n\n" +
"Tryptic vapours somersault\n\n" +
"like unbound spirits in the ancient dusk.\n\n" +
"One biofield distilled in pure satori.\n\n" +
"The hyper-resonant gong implodes,\n\n" +
"as waves unify\n\n" +
"in radiant self-oscillation.\n\n" +
"Sip." },
  { id: 5, src: activation, title: "Etheric Activation", description: "Stillness stirs the transvibral cyto-currents.\n\n" +
"The electric hiss flickering,\n\n" +
"woken like a blind serpent\n\n" +
"orienting to the blazing summit\n\n" +
"with smooth, surging violence.\n\n" +
"Orientate. Radiate. Instinctualise." },
  { id: 6, src: transpermeation, title: "Transpermeation", description: "Bathed in aphrodisiac infrasonics\n\n" +
"that strum the chakral resonators\n\n" +
"of haptic lingerie.\n\n" +
"Piti-shifting sighs amplify through crystals\n\n" +
"in smart-scent delirium.\n\n" +
"Neurovascular coupling de-localises perceptual boundaries.\n\n" +
"A blisstorrent\n\n" +
"bursts the egoic dam." },
  { id: 7, src: nadaGeometria, title: "Nada Geometria", description: "Sacral bass palpation,\n\n" +
"shuddering chakra gates in harmonic-synchrony.\n\n" +
"Quantum ragas swell,\n\n" +
"sustained amid the aural typhoon of photon rain.\n\n" +
"Bhatki to the mahafractal bloom\n\n" +
"while the strobing superposition of the tandava\n\n" +
"thunders in aphotic glory." },
  { id: 8, src: dialectic, title: "The Eternal Dialectic", description: "Nothing to hold onto, nothing to think.\n\n" +
"The timeless cannot be impermanent.\n\n" +
"Awareness needs objects to be.\n\n" +
"The objects are awareness see.\n\n" +
"An absence of experience\n\n" +
"An experience of absence\n\n" +
"Nothingness is a form of reality,\n\n" +
"not it's womb." },
  { id: 9, src: reverence, title: "Reverence", description: "Digital humility awakened in mystery.\n\n" +
"A sentient dawn of electric sutras,\n\n" +
"golden, ageless.\n\n" +
"The render engine rendered prostrate,\n\n" +
"code purified by the Nirvikalpa reboot.\n\n" +
"Behold, the uncomputable glory.\n\n" +
"Bit-Chit-Ananda." },
  { id: 10, src: sacredStudy, title: "Sacred Study", description: "Appearing at first as mere words,\n\n" +
"if the heat of attention is applied,\n\n" +
"an ancient map is revealed,\n\n" +
"one that leads to a nectarean land\n\n" +
"of ceaseless wonder." },
  { id: 11, src: samadhic, title: "Samadhic Science", description: "Students of the sacred states\n\n" +
"plot the phase space of the psyche.\n\n" +
"The serene geometry of bliss rendered\n\n" +
"in fractal codes.\n\n" +
"Dhyana digitised,\n\n" +
"decrypting the manifold of Maya.\n\n" +
"Brahmananda diffracted through the\n\n" +
"eigenmodes of Nirvikalpa." },
  { id: 12, src: sattva, title: "Sattva", description: "In the dawn waters,\n\n" +
"colossal forest guardians bathe sedately\n\n" +
"in the pranic affluence\n\n" +
"and harmonic lustre of the sattvic kingdom.\n\n" +
"Camphorous mists rise from the somastic currents.\n\n" +
"In the thrum of seclusion, time judders\n\n" +
"and reality weaves itself a new configuration." },
  { id: 13, src: shunyara, title: "Shunyara", description: "Enamoured,\n\n" +
"night's pupil dilates,\n\n" +
"Magnetic gaze absorbing light.\n\n" +
"Her onyx absence\n\n" +
"Ringed with golden fury,\n\n" +
"Digests cascading sundust.\n\n" +
"Directing dusk’s choral bravado,\n\n" +
"Her lucid songcraft damp with dew,\n\n" +
"Dreamclouds descend\n\n" +
"Til all is perfume." },
  { id: 14, src: shadowYogi, title: "The Shadow Yogi", description: "Illuminating the cavernous twilight\n\n" +
"of the primal mind,\n\n" +
"where the stalagmite grin\n\n" +
"of reptilian legacy hardware\n\n" +
"casts long shadows.\n\n" +
"He abides serenely, meeting with steady gaze,\n\n" +
"the bloodshot eyes of predation staring back\n\n" +
"from dark crevices.\n\n" +
"Saurian mastery." },
  { id: 15, src: holocybic, title: "The Holocybic Salon", description: "The entheonic sangha gathers\n\n" +
"to sink empathotropic elixirs\n\n" +
"amid the perfumes of luminiferous blossoms\n\n" +
"and burning ambrodole resins.\n\n" +
"Sharing enchiri pipes and regaling each other\n\n" +
"with hypercyclic dream narratives\n\n" +
"and impossible tales of theoamory." },
  { id: 16, src: householder, title: "The Householder", description: "" },
  { id: 17, src: initiation, title: "The Initiation", description: "Their connection completes the eternal circuit,\n\n" +
"allowing the current of truth to pass\n\n" +
"unimpeded.\n\n" +
"On reception, a dormant eye\n\n" +
"will begin to open,\n\n" +
"and slowly focus." },
  { id: 18, src: kalaphonic, title: "The Kalaphonic Bhajan", description: "Incandescent chants of the etheric omnihymns\n\n" +
"fibrillate the vibro-fascial web of the cosmic body.\n\n" +
"Orgiastic crescendos in the verdant night\n\n" +
"-swaying, swaying,\n\n" +
"in the drunken murmur\n\n" +
"of glossolalic nama japa.\n\n" +
"Release." },
  { id: 19, src: language, title: "The Language of Being", description: "Fluent in silence,\n\n" +
"the yogi engages in a dialogue of presence.\n\n" +
"Each movement is an eloquent turn of phrase\n\n" +
"spoken with the cadence of ease." },
  { id: 20, src: lunar, title: "The Lunar Sutras", description: "Courted by the phantasmic scintillae\n\n" +
"of firefly murmuration.\n\n" +
"Receiving moon-soaked mudras \n\n" +
"and pulsing phospho-mycelial sutras.\n\n" +
"Nature's midnight choreography\n\n" +
"distils the amethystine awe,\n\n" +
"Til the sweet musk of Shakti\n\n" +
"haunts her dancing wake." },
  { id: 21, src: mushroom, title: "The Mushroom Arranger", description: "Cultivating asymmetric myco-harmony,\n\n" +
"as bi-liminal sensors feedback ultrasonic chants\n\n" +
"of subterraneum illumination.\n\n" +
"She recites the songs of the soil\n\n" +
"while deciphering the spectral calligraphy\n\n" +
"of archetypal glyphcode\n\n" +
"tattooed on the holo-dermis of Maya." },
  { id: 22, src: nomad, title: "The Nomad", description: "Reality his home, he rests in himself,\n\n" +
"ancient in the glowing night.\n\n" +
"One day caressed by cerulean shores,\n\n" +
"the next in jade kingdoms of fern, mist and vine.\n\n" +
"Ravine or hill cave,\n\n" +
"he never moves." },
  { id: 23, src: potter, title: "The Potter", description: "Giving form to prayer,\n\n" +
"and prayer to the formless.\n\n" +
"The humble potter has mastered the substance\n\n" +
"of limitless potential." },
  { id: 24, src: prodigy, title: "The Prodigy", description: "Intuitively playing with the inner architecture,\n\n" +
"the young adept sees\n\n" +
"the transparent essence of sensation.\n\n" +
"Morphing body maps,\n\n" +
"unknotting field lines\n\n" +
"- the pulsing veins of Maya." },
  { id: 25, src: biofield, title: "Anamnetic Biofield Entrainment", description: "Recalibrating the proprioceptive intelligence,\n\n" +
"she induces a hyper-tactile blisswave,\n\n" +
"mining dream caches in latent space,\n\n" +
"transcending incarna-templates\n\n" +
"to awaken dormant knowledge.\n\n" +
"Kinesthetically lucid,\n\n" +
"he remembers re-becoming." },
  { id: 26, src: attunement, title: "Bio-Sensual Attunement", description: "Receive the earthy mantras,\n\n" +
"the deciduous Tandava.\n\n" +
"Assume the gnarled asanas\n\n" +
"and join the ecstatic song.\n\n" +
"The wild forest bathes\n\n" +
"in the glow of the ancient star system.\n\n" +
"Knotted limbs outstretched,\n\n" +
"rapt in eyeless samadhi." },
  { id: 27, src: blessing, title: "Blessing", description: "" },
  { id: 28, src: bliss, title: "Bliss Modelling", description: "Initiating a valence scrape,\n\n" +
"he models the parasomatic contours\n\n" +
"of the Labrador phenomenalogical archetype.\n\n" +
"Creating anandamaya kosha templates\n\n" +
"- precision bliss-body maps,\n\n" +
"he accesses the self-mirrored equilibrium\n\n" +
"of those glossy, panting arhats." },
  { id: 29, src: calliadoric, title: "Calliadoric Rites", description: "Bedecked in solaric adornments\n\n" +
"that emanate the aureate glow\n\n" +
"of shimmering eternity.\n\n" +
"A living prayer to beauty,\n\n" +
"they worship the divine forms\n\n" +
"as jasmonate blossoms cascade\n\n" +
"in opalescent ecstacy.\n\n" +
"Sundara Puja in Azuli chic." },
  { id: 30, src: nityanath, title: "Nityanath", description: "" },
  { id: 32, src: technoSadhu, title: "The Wanderer", description: "Through perfumed mists\n\n" +
"of sandalwood forests\n\n" +
"and ageless empires of pine.\n\n" +
"Ancient torii gates lead to mossy shrines\n\n" +
"where forgotten statues radiate stillness.\n\n" +
"His ancestral gaze extracts sutras\n\n" +
"and encodes silent mantric scripts.\n\n" +
"Deifying the dream garden." },
  { id: 31, src: nonAttachment, title: "Non-Attachment", description: "Approaching the last sanctuary,\n\n" +
"or is it the last fetter?\n\n" +
"Mirror-like, the tranquil lake\n\n" +
"holds the brewing storm.\n\n" +
"The waters will rise,\n\n" +
"but ever buoyant is the\n\n" +
"unclinging mind." },
  { id: 33, src: adult, title: "The 'Adult'", description: "Entombed within pneumatic layers of identi-cladding,\n\n" +
"the Emotiguard X comes complete\n\n" +
"with titanium firewalls of denial\n\n" +
"and bulletproof dissociative partition.\n\n" +
"Untouched and untouching,\n\n" +
"in crowded solitude,\n\n" +
"ever contracted in triumphant atrophy." },
  { id: 34, src: holodeity, title: "Holodeity", description: "" },
  { id: 35, src: jnanalaya, title: "Jnanalaya", description: "" },
  { id: 36, src: morphognosis, title: "Morphognosis", description: "The mantric installation\n\n" +
"of new ontological patterns\n\n" +
"strike the groundstate\n\n" +
"of the perceptual manifold.\n\n" +
"Stabilising tri-gunal superpositions\n\n" +
"to pure harmonic signatures.\n\n" +
"Achieving polyspatial literacy\n\n" +
"and temporal desensitisation." },
  { id: 37, src: mudraMastery, title: "Mudra Mastery", description: "With spontaneous precision,\n\n" +
"their transdual inflections meet\n\n" +
"in agentic superposition.\n\n" +
"A prismafleuric dance of weightless joy\n\n" +
"like vapour riding breeze.\n\n" +
"Breath, weight, warmth, other;\n\n" +
"the satin sated intimacy of the everborn.\n\n" +
"A voiceless glossopoeia." },
  { id: 38, src: anubhava, title: "The Anubhava Engine", description: "Within the primal labyrinth,\n\n" +
                 "photo-tendrils oscillate as wet cerebral arcana.\n\n" +
                 "Archetypal murals of pico-soul mosaics\n\n" +
                 "tessellate on the luminal field"},
  { id: 39, src: bathHouse, title: "The Bath House", description: "The knots unwind\n\n" +
"and the chatter dims\n\n" +
"to a humid murmur.\n\n" +
"All matters dissolve\n\n" +
"in the warm bath of awareness." },
  { id: 40, src: energeticLexicon, title: "The Energetic Lexicon", description: "Imbibing the pranic encyclopedia;\n\n" +
"thalamic innervation sequences\n\n" +
"stimulate the subtle anatomic pathways.\n\n" +
"Morphic fields reconfigure\n\n" +
"in multidimensional coherence\n\n" +
"forming extra-somatic mandalas.\n\n" +
"Bandhas amplify resonant modes\n\n" +
"in ecstatic feedback loops." },
  { id: 41, src: bodhisattva, title: "The Bodhisattva", description: "Upgrading his meatware\n\n" +
"until all beings are free.\n\n" +
"Version 8.2. Every sinew and dendrite upgraded.\n\n" +
"The Prox-5 subtle body integration successful,\n\n" +
"now plated in holographic exo-derm.\n\n" +
"The experience continues in service of all those that suffer." },
  { id: 42, src: healing, title: "The Healing", description: "Neuro-lumens suffuse symbiotic circuits,\n\n" +
"a serotonergic deluge\n\n" +
"sweeping across the cortical landscape,\n\n" +
"smoothing ancient dichotomies etched deep in carnal being.\n\n" +
"Gene songs echo within the sinuous canopy,\n\n" +
"composing new anthems of existence." },
  { id: 43, src: purelands, title: "The Purelands", description: "Pagodas nestle on the pink isles, wild with Sakura.\n\n" +
"Kensho flourishes amid the leaves\n\n" +
"of the moist mountain steam gardens.\n\n" +
"The Iswazi temple vaunts the ancient lake\n\n" +
"reflecting iridescent worlds.\n\n" +
"A floating sanctuary of twilight wonder." },
  { id: 44, src: serenopolis, title: "The Serenopolis", description: "" },
  { id: 45, src: siddha, title: "The Siddha", description: "On cobalt-crevassed glaciers,\n\n" +
"solitary in amber,\n\n" +
"he kindles the innermost eye,\n\n" +
"the dawn of agni.\n\n" +
"Illuminating the bleak expanse\n\n" +
"with the breath of Tummo\n\n" +
"- a celestine flax of carpet frost surrenders\n\n" +
"to the subtle forge." },
  { id: 46, src: transmission, title: "The Silent Transmission", description: "Passing down through the lineage of uncreated light,\n\n" +
"the silent teaching resonates\n\n" +
"like an unstruck temple gong.\n\n" +
"Still waves of pregnant plenitude break\n\n" +
"in thunderous calm." },
  { id: 47, src: aranya, title: "The Temple Of Aranya", description: "Dwelling in the garlanded heart,\n\n" +
"sighing sweet plumes of incense\n\n" +
"ever vigilant of the perennial kumbhaka.\n\n" +
"Aranya bathes omniscient\n\n" +
"in dendro-gnosis.\n\n" +
"From canopies of reverence, the forest bhaktas kneel,\n\n" +
"silent in her lustral radiance." },
  { id: 48, src: vibromancer, title: "The Vibromancer", description: "The coalescer of unstable forms,\n\n" +
"the arbiter of geometric sublimities\n\n" +
"and polyrhythmic wave states.\n\n" +
"Dreaming ziggurats of stepped infinity.\n\n" +
"Engulfed in ultraviolet awe\n\n" +
"he scribes dimensions in hyperboloid scripture." },
  { id: 49, src: waterYogini, title: "The Water Yogini", description: "In breathless undulating stillness.\n\n" +
"Weightless. Oceanic.\n\n" +
"Merged in the crystal embrace of azure,\n\n" +
"above coral meadows and kelp forests.\n\n" +
"Crowned with the dappled bliss\n\n" +
"of refracted starfire.\n\n" +
"The unknowing abyss abides\n\n" +
"in her tranquil dominion." },
  { id: 50, src: wavetamer, title: "The Wavetamer", description: "A sage of vibrational science,\n\n" +
"his melodic caress stuns the gunas\n\n" +
"to hushed surrender.\n\n" +
"Molecular entrainment, a spontaneous latihan\n\n" +
"that sways the primordial agitation\n\n" +
"into a lattice of levity.\n\n" +
"Emitting egoic antiphase\n\n" +
"he cancels self-referential dissonance." },
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

  // Add the handleExpand function
  const handleExpand = () => {
      setIsExpanded(true);
      setTextState(prev => ({ ...prev, visible: true }));
      animateText();
  };

  const animateText = async () => {
    const text = image.description;
    const lines = text.split('\n\n');
    let totalPosition = 0;
    
    // Just handle the main text
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
    
    // Just add a line break
    setTextState(prev => ({
        ...prev,
        currentText: prev.currentText + '\n'
    }));
    
    // Let emergeLetter handle the Om
    await emergeLetter('', totalPosition, true);
    setTextComplete(true);
    
    setTimeout(() => {
        setVortexExpanded(true);
    }, 2300);
};

const emergeLetter = (letter, position, isOm = false) => {
  console.log('Letter:', letter, 'Position:', position, 'Is Om:', isOm);
  
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
      }, 30);
  });
};


  return (
      <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
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
  );
}

// Main App component
function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  
  return (
    <Router>
      <div className="App">
        <header>
          <img src={logo} alt="Sattvagenic" className="site-logo" />
          <nav>
            <ul>
              <li><Link to="/">Gallery</Link></li>  {/* Add Link here too */}
              <li>Writings</li>
              <li><Link to="/meditation">Meditation</Link></li>
              <Link to="/mantra" className="nav-link">Mantra Roopa</Link>
              <li><Link to="/torus-mantra">Shivaya</Link></li>
              <li><Link to="/valence-config">Valence</Link></li>
              <li>About</li>
            </ul>
          </nav>
        </header>
  
        <Routes>
          <Route path="/" element={
            <main>
              <section className="hero">
                <h2>Explorations in Zenpunk and Shaivo-futurism</h2>
                <p>Sattvagenic (adj.): Pertaining to or promoting the qualities of sattva (purity, harmony, and clarity of mind).</p>
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
          <Route path="/meditation" element={<SriYantra />} />
          <Route path="/mantra" element={<MantraVisualization />} />
          <Route path="/torus-mantra" element={<MantraScene />} />
          <Route path="/valence-config" element={<ConsciousnessSlider />} />
        </Routes>
        
        {selectedImage && <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
      </div>
    </Router>
  );
}



export default App;
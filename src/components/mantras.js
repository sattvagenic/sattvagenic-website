/*
 * The mantra-roopas, one entry per mantra. The page at /mantra-roopa/<slug> reads its entry;
 * /mantra-roopa on its own opens the first one. To add a mantra, add an entry here.
 *
 *   syllables      the written syllables the nadis carry, in order (the Om at the heart is drawn separately)
 *   lines          the mantra's lines, shown down the left margin; they light in turn through each chant
 *   syllableCount  how many squares in the syllable grid (one lights per syllable through each chant)
 *   form           ring: ring radius, tube: tube radius. A tube wider than the ring makes the apple-shaped
 *                  spindle torus, with every nadi passing through the axis round the Om; a ring wider than
 *                  the tube makes an open ring, like the old Om Namah Shivaya piece.
 *   chantSeconds   how long one chant takes to travel round a nadi (set this to match the music's tempo later)
 *   notes          short paragraphs under the piece
 */
export const MANTRAS = [
  {
    slug: 'mahamrityunjaya',
    name: 'Mahamrityunjaya',
    deva: 'महामृत्युञ्जय',
    kicker: 'MANTRA ROOPA // 01 // MAHAMRITYUNJAYA',
    sub: 'MAHAMRITYUNJAYA  -  THE GREAT DEATH-CONQUERING MANTRA',
    syllables: ['त्र्य', 'म्ब', 'कं', 'य', 'जा', 'म', 'हे', 'सु', 'ग', 'न्धिं', 'पु', 'ष्टि', 'व', 'र्ध', 'न', 'म्',
                'उ', 'र्वा', 'रु', 'क', 'मि', 'व', 'ब', 'न्ध', 'ना', 'न्', 'मृ', 'त्यो', 'र्मु', 'क्षी', 'य', 'मा', 'ऽ', 'मृ', 'ता', 'त्'],
    syllableCount: 32,
    lines: ['त्र्यम्बकं यजामहे', 'सुगन्धिं पुष्टिवर्धनम्', 'उर्वारुकमिव बन्धनान्', 'मृत्योर्मुक्षीय माऽमृतात्'],
    rows: [['AKSHARA', '32'], ['CHANDAS', 'ANUSHTUBH 4x8'], ['NADI', '54 x 2']],
    gridLabel: 'PADA x AKSHARA',
    caption: 'urvarukam iva bandhanan - as the ripe fruit falls free of the vine',
    figure: 'FIG. 01  -  SATTVAGENIC  -  SPECIMEN OF A LIVING MANTRA',
    callouts: { heart: 'OM // HIRANYAGARBHA', heartShort: 'OM', nadi: '54 NADI', outer: '108 AVRITTI' },
    form: { ring: 0.62, tube: 1.0, nadis: 54, perNadi: 46 },
    chantSeconds: 8,
    notes: [
      'Digitally manifesting as Hiranyagarbha, the heart of which is Om, the seed of all mantras.',
      '54 mantric pathways mirrored for 108 repetitions: the pulsing nadis of the spanda field.',
      'Each cycle compounds the protective field, building a firewall of shakti.',
    ],
  },
  // Next: Om Namah Shivaya. A starting point, to fill in when it's ready:
  // {
  //   slug: 'om-namah-shivaya', name: 'Om Namah Shivaya', deva: 'ॐ नमः शिवाय',
  //   kicker: 'MANTRA ROOPA // 02 // OM NAMAH SHIVAYA', sub: 'OM NAMAH SHIVAYA  -  THE FIVE-SYLLABLE MANTRA',
  //   syllables: ['न', 'मः', 'शि', 'वा', 'य'], syllableCount: 5, lines: ['ॐ नमः शिवाय'],
  //   form: { ring: 1.3, tube: 1.0, nadis: 126, perNadi: 48 }, ...
  // },
];

export const findMantra = slug => (slug ? MANTRAS.find(m => m.slug === slug) : MANTRAS[0]);

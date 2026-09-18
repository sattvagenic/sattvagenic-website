NADI TUNING FILES - just intonation ragas, in all twelve keys
Sattvagenic - sattvagenic.com/nadi
=================================================================

WHY THESE EXIST

Nadi tunes its seven resonators in JUST INTONATION - intervals built
from small whole-number ratios (3/2, 5/4, 9/8), the way the ragas were
always intended to be tuned.

Equal temperament, which every synth and piano uses by default, divides
the octave into twelve equal steps instead. The two systems do not line
up: the just major third sits about 14 cents flat of the equal-tempered
one, the sixth about 16 cents flat.

That mismatch is why Nadi can seem to fight an existing track. The notes
agree; the tuning doesn't, so you hear beating.

These files fix it at the root. Load one and your instruments play in
exactly the same tuning as Nadi's resonators - they lock together and
the resonance blooms instead of beating.

HOW TO USE - THREE STEPS

  1. Pick the folder for your track's key (00_C, 05_F, 09_A ...).
  2. Load the raga you want from that folder into Live or your synth.
  3. Set Nadi's Sa to the matching frequency from Sa_Frequencies.txt,
     and Nadi's Rasa to the same raga.

  That's it. Everything is now in one tuning, in your key.

WHAT'S IN EACH KEY FOLDER

  Ableton-Live-ascl/    .ascl files for Live 12 and later.
                        Includes swara note names in the piano roll.

  Other-Software-scl/   .scl files in the original Scala format, for
                        synths with their own tuning support - Spire,
                        Serum, Pigments, Diva, Zebra and many others.

  Fifteen ragas in each, named to match Nadi's Rasa menu exactly.
  Nadi_Chromatic holds all twelve degrees Nadi uses - for Custom rasa,
  or free playing without a fixed raga.

ABLETON LIVE 12

  Drag an .ascl into the Tuning section beneath Live's Browser sidebar,
  or drop it into a folder in Live's Places - it appears under Tunings,
  tagged User. Double-click to activate. The piano roll then shows the
  raga's own notes instead of standard MIDI notes.

  Live retunes third-party plug-ins only if they are MPE-capable AND
  their pitch bend range is set to 48 semitones. Many are not. For those,
  load the .scl into the synth's own tuning section instead - that route
  works regardless of the DAW.

OTHER SYNTHS (Spire, Serum, Pigments, Diva...)

  Load the .scl in the synth's own tuning or microtuning section, and set
  its base/root note to the key you chose. Some synths also want a
  keyboard mapping (.kbm) file; if yours does and none is supplied, the
  default mapping is normally correct - the scale starts at the root and
  repeats every octave.

DO THE KEYS HAVE TO MATCH?

  Not necessarily. Matching gives maximum lock: every note reinforces.
  But offsetting Nadi by a just interval - a fifth or a fourth - is also
  musically coherent, and can be lovely. Nadi simply plays the same raga
  in a related key. What to avoid is an arbitrary offset, which puts the
  two grids between each other and brings the beating back.

NOTE NAMES

  Capitals are shuddha (natural) degrees, lower case are komal
  (flattened), and Ma+ is tivra Ma:

     Sa  re  Re  ga  Ga  Ma  Ma+  Pa  dha  Dha  ni  Ni

  These are the raga's own degrees, not Western note names - Sa is
  whichever root you chose.

TUNING REFERENCE

  Built to A4 = 440 Hz. If you work at a different concert pitch, the
  reference frequency is the last number on the @ABL REFERENCE_PITCH
  line in each .ascl and can be edited in any text editor.

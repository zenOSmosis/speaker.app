import { NOTES } from "./musicNotes";

// Note: Middle C is 60
// TODO: Re-write octaveIdx to be -2, -1, 0, 1, 2, ... ?
export default function getMIDINumber(musicNote, octaveIdx) {
  // Notes converted to
  const MIDI_SCALE = NOTES.map((_item, idx) => {
    // Base midi note, at the first octave
    const base = idx + 24;

    const expression = NOTES.length * octaveIdx;

    return base + expression;
  });

  const match = MIDI_SCALE[NOTES.indexOf(musicNote)];

  return match;
}

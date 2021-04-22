import getMIDINumber from "./getMIDINumber";

export const TYPE_STRINGED = "Stringed";
export const TYPE_PERCUSSION = "Percussion";
export const TYPES = [TYPE_STRINGED, TYPE_PERCUSSION];

// TODO: Incorporate MIDI patch numbers (instrument selection): https://pjb.com.au/muscript/gm.html
const INSTRUMENTS = [
  {
    name: "Piano",
    id: 0,
    type: TYPE_STRINGED,
    minMIDINumber: 0, // TODO: Patch in
    maxMIDINumber: 0, // TODO: Patch in
    // Only for PhantomSrc
    getAudioUrlPath: ({ note, octaveIdx }) => {
      const midiNumber = getMIDINumber(note, octaveIdx);

      const srcPart = midiNumber.toString().padStart(3, "0");

      // Piano sample
      const src = `/audio-samples/nsynth/nsynth-acoustic-keyboard-subset/keyboard_acoustic_000-${srcPart}-025.wav`;

      return src;
    },
  },
  {
    name: "Electric Guitar",
    id: 1,
    type: TYPE_STRINGED,
    minMIDINumber: 0, // TODO: Patch in
    maxMIDINumber: 0, // TODO: Patch in
    getAudioUrlPath: ({ note, octaveIdx }) => {
      // TODO: Incorporate octaves

      const srcPart = note.replace("#", "_SHARP");
      const src = `audio-samples/zenosmosis/electric-guitar-heavy-overdrive/C_-1/${srcPart}_0.wav`;

      return src;
    },
  },
  {
    name: "Cymbal",
    id: 2,
    type: TYPE_PERCUSSION,
    minMIDINumber: 0, // TODO: Patch in
    maxMIDINumber: 0, // TODO: Patch in
    getAudioUrlPath: ({ note, octaveIdx }) => {
      const src =
        "/audio-samples/musicradar/musicradar-drum-samples/assorted-hits/cymbals/CYCdh_MultiCrash-01.wav";

      return src;
    },
  },
  {
    name: "Hi Hat",
    id: 3,
    type: TYPE_PERCUSSION,
    minMIDINumber: 0, // TODO: Patch in
    maxMIDINumber: 0, // TODO: Patch in
    getAudioUrlPath: ({ note, octaveIdx }) => {
      const src =
        "/audio-samples/musicradar/musicradar-drum-samples/assorted-hits/hi-hats/acoustic/Acoustic-Hat-02.wav";

      return src;
    },
  },
  {
    name: "Kick",
    id: 4,
    type: TYPE_PERCUSSION,
    minMIDINumber: 0, // TODO: Patch in
    maxMIDINumber: 0, // TODO: Patch in
    getAudioUrlPath: ({ note, octaveIdx }) => {
      const src =
        "/audio-samples/musicradar/musicradar-drum-samples/assorted-hits/kicks/acoustic/CYCdh_AcouKick-03.wav";

      return src;
    },
  },
  {
    name: "Snare",
    id: 5,
    type: TYPE_PERCUSSION,
    minMIDINumber: 0, // TODO: Patch in
    maxMIDINumber: 0, // TODO: Patch in
    getAudioUrlPath: ({ note, octaveIdx }) => {
      const src =
        "/audio-samples/musicradar/musicradar-drum-samples/assorted-hits/snares/acoustic/Acoustic-Snare-02.wav";

      return src;
    },
  },
];

export default INSTRUMENTS;

/**
 * @param {number | string} id
 * @return {Object}
 */
export function getInstrumentWithId(id) {
  // Cast to int
  id = parseInt(id, 10);

  for (const instrument of INSTRUMENTS) {
    if (instrument.id === id) return instrument;
  }
}

export function getStrigedInstruments() {
  return INSTRUMENTS.filter(({ type }) => type === TYPE_STRINGED);
}

export function getPercussionInstruments() {
  return INSTRUMENTS.filter(({ type }) => type === TYPE_PERCUSSION);
}

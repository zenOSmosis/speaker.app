// TODO: Don't use this

import React, { useEffect } from "react";
import { Howl, Howler } from "howler";
import { EVT_DATA_RECEIVED } from "../../../WebZenRTCPeer";

import { CAPABILITY_REMOTE_KEYBOARD_MUSICAL_INPUT } from "../../../shared/capabilities";

// @see https://jsfiddle.net/chadananda/kvzrsx5t/84/
// const audioURL = "https://cdn.glitch.com/02dcea11-9bd2-4462-ac38-eeb6a5ad9530%2F331_full_beautiful-minds_0171_preview.mp3?1522829295082";

const audioURL = "https://pixijs.io/pixi-sound/examples/resources/sprite.mp3";

Howler.mute(false); // to initialize Howler internals
const streamOutput = Howler.ctx.createMediaStreamDestination();

// first disconnect
Howler.masterGain.disconnect();

// then reconnect to our new destination
Howler.masterGain.connect(streamOutput); // connect masterGain to destination

// Start the audio timer (note, this doesn't have to be mounted to the DOM)
const audioEl = document.createElement("audio");
audioEl.srcObject = streamOutput.stream;

const sound = new Howl({ html5: true, src: audioURL });

// https://pixijs.io/pixi-sound/examples/demo.html
const [buzzer, whistle, success, car] = [...new Array(4)].map((_item, idx) => {
  const sources = [
    "https://pixijs.io/pixi-sound/examples/resources/buzzer.mp3",
    "https://pixijs.io/pixi-sound/examples/resources/whistle.mp3",
    "https://pixijs.io/pixi-sound/examples/resources/success.mp3",
    "https://pixijs.io/pixi-sound/examples/resources/car.mp3",
  ];

  return new Howl({
    html5: false,
    src: sources[idx],
  });
});

// 21
// const c_1 = 24;
// const c2 = 36;
// const c3 = 48;
// const c4 = 60; // Middle C?
// const c5 = 72;
// const c6 = 84;
// const c7 = 96;
// const c8 = 108;
// 108

const createSoundWithNoteOctave = (() => {
  // let baseMidiNumber = 21;
  const NOTE_C = "C";
  const NOTE_C_SHARP = "C#";
  const NOTE_D = "D";
  const NOTE_D_SHARP = "D#";
  const NOTE_E = "E";
  const NOTE_F = "F";
  const NOTE_F_SHARP = "F#";
  const NOTE_G = "G";
  const NOTE_G_SHARP = "G#";
  const NOTE_A = "A";
  const NOTE_A_SHARP = "A#";
  const NOTE_B = "B";

  const NOTES = [
    NOTE_C,
    NOTE_C_SHARP,
    NOTE_D,
    NOTE_D_SHARP,
    NOTE_E,
    NOTE_F,
    NOTE_F_SHARP,
    NOTE_G,
    NOTE_G_SHARP,
    NOTE_A,
    NOTE_A_SHARP,
    NOTE_B,
  ];

  const caches = {};

  // TODO: Used cached sound if already created
  return function createSoundWithNoteOctave(note, octave = 1) {
    if (caches[`${note}_${octave}`]) {
      return caches[`${note}_${octave}`];
    }

    // Notes converted to
    const MIDI_SCALE = NOTES.map((_item, idx) => {
      // Base midi note, at the first octave
      const base = idx + 24;

      const offset = octave - 1;

      const expression = NOTES.length * offset;

      return base + expression;
    });

    // TODO: Document
    const match = MIDI_SCALE[NOTES.indexOf(note)];
    const srcPart = match.toString().padStart(3, "0");

    const src = `/audio-samples/nsynth/nsynth-acoustic-keyboard-subset/keyboard_acoustic_000-${srcPart}-025.wav`;

    const howl = new Howl({
      html5: false,
      src,
      volume: 0.4,
    });

    caches[`${note}_${octave}`] = howl;

    return howl;
  };
})();

const [cymbal, hiHat, kick, snare] = [...new Array(4)].map((_item, idx) => {
  const sources = [
    // Cymbal
    "/audio-samples/musicradar/musicradar-drum-samples/assorted-hits/cymbals/CYCdh_MultiCrash-01.wav",

    // Hi Hat
    "/audio-samples/musicradar/musicradar-drum-samples/assorted-hits/hi-hats/acoustic/Acoustic-Hat-02.wav",

    // Kick
    "/audio-samples/musicradar/musicradar-drum-samples/assorted-hits/kicks/acoustic/CYCdh_AcouKick-03.wav",

    // Snare
    "/audio-samples/musicradar/musicradar-drum-samples/assorted-hits/snares/acoustic/Acoustic-Snare-02.wav",
  ];

  return new Howl({
    html5: false,
    src: sources[idx],
    volume: 1.5,
  });
});

const createRandomSound = () => {
  const effects = [
    "applause4",
    "applause7",
    "attack",
    "cash-register",
    "cheer",
    "does-not-sound-like-a-drone",
    "e-arcing",
    "e-fan",
    "film-fight",
    "rain-thunder",
    "seagulls",
  ];

  const effect = effects[Math.floor(Math.random() * effects.length)];

  const sound = new Howl({
    html5: false,
    src: `/audio-samples/sound-effects/freesoundeffects.com/${effect}.wav`,
  });

  return sound;
};

const getComputerKeyboardMapWithOctave = function (octave = 1) {
  const COMPUTER_KEYBOARD_MAP = {
    // TODO: Remove; temp
    /*
    53: {
      symbol: 5,
      sound: createSoundWithNoteOctave("c", 1),
    },
    */

    49: {
      symbol: 1,
      sound: buzzer,
    },

    50: {
      symbol: 2,
      sound: whistle,
    },

    51: {
      symbol: 3,
      sound: success,
    },

    52: {
      symbol: 4,
      sound: car,
    },

    65: {
      symbol: "A",
      sound: createSoundWithNoteOctave("C", octave),
    },

    87: {
      symbol: "W",
      sound: createSoundWithNoteOctave("C#", octave),
    },

    83: {
      symbol: "S",
      sound: createSoundWithNoteOctave("D", octave),
    },

    69: {
      symbol: "E",
      sound: createSoundWithNoteOctave("D#", octave),
    },

    68: {
      symbol: "D",
      sound: createSoundWithNoteOctave("E", octave),
    },

    70: {
      symbol: "F",
      sound: createSoundWithNoteOctave("F", octave),
    },

    84: {
      symbol: "T",
      sound: createSoundWithNoteOctave("F#", octave),
    },

    71: {
      symbol: "G",
      sound: createSoundWithNoteOctave("G", octave),
    },

    89: {
      symbol: "Y",
      sound: createSoundWithNoteOctave("G#", octave),
    },

    72: {
      symbol: "H",
      sound: createSoundWithNoteOctave("A", octave),
    },

    85: {
      symbol: "U",
      sound: createSoundWithNoteOctave("A#", octave),
    },

    74: {
      symbol: "J",
      sound: createSoundWithNoteOctave("B", octave),
    },

    75: {
      symbol: "K",
      sound: createSoundWithNoteOctave("C", octave + 1),
    },

    79: {
      symbol: "O",
      sound: createSoundWithNoteOctave("C#", octave + 1),
    },

    76: {
      symbol: "L",
      sound: createSoundWithNoteOctave("D", octave + 1),
    },

    80: {
      symbol: "P",
      sound: createSoundWithNoteOctave("D#", octave + 1),
    },

    186: {
      symbol: ";",
      sound: createSoundWithNoteOctave("E", octave + 1),
    },

    222: {
      symbol: "'",
      sound: createSoundWithNoteOctave("F", octave + 1),
    },

    90: {
      symbol: "Z",
      sound: cymbal,
    },

    88: {
      symbol: "X",
      sound: hiHat,
    },

    67: {
      symbol: "C",
      sound: kick,
    },

    86: {
      symbol: "V",
      sound: snare,
    },

    9: {
      symbol: "tab",
      sound: createRandomSound,
    },
  };

  return COMPUTER_KEYBOARD_MAP;
};

export default function HowlerAudio({
  isZenRTCConnected,
  zenRTCPeer,
  ...rest
}) {
  useEffect(() => {
    zenRTCPeer.addCapability(CAPABILITY_REMOTE_KEYBOARD_MUSICAL_INPUT);

    const handleDataReceived = (data) => {
      const { o: octave, c: keyCode } = data || {};

      if (keyCode) {
        const COMPUTER_KEYBOARD_MAP = getComputerKeyboardMapWithOctave(octave);

        const computerKeyboardMap = COMPUTER_KEYBOARD_MAP[Math.abs(keyCode)];
        const isDown = keyCode > 0;
        // const isUp = keyCode < 0;

        /*
        console.log({
          octave,
          keyCode,
          computerKeyboardMap,
          isDown,
          isUp,
        });
        */

        if (computerKeyboardMap) {
          let { sound, symbol } = computerKeyboardMap;

          // Random sound effects may return a function
          if (typeof sound === "function") {
            sound = sound();
          }

          if (sound) {
            if (isDown) {
              sound.play();
            } else {
              // Let numeric symbols ring out
              if (typeof symbol === "string") {
                // sound.stop();
              }
            }
          }
        }
      }
    };

    zenRTCPeer.on(EVT_DATA_RECEIVED, handleDataReceived);

    return function unmount() {
      zenRTCPeer.off(EVT_DATA_RECEIVED, handleDataReceived);
    };
  });

  useEffect(() => {
    if (isZenRTCConnected) {
      const mediaStream = streamOutput.stream;

      const audioMediaStreamTracks = mediaStream.getAudioTracks();

      audioMediaStreamTracks.map((track) =>
        zenRTCPeer.publishMediaStreamTrack(track)
      );

      // TODO: Play startup sound here
    }
  }, [isZenRTCConnected, zenRTCPeer]);

  return (
    <div>
      <button onClick={() => sound.play()}>Start Howler Audio</button>

      <button onClick={() => buzzer.play()}>Buzzer</button>

      <button onClick={() => whistle.play()}>Whistle</button>

      <button onClick={() => success.play()}>Success</button>

      <button onClick={() => car.play()}>Car</button>
    </div>
  );
}

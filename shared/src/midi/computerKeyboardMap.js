const COMPUTER_KEYBOARD_MAP = {
  65: {
    keyboardSymbol: "A",
    note: "C",
    octaveIdx: 0,
  },

  87: {
    keyboardSymbol: "W",
    note: "C#",
    octaveIdx: 0,
  },

  83: {
    keyboardSymbol: "S",
    note: "D",
    octaveIdx: 0,
  },

  69: {
    keyboardSymbol: "E",
    note: "D#",
    octaveIdx: 0,
  },

  68: {
    keyboardSymbol: "D",
    note: "E",
    octaveIdx: 0,
  },

  70: {
    keyboardSymbol: "F",
    note: "F",
    octaveIdx: 0,
  },

  84: {
    keyboardSymbol: "T",
    note: "F#",
    octaveIdx: 0,
  },

  71: {
    keyboardSymbol: "G",
    note: "G",
    octaveIdx: 0,
  },

  89: {
    keyboardSymbol: "Y",
    note: "G#",
    octaveIdx: 0,
  },

  72: {
    keyboardSymbol: "H",
    note: "A",
    octaveIdx: 0,
  },

  85: {
    keyboardSymbol: "U",
    note: "A#",
    octaveIdx: 0,
  },

  74: {
    keyboardSymbol: "J",
    note: "B",
    octaveIdx: 0,
  },

  75: {
    keyboardSymbol: "K",
    note: "C",
    octaveIdx: 0 + 1,
  },

  79: {
    keyboardSymbol: "O",
    note: "C#",
    octaveIdx: 0 + 1,
  },

  76: {
    keyboardSymbol: "L",
    note: "D",
    octaveIdx: 0 + 1,
  },

  80: {
    keyboardSymbol: "P",
    note: "D#",
    octaveIdx: 0 + 1,
  },

  186: {
    keyboardSymbol: ";",
    note: "E",
    octaveIdx: 0 + 1,
  },

  222: {
    keyboardSymbol: "'",
    note: "F",
    octaveIdx: 0 + 1,
  },
};

/**
 * @return {Object}
 */
export function getMapWithKeyCode(keyCode) {
  return COMPUTER_KEYBOARD_MAP[keyCode];
}

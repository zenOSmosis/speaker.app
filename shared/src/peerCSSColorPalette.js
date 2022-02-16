// TODO: Move into VirtualServerZenRTCPeer as a static property

/**
 * Used primarily by the backend to assign consistent colors to the frontend
 * peers.
 *
 * @see https://colorswall.com/palette/8/
 *
 * @return {string[]}
 */
const peerCSSColorPalette = [
  "#e3f2fd",
  "#bbbefb",
  "#90caf9",
  "#64b5f6",
  "#42a5f5",
  "#2196f3",
];

export default peerCSSColorPalette;

// Keep track of colors, server-side, so we can consistently assign them to peers
export const getNextPeerCSSColor = (() => {
  let _idxColor = -1;

  return () => {
    ++_idxColor;

    if (!peerCSSColorPalette[_idxColor]) {
      _idxColor = 0;
    }

    return peerCSSColorPalette[_idxColor];
  };
})();

import ZenRTCPeer, {
  EVT_CONNECTING,
  EVT_CONNECTED,
  EVT_DISCONNECTED,
  EVT_DESTROYED,
  EVT_DATA_RECEIVED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_SYNC_EVT_RECEIVED,
} from "../shared/ZenRTCPeer";

import peerCSSColorPalette from "../shared/peerCSSColorPalette";

import { CAPABILITY_MULTI_PEER_MULTIPLEXER } from "../shared/capabilities";

import faker from "faker";

export {
  EVT_CONNECTING,
  EVT_CONNECTED,
  EVT_DISCONNECTED,
  EVT_DESTROYED,
  EVT_DATA_RECEIVED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_SYNC_EVT_RECEIVED,
};

// TODO: Move this somewhere else
const MAX_INSTANCES = 20;

let _ChromeZenRTCPeerMonitor = null;

// Keep track of colors, server-side, so we can consistently assign them to peers
const getNextPeerCSSColor = (() => {
  let _idxColor = -1;

  return () => {
    ++_idxColor;

    if (!peerCSSColorPalette[_idxColor]) {
      _idxColor = 0;
    }

    return peerCSSColorPalette[_idxColor];
  };
})();

/**
 * Represents a remote ZenRTCPeer running in Headless Chrome.
 *
 * NOTE: This handles multiplexing of multiple sessions (by utilizing ChromePhantomSession)
 *
 * NOTE: This is not a "pure" peer, as it mixes in functionality of Phantom
 * Sessions and the underlying ZenRTCPeer.
 */
export default class ChromeZenRTCPeer extends ZenRTCPeer {
  static setMonitor(ChromeZenRTCPeerMonitor) {
    _ChromeZenRTCPeerMonitor = ChromeZenRTCPeerMonitor;
  }

  constructor({ ipcMessageBroker, ...rest }) {
    if (!_ChromeZenRTCPeerMonitor) {
      throw new Error(
        "No ChromeZenRTCPeerMonitor available.  Use static setMonitor to set ChromeZenRTCPeerMonitor"
      );
    }

    super({ ipcMessageBroker, ...rest });

    this._cssColor = getNextPeerCSSColor();
    this._nickname = `${faker.hacker.noun()} ${faker.hacker.verb()}`
      .split(" ")
      .map((word) => word[0].toUpperCase() + word.substring(1))
      .filter((val, idx) => idx < 2)
      .join(" ");

    // TODO: Move to ChromePhantomSession?
    this.addCapability(CAPABILITY_MULTI_PEER_MULTIPLEXER);

    // TODO: Move to ChromePhantomSession?
    if (ChromeZenRTCPeer.getInstances().length > MAX_INSTANCES) {
      console.warn("Too many instances");

      this.connect = () => null;

      // TODO: Emit through ipcMessageBroker that "the room is full"
      return;
    }

    // Automatically connect
    this.connect();

    _ChromeZenRTCPeerMonitor.registerChromeZenRTCPeerInstance(this);

    (() => {
      this.on(EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED, ({ mediaStreamTrack }) => {
        if (mediaStreamTrack.kind === "audio") {
          /**
           * This fixes audio being able to play on headless Chrome.
           *
           * The problem seems to be that the WebAudio graph's clock is driven
           * from its sink, so if the sink doesn't connect to anything with a
           * clock, nothing happens.
           * @see https://bugs.chromium.org/p/chromium/issues/detail?id=933677
           */
          const elMedia = document.createElement("video");
          elMedia.srcObject = new MediaStream([mediaStreamTrack]);
          // TODO: Does this need clean-up on media stream end?
        }
      });
    })();
  }

  /**
   * @return {string}
   */
  getCSSColor() {
    return this._cssColor;
  }

  /**
   * @return {string}
   */
  getNickname() {
    return this._nickname;
  }
}

import ZenRTCPeer, {
  EVT_UPDATED,
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
  EVT_ZENRTC_SIGNAL,
} from "@shared/ZenRTCPeer";

import { getNextPeerCSSColor } from "@shared/peerCSSColorPalette";

import { CAPABILITY_MULTI_PEER_MULTIPLEXER } from "@shared/capabilities";

export {
  EVT_UPDATED,
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
  EVT_ZENRTC_SIGNAL,
};

// TODO: Move this handling into TranscoderZenRTCManager
const MAX_INSTANCES = 20;

/**
 * Represents a remote ZenRTCPeer running in Headless Chrome.
 *
 * NOTE: This handles multiplexing of multiple sessions (by utilizing ChromePhantomSession)
 *
 * NOTE: This is not a "pure" peer, as it mixes in functionality of Phantom
 * Sessions and the underlying ZenRTCPeer.
 */
export default class TranscoderZenRTCPeer extends ZenRTCPeer {
  // TODO: Document
  constructor({ socketIoId, ...rest }) {
    super({ socketIoId, ...rest });

    this._cssColor = getNextPeerCSSColor();

    // TODO: Move to TranscoderZenRTCManager
    // TODO: Rename to CAPABILITY_NETWORK_TRANSCODER
    this.addCapability(CAPABILITY_MULTI_PEER_MULTIPLEXER);

    // TODO: Move to TranscoderZenRTCManager
    if (TranscoderZenRTCPeer.getInstances().length > MAX_INSTANCES) {
      this.log.warn("Too many instances");

      // TODO: Keep this like this?
      this.connect = () => null;

      // TODO: Emit through ipcMessageBroker that "the room is full"
      return;
    }

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
   * @return {SyncObject}
   */
  getSessionUserSyncObject() {
    return this._sessionUserSyncObject;
  }
}

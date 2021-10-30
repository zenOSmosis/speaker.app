import PhantomCore, { EVT_UPDATED, EVT_DESTROYED } from "phantom-core";
import WebRTCPeer from "webrtc-peer";
import SDPAdapter from "./utils/sdp-adapter";

import sleep from "../sleep";

import getUnixTime from "../time/getUnixTime";
import {
  getTrackMediaStream,
  // getListHasMediaStream,
  addMediaStreamToList,
  removeMediaStreamFromList,
  getMediaStreamListTracks,
} from "./utils/mediaStreamListUtils";

import {
  SYNC_EVT_PING,
  SYNC_EVT_PONG,
  SYNC_EVT_BYE,
  SYNC_EVT_KICK,
  SYNC_EVT_TRACK_REMOVED,
  SYNC_EVT_DEBUG,
} from "../syncEvents";

import HeartbeatModule from "./modules/ZenRTCPeer.HeartbeatModule";
import SyncObjectLinkerModule from "./modules/ZenRTCPeer.SyncObjectLinkerModule";
import DataChannelManagerModule from "./modules/ZenRTCPeer.DataChannelManagerModule";
import SyncEventDataChannelModule from "./modules/ZenRTCPeer.SyncEventDataChannelModule";

// ZenRTCPeer instances running on this thread, using socketIoId as reference
// keys
const _instances = {};

export { EVT_DESTROYED, EVT_UPDATED };
export const EVT_CONNECTING = "connecting";
export const EVT_RECONNECTING = "reconnecting";
export const EVT_CONNECTED = "connected";
export const EVT_DISCONNECTED = "disconnected";

// export const EVT_SIMPLE_PEER_INSTANTIATED = "simple-peer-instantiated";

// TODO: Document
//
// Is emit when there is an outgoing ZenRTC signal
export const EVT_ZENRTC_SIGNAL = "zenrtc-signal";

// TODO: Document
export const EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED =
  "outgoing-media-stream-track-added";
// TODO: Document
export const EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED =
  "outgoing-media-stream-track-removed";

// TODO: Document
export const EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED =
  "incoming-media-stream-track-added";
// TODO: Document
export const EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED =
  "incoming-media-stream-track-removed";

// Emits, with the received data, once data has been received
// TODO: Rename to EVT_DATA
export const EVT_DATA_RECEIVED = "data";

export const EVT_SDP_OFFERED = "sdp-offered";
export const EVT_SDP_ANSWERED = "sdp-answered";

// TODO: Document type {eventName, eventData}
// TODO: Rename to EVT_SYNC
export const EVT_SYNC_EVT_RECEIVED = "sync-event";

// Internal event for pinging (in conjunction w/ SYNC_EVT_PONG)
const EVT_PONG = "pong";

const ICE_SERVERS = (() => {
  throw new Error("TODO: Rework COTURN variables");

  const hostname =
    process.env.REACT_APP_COTURN_HOSTNAME || process.env.COTURN_HOSTNAME;

  const username =
    process.env.REACT_APP_COTURN_USERNAME || process.env.COTURN_USERNAME;
  const credential =
    process.env.REACT_APP_COTURN_PASSWORD || process.env.COTURN_PASSWORD;

  // TODO: Document type
  const iceServers = [
    {
      urls: [`turn:${hostname}:3478`, `stun:${hostname}:3478`],
      username,
      credential,
    },
  ];

  return iceServers;
})();

/**
 * TODO: Handle possible WebRTCPeer error codes:
 *
 * - ERR_WEBRTC_SUPPORT
 * - ERR_CREATE_OFFER
 * - ERR_CREATE_ANSWER
 * - ERR_SET_LOCAL_DESCRIPTION
 * - ERR_SET_REMOTE_DESCRIPTION
 * - ERR_ADD_ICE_CANDIDATE
 * - ERR_ICE_CONNECTION_FAILURE
 * - ERR_SIGNALING
 * - ERR_DATA_CHANNEL
 * - ERR_CONNECTION_FAILURE
 */

/**
 * The fundamental P2P / WebRTC peer connection, regardless if the other peer
 * is an SFU / MFU or a client device.
 *
 * TODO: Provide additional layer to separate WebRTCPeer directly from this
 * class so we can use it with other connection mechanisms.
 */
export default class ZenRTCPeer extends PhantomCore {
  /**
   * Retrieves whether or not WebRTC is supported.
   *
   * @return {boolean}
   */
  static getIsWebRTCSupported() {
    // @see https://github.com/feross/simple-peer#peerwebrtc_support
    return WebRTCPeer.WEBRTC_SUPPORT;
  }

  /**
   * TODO: Rename to getThreadInstances?
   *
   * Retrieves all ZenRTCPeer instances in this thread.
   *
   * @return {ZenRTCPeer[]}
   */
  static getInstances() {
    return Object.values(_instances);
  }

  /**
   * TODO: Rename to getOtherThreadInstances?
   *
   * Fetches ZenRTCPeer instances without the given peer, with the same CPU
   * thread.
   *
   * IMPORTANT: This does not handle multiplexed peers.
   *
   * @param {ZenRTCPeer} peer
   * @return {ZenRTCPeer[]}
   */
  static getOtherInstances(peer) {
    const peerSocketIoId = peer.getSocketIoId();

    const otherPeers = ZenRTCPeer.getInstances().filter(
      testPeer => testPeer.getSocketIoId() !== peerSocketIoId
    );

    return otherPeers;
  }

  /**
   * @param {string} socketIoId
   * @return {ZenRTCPeer}
   */
  static getInstanceWithSocketIoId(socketIoId) {
    return _instances[socketIoId];
  }

  /**
   * @param {string} socketIoId Used primarily for peer distinction // TODO: Rename
   * @param {boolean} isInitiator? [default=false] Whether or not this peer is
   * the origination peer in the connection signaling.
   * @param {boolean} shouldAutoReconnect? [default=true] Has no effect if is
   * not initiator.
   * @param {boolean} offerToReceiveAudio? [default=true]
   * @param {boolean} offerToReceiveVideo? [default=true]
   * @param {string} preferredAudioCodecs? [default=["opus"]]
   */
  constructor({
    socketIoId,
    isInitiator = false,
    shouldAutoReconnect = true, // Only if isInitiator
    offerToReceiveAudio = true,
    offerToReceiveVideo = true,
    writableSyncObject = null,
    readOnlySyncObject = null,
    preferredAudioCodecs = ["opus"],
  }) {
    if (!socketIoId) {
      throw new Error("No socketIoId present");
    }

    if (_instances[socketIoId]) {
      throw new Error(
        `Thread already contains ZenRTCPeer instance with socketIoId ${socketIoId}`
      );
    }

    super();

    // IMPORTANT: This may need to be changed accordingly in order to handle more peers
    // TODO: Move this to transcoder only
    this.setMaxListeners(100);

    this.preferredAudioCodecs = preferredAudioCodecs;

    _instances[socketIoId] = this;

    this.log.debug(
      `Constructing new ${
        this.constructor.name
      } with socketIoId "${socketIoId}" as "${
        isInitiator ? "initiator" : "guest"
      }"`
    );

    // Built-in support for stream multiplexing
    this._outgoingMediaStreams = []; // TODO: Use Set
    this._incomingMediaStreams = []; // TODO: Use Set

    this._socketIoId = socketIoId;
    this._isInitiator = isInitiator;
    this._shouldAutoReconnect = shouldAutoReconnect;

    this._offerToReceiveAudio = offerToReceiveAudio;
    this._offerToReceiveVideo = offerToReceiveVideo;

    this._capabilities = [];
    this._remoteCapabilities = [];

    this._isConnected = false;

    this._sdpOffer = null;
    this._sdpAnswer = null;

    this._connectionStartTime = 0;

    this._latency = 0;

    // Handle management of connectionStartTime
    (() => {
      this.on(EVT_CONNECTED, () => {
        // TODO: Remove
        this.log.debug(`${this.getClassName()} connected`);

        this._connectionStartTime = getUnixTime();
      });

      this.on(EVT_DISCONNECTED, () => {
        // TODO: Remove
        this.log.debug(`${this.getClassName()} disconnected`);

        this._connectionStartTime = 0;
      });
    })();

    /** @see https://github.com/feross/simple-peer */
    this._webrtcPeer = null;

    // TODO: This is just an experiment with sending available CPU cores across the wire
    // Either make addCapability accept an optional value, or handle this differently
    //
    // TODO: Refactor this so that the PhantomServer virtual peer can use it
    (() => {
      const hwConcurrency = navigator.hardwareConcurrency;

      if (hwConcurrency) {
        this.addCapability(`CORE-${hwConcurrency}`);
      }
    })();

    // Init modules
    (() => {
      this._heartbeatModule = new HeartbeatModule(this);

      this._syncObjectLinkerModule = new SyncObjectLinkerModule(
        this,
        writableSyncObject,
        readOnlySyncObject
      );

      this._dataChannelManagerModule = new DataChannelManagerModule(this);

      this._syncEventDataChannelModule = new SyncEventDataChannelModule(this);
    })();

    this._reconnectArgs = [];
  }

  /**
   * @param {string} dataChannelName
   * @return {DataChannel}
   */
  createDataChannel(dataChannelName) {
    return this._dataChannelManagerModule.getOrCreateDataChannel(
      dataChannelName
    );
  }

  /**
   * @param {string} sdp
   * @return {string}
   */
  _handleSdpOfferTransform(sdp) {
    if (sdp) {
      sdp = SDPAdapter.setPreferredAudioCodecs(sdp, this._preferredAudioCodecs);
    }

    return sdp;
  }

  /**
   * The current SDP offer.
   *
   * @return {string}
   */
  getSdpOffer() {
    return this._sdpOffer;
  }

  /**
   * @param {string} sdp
   * @return {string}
   */
  _handleSdpAnswerTransform(sdp) {
    if (sdp) {
      sdp = SDPAdapter.setPreferredAudioCodecs(sdp, this._preferredAudioCodecs);
    }

    return sdp;
  }

  /**
   * The current SDP answer.
   *
   * @return {string}
   */
  getSdpAnswer() {
    return this._sdpAnswer;
  }

  /**
   * @return {SyncObject}
   */
  getReadOnlySyncObject() {
    return this._syncObjectLinkerModule.getReadOnlySyncObject();
  }

  /**
   * @return {SyncObject}
   */
  getWritableSyncObject() {
    return this._syncObjectLinkerModule.getWritableSyncObject();
  }

  /**
   * Send kick signal to other peer.
   *
   * It is up to the other peer to decide what to do w/ the signal, though we
   * can destroy the connection and anything we know of the other peer here.
   */
  async kick() {
    this.emitSyncEvent(SYNC_EVT_KICK);

    // Pause for message to be delivered
    await new Promise(resolve => setTimeout(resolve, 100));

    this.destroy();
  }

  /**
   * @return {ZenRTCPeer[]}
   */
  getOtherThreadInstances() {
    return ZenRTCPeer.getOtherInstances(this);
  }

  /**=
   * @param {number} timeout? [optional; default = 10000] The number of
   * milliseconds to allow the ping request to continue before giving up.
   * @return {Promise<number>} A float value representing the latency, in
   * milliseconds.
   */
  ping(timeout = 10000) {
    return new Promise((resolve, reject) => {
      const prev = window.performance.now();

      this.emitSyncEvent(SYNC_EVT_PING);

      const timeoutReject = setTimeout(reject, timeout);

      this.once(EVT_PONG, () => {
        const latency = window.performance.now() - prev;

        clearTimeout(timeoutReject);

        this._latency = latency;

        resolve(latency);

        this.emit(EVT_UPDATED);
      });
    });
  }

  /**
   * @return {number} Retrieves the cached latency observed from the last ping
   * call.
   */
  getLatency() {
    return this._latency;
  }

  /**
   * @return {boolean} Whether or not this peer is the WebRTC initiator.
   */
  getIsInitiator() {
    return this._isInitiator;
  }

  /**
   * Resolves once connected.
   *
   * Note: This was intentionally different than the onceReady() base class
   * method because, potentially, the class instance could be used for that
   * purpose as well.
   *
   * @return {Promise<void>}
   */
  async onceConnected() {
    if (this._isConnected) {
      return;
    } else {
      await new Promise(resolve => this.once(EVT_CONNECTED, resolve));
    }
  }

  /**
   * Sets whether or not this peer wishes to receive audio.
   *
   * @param {boolean} offerToReceiveAudio
   */
  setOfferToReceiveAudio(offerToReceiveAudio) {
    this._offerToReceiveAudio = offerToReceiveAudio;
  }

  /**
   * Sets whether or not this peer wishes to receive video.
   *
   * @param {boolean} offerToReceiveVideo
   */
  setOfferToReceiveVideo(offerToReceiveVideo) {
    this._offerToReceiveVideo = offerToReceiveVideo;
  }

  // TODO: Document
  // TODO: Remove?
  getCapabilities() {
    return this._capabilities;
  }

  // TODO: Document
  // TODO: Remove?
  getRemoteCapabilities() {
    return this._remoteCapabilities;
  }

  /**
   * IMPORTANT: This currently will only send capabilities on the next WebRTC signal.
   *
   * TODO: Remove?
   *
   * @param {string} capability
   */
  addCapability(name) {
    if (!this._capabilities.includes(name)) {
      this._capabilities.push(name);
    }
  }

  // TODO: Document
  // TODO: Remove?
  _addRemoteCapability(name) {
    if (!this._remoteCapabilities.includes(name)) {
      this._remoteCapabilities.push(name);
    }
  }

  /**
   * Utilized for peer identification and should match the Socket.io id
   * provided in the signaling (ipcMessageBroker).
   *
   * TODO: Rename to getSignalingId?
   *
   * @return {string}
   */
  getSocketIoId() {
    return this._socketIoId;
  }

  /**
   * TODO: Make private; or auto-(re)connect?
   *
   * @param {MediaStream} outgoingMediaStream?
   * @return {Promise<void>}
   */
  async connect(outgoingMediaStream = new MediaStream()) {
    this._reconnectArgs = [outgoingMediaStream];

    if (this._isDestroyed) {
      // FIXME: This should probably throw, however on Firefox if clicking
      // connect button multiple times while mic prompt is active, it will
      // trigger this
      this.log.warn(
        `Cannot start a new ${this.getClassName()} connection after the class instance has been destroyed`
      );
      return;
    }

    if (this._webrtcPeer) {
      this.log.warn(
        `${this.getClassName()} is already connected or connecting`
      );
      return;
    } else {
      this._webrtcPeer = null;

      this.emit(EVT_CONNECTING);

      // Fix issue where reconnecting streams causes tracks to build up
      this._outgoingMediaStreams = [];
      this._incomingMediaStreams = [];

      if (outgoingMediaStream) {
        // Sync WebRTCPeer outgoing tracks to class outgoing tracks, once
        // connected
        this.once(EVT_CONNECTED, async () => {
          const mediaStreamTracks = outgoingMediaStream.getTracks();

          for (const mediaStreamTrack of mediaStreamTracks) {
            this.addOutgoingMediaStreamTrack(
              mediaStreamTrack,
              outgoingMediaStream
            );
          }
        });
      }

      const simplePeerOptions = {
        initiator: this._isInitiator,

        // Set to false to disable trickle ICE and get a single 'signal' event (slower)
        trickle: true,

        // @see https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration/iceTransportPolicy#value
        // iceTransportPolicy: "relay",

        stream: new MediaStream(),

        /**
         * TODO: offerOptions voiceActivityDetection false (better music quality).
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
         * @see https://github.com/feross/simple-peer#peerdestroyerr
         */
        offerOptions: {
          offerToReceiveAudio: this._offerToReceiveAudio,
          offerToReceiveVideo: this._offerToReceiveVideo,

          /** Offer better music quality if false */
          voiceActivityDetection: false,
        },

        config: {
          iceServers: ICE_SERVERS,
        },

        sdpTransform: sdp => {
          // Offer, to other peer
          sdp = this._handleSdpOfferTransform(sdp);

          // TODO: Remove
          /*
          this.log.debug({
            offer: sdpTransform.parse(sdp),
            socketIoId: this.getSocketIoId(),
          });
          */

          this._sdpOffer = sdp;
          this.emit(EVT_SDP_OFFERED, sdp);

          return sdp;
        },

        objectMode: true,
      };

      this.log.debug(
        `${this.getClassName()} is instantiating as ${
          this._isInitiator ? "initiator" : "guest"
        }`
      );

      /** @see https://github.com/feross/simple-peer */
      this._webrtcPeer = new WebRTCPeer(simplePeerOptions);

      // TODO: Build out
      // TODO: Send up ipcMessageBroker
      /** @see https://github.com/feross/simple-peer#error-codes */
      this._webrtcPeer.on("error", async err => {
        // TODO: Debug error and determine if we need to try to reconnect
        this.log.warn("Caught WebRTCPeer error", err);

        /*
        if (this._isInitiator && this._shouldAutoReconnect) {
          this._reconnect();
        }
        */
      });

      // Handle outgoing WebRTC signaling
      this._webrtcPeer.on("signal", data => this.sendZenRTCSignal(data));

      // Handle WebRTC connect
      this._webrtcPeer.on("connect", () => {
        this._isConnected = true;
        this._connectTime = getUnixTime();

        this.emit(EVT_CONNECTED);
      });

      // Handle WebRTC disconnect
      this._webrtcPeer.on("close", async () => {
        this._isConnected = false;
        this.emit(EVT_DISCONNECTED);

        // Provide automated re-connect mechanism, if this is the initiator and
        // we've closed before we expected
        if (this._isInitiator && this._shouldAutoReconnect) {
          return this._reconnect();
        }

        this.log.debug("webrtc-peer disconnected");

        this.destroy();
      });

      // TODO: Remove; For automated reconnection testing
      // setTimeout(() => this._webrtcPeer && this._webrtcPeer.destroy(), 5000);

      // Handle incoming MediaStreamTrack from remote peer
      this._webrtcPeer.on("track", (mediaStreamTrack, mediaStream) => {
        // NOTE (jh): This timeout seems to improve an issue w/ iOS 14
        // sometimes disconnecting when tracks are added
        // TODO: Replace w/ setImmediate
        // @see https://github.com/zenOSmosis/phantom-core/issues/76
        setTimeout(() => {
          this._addIncomingMediaStreamTrack(mediaStreamTrack, mediaStream);
        }, 500);
      });

      this._webrtcPeer.on("data", data => {
        this.emit(EVT_DATA_RECEIVED, data);
      });

      // this.emit(EVT_SIMPLE_PEER_INSTANTIATED);
    }
  }

  /**
   * Utilized with connect for auto-reconnect handling.
   *
   * TODO: Clean up
   *
   * @return {Promise<void>}
   */
  async _reconnect() {
    // Sleep for a second before trying to reconnect
    await sleep(1000);

    // NOTE (jh): It is intentional that this check comes after the previous
    // sleep promise
    if (!this._isDestroyed) {
      this._webrtcPeer = null;

      this.log.debug("Trying to reconnect");

      const ret = this.connect(...this._reconnectArgs);

      this.emit(EVT_RECONNECTING);

      return ret;
    }
  }

  /**
   * @return {boolean}
   */
  getIsConnected() {
    return this._isConnected;
  }

  /**
   * Called internally when a WebRTC signal is to be emit to the other peer.
   *
   * @param {Object} data // TODO: Document; connected directly to WebRTCPeer on.signal
   */
  async sendZenRTCSignal(data) {
    this.emit(EVT_ZENRTC_SIGNAL, {
      signal: data,

      // TODO: Don't send capabilities which have already been sent (in order
      // to save some bandwidth)
      // TODO: Ensure that the other side has actually received all sent
      // capabilities
      capabilities: this._capabilities,
    });
  }

  /**
   * @param {Object} params TODO: Document
   */
  async receiveZenRTCSignal({
    signal,
    capabilities,
    // offerConstraints,
  }) {
    if (this._webrtcPeer) {
      for (const name of capabilities) {
        this._addRemoteCapability(name);
      }

      signal.sdp = this._handleSdpAnswerTransform(signal.sdp);

      try {
        this._webrtcPeer.signal(signal);
      } catch (err) {
        this.log.warn("Caught", err);
      }

      this._sdpAnswer = signal.sdp;
      this.emit(EVT_SDP_ANSWERED, signal.sdp);
    } else {
      throw new Error(
        `No WebRTCPeer in ${this.constructor.name} with socketIoId "${this._socketIoId}"`
      );
    }
  }

  /**
   * NOTE: getIncomingMediaStreamTracks() is more accurate.
   *
   * @return {MediaStream[]}
   */
  getIncomingMediaStreams() {
    return this._incomingMediaStreams;
  }

  /**
   * @return {MediaStreamTrack[]}
   */
  getIncomingMediaStreamTracks() {
    return getMediaStreamListTracks(this._incomingMediaStreams);
  }

  /**
   * Internally registers incoming MediaStreamTrack and associates it with the
   * given MediaStream.
   *
   * @param {MediaStreamTrack} mediaStreamTrack
   * @param {MediaStream} mediaStream
   */
  _addIncomingMediaStreamTrack(mediaStreamTrack, mediaStream) {
    // TODO: Verify mediaStream doesn't have more than one of the given track type, already (if it does, replace it?)

    // If MediaStream is not already added to list of incoming media streams, add it
    this._incomingMediaStreams = addMediaStreamToList(
      mediaStream,
      this._incomingMediaStreams
    );

    // WebRTCPeer should have already added this to the stream
    // mediaStream.addTrack(mediaStreamTrack);

    this.emit(EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED, {
      mediaStreamTrack,
      mediaStream,
    });

    this.emit(EVT_UPDATED);
  }

  /**
   * Internally de-registers incoming MediaStreamTrack and disassociates it
   * from the given MediaStream.
   *
   * @param {MediaStreamTrack} mediaStreamTrack
   * @param {MediaStream} mediaStream
   */
  _removeIncomingMediaStreamTrack(mediaStreamTrack, mediaStream) {
    // Since WebRTCPeer does not have a track-removed event, this is part of
    // the workaround process, and we have to remove the track on our own
    mediaStream.removeTrack(mediaStreamTrack);

    this.emit(EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED, {
      mediaStreamTrack,
      mediaStream,
    });

    this.emit(EVT_UPDATED);
  }

  /**
   * NOTE: this.getOutgoingMediaStreamTracks is more accurate and should likely
   * be used instead.
   *
   * TODO: Remove?
   *
   * @return {MediaStream[]}
   */
  getOutgoingMediaStreams() {
    return this._outgoingMediaStreams;
  }

  /**
   * @return {MediaStreamTrack[]}
   */
  getOutgoingMediaStreamTracks() {
    return getMediaStreamListTracks(this._outgoingMediaStreams);
  }

  /**
   * i.e. publish
   *
   * TODO: Don't add track if peer is not accepting track of type
   *
   * @param {MediaStreamTrack} mediaStreamTrack
   * @param {MediaStream} mediaStream
   * @return {void}
   */
  async addOutgoingMediaStreamTrack(mediaStreamTrack, mediaStream) {
    // TODO: Verify mediaStream doesn't have more than one of the given track type, already (if it does, replace it?)

    if (!this._webrtcPeer) {
      this.log.warn("WebRTCPeer is not open");
      return;
    }

    try {
      // TODO: Should the mediaStream.addTrack and addMediaStreamToList calls
      // happen after this._webrtcPeer.addTrack happens, instead?  The peer
      // will raise an error when trying to add a duplicate track to a stream,
      // in which case that error could make the other states out of sync

      // Add track to local representation of stream
      mediaStream.addTrack(mediaStreamTrack);

      // Add stream to outgoing list of streams
      this._outgoingMediaStreams = addMediaStreamToList(
        mediaStream,
        this._outgoingMediaStreams
      );

      this._webrtcPeer.addTrack(mediaStreamTrack, mediaStream);

      // FIXME: Firefox 86 doesn't listen to "ended" event, and the
      // functionality has to be monkeypatched into the onended handler. Note
      // that this still works in conjunction with
      // track.dispatchEvent(new Event("ended")).
      const oEnded = mediaStreamTrack.onended;
      mediaStreamTrack.onended = (...args) => {
        if (typeof oEnded === "function") {
          oEnded(...args);
        }

        this.log.debug(
          "Automatically removing ended media stream track",
          mediaStreamTrack
        );

        this.removeOutgoingMediaStreamTrack(mediaStreamTrack, mediaStream);
      };

      this.emit(EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED, {
        mediaStreamTrack,
        mediaStream,
      });

      this.emit(EVT_UPDATED);
    } catch (err) {
      this.log.warn("Caught error in addOutgoingMediaStreamTrack", err);
    }
  }

  /**
   * i.e. unpublish
   *
   * @param {MediaStreamTrack} mediaStreamTrack
   * @param {MediaStream} mediaStream
   * @return {Promise<void>}
   */
  async removeOutgoingMediaStreamTrack(mediaStreamTrack, mediaStream) {
    if (!this._webrtcPeer) {
      this.log.warn("WebRTCPeer is not open");
      return;
    }

    try {
      // Unpublish track
      await this._webrtcPeer.removeTrack(mediaStreamTrack, mediaStream);
    } catch (err) {
      this.log.warn("Caught", err);
    }

    // Remove local representation of stream
    mediaStream.removeTrack(mediaStreamTrack);

    this._outgoingMediaStreams = removeMediaStreamFromList(
      mediaStream,
      this._outgoingMediaStreams
    );

    this.emit(EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED, {
      mediaStreamTrack,
      mediaStream,
    });

    this.emit(EVT_UPDATED);

    // Signal to remote that we've removed the track
    //
    // NOTE (jh): This is a workaround since WebRTCPeer does not emit track
    // removed events directly
    this.emitSyncEvent(SYNC_EVT_TRACK_REMOVED, {
      msid: mediaStream.id,
      kind: mediaStreamTrack.kind,
    });
  }

  /**
   * Performs a reverse-lookup of MediaStream from given MediaStreamTrack.
   *
   * Note, if the same MediaStreamTrack were to be encased in more than one
   * MediaStream, only the first MediaStream will be returned.
   *
   * @param {MediaStreamTrack} mediaStreamTrack
   * @return {MediaStream}
   */
  getTrackMediaStream(mediaStreamTrack) {
    return getTrackMediaStream(mediaStreamTrack, [
      ...this._outgoingMediaStreams,
      ...this._incomingMediaStreams,
    ]);
  }

  // TODO: Document
  //
  // Helper / Convenience method
  //
  // TODO: Enable support to remotely publish/unpublish tracks based on what's
  // added to / removed from this stream
  async publishMediaStream(mediaStream) {
    const tracks = mediaStream.getTracks();

    for (const track of tracks) {
      this.addOutgoingMediaStreamTrack(track, mediaStream);
    }
  }

  /**
   * Helper / Convenience method
   *
   * @return {MediaStream}
   */
  getPublishedMediaStreams() {
    return this.getOutgoingMediaStreams();
  }

  // TODO: Document
  //
  // Helper / Convenience method
  async unpublishMediaStream(mediaStream) {
    const tracks = mediaStream.getTracks();

    for (const track of tracks) {
      this.removeOutgoingMediaStreamTrack(track, mediaStream);
    }
  }

  /**
   * Sends data over the WebRTC data channel.
   *
   * Note, this uses UDP and the transmission is not guaranteed.
   *
   * @param {any} data
   * @return {boolean} Whether or not the call to send the data succeeded (does
   * not indicate successful receipt of data on other peer).
   */
  async send(data) {
    if (this._isDestroyed) {
      return false;
    }

    // Await connection before trying to send data (buffer until connect)
    await this.onceConnected();

    if (
      this._isConnected &&
      this._webrtcPeer &&
      // Simple-peer utilizes a single data channel
      //
      // Also
      // @see https://github.com/feross/simple-peer/issues/480
      // InvalidStateError: RTCDataChannel.readyState is not 'open'
      this._webrtcPeer._channel &&
      this._webrtcPeer._channel.readyState === "open"
    ) {
      // Serialize objects for transport
      if (typeof data === "object") {
        data = JSON.stringify(data);
      }

      try {
        this._webrtcPeer.send(data);

        return true;
      } catch (err) {
        this.log.warn("Caught", err);
      }
    } else {
      this.log.warn(
        "Data channel is not open.  Retrying data send after open."
      );

      // Allow a grace period before trying to retry data send
      await sleep(2000);

      // Retry data send
      this.send(data);
    }

    return false;
  }

  /**
   * Sends sync event data to other peer.
   *
   * NOTE: Sync event constants are defined in shared/syncEvents.js.
   *
   * @param {string} eventName
   * @param {any} eventData? [default = null]
   */
  emitSyncEvent(eventName, eventData = null) {
    this._syncEventDataChannelModule.emitSyncEvent(eventName, eventData);
  }

  /**
   * Receives sync event from other peer.
   *
   * This is internally called via the SyncEventDataChannelModule.
   *
   * @param {string} eventName
   * @param {any} eventData
   */
  receiveSyncEvent(eventName, eventData) {
    switch (eventName) {
      case SYNC_EVT_PING:
        // Emit to other peer we have a ping
        this.emitSyncEvent(SYNC_EVT_PONG);
        break;

      case SYNC_EVT_PONG:
        // Emit to internal ping() handler we have a pong from other peer
        this.emit(EVT_PONG);
        break;

      case SYNC_EVT_BYE:
        this.destroy();
        break;

      // Internal event to zenRTCPeer
      case SYNC_EVT_TRACK_REMOVED:
        (() => {
          // TODO: Remove "tracksOfKind" and remove all tracks with this media stream

          // msid = media stream id
          // kind = "audio" | "video"
          const { msid, kind } = eventData;

          const mediaStream = this.getIncomingMediaStreams().find(
            ({ id }) => id === msid
          );

          if (!mediaStream) {
            this.log.warn(
              `Could not locate incoming MediaStream with id "${msid}"`
            );
          } else {
            const tracksOfKind =
              kind === "audio"
                ? mediaStream.getAudioTracks()
                : mediaStream.getVideoTracks();

            if (tracksOfKind.length) {
              this._removeIncomingMediaStreamTrack(
                tracksOfKind[0],
                mediaStream
              );
            }
          }
        })();
        break;

      case SYNC_EVT_DEBUG:
        // TODO: Change implementation, however necessary
        this.log.debug(
          JSON.stringify({
            SYNC_EVT_DEBUG: {
              eventName,
              eventData,
            },
          })
        );
        break;

      default:
        // Route up any unhandled sync events
        this.emit(EVT_SYNC_EVT_RECEIVED, {
          eventName,
          eventData,
        });
        break;
    }
  }

  /**
   * @return {Promise<void>}
   */
  async disconnect() {
    return this.destroy();
  }

  /**
   * Retrieves number of seconds since the WebRTC connection was made.
   *
   * @return {number}
   **/
  getConnectionUptime() {
    if (!this._isConnected) {
      return 0;
    } else {
      const now = getUnixTime();

      return now - this._connectionStartTime;
    }
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    // IMPORTANT: This should be set before any event emitters are emitted, so
    // that counts are updated properly
    delete _instances[this._socketIoId];

    // Disconnect handler
    await (async () => {
      if (this._isDestroyed) {
        return;
      }

      if (this._webrtcPeer) {
        this.emitSyncEvent(SYNC_EVT_BYE);

        // Give message some time to get delivered
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check again because the peer may have been destroyed during the async period
        if (this._webrtcPeer) {
          /** @see https://github.com/feross/simple-peer#peerdestroyerr */
          this._webrtcPeer.destroy();

          this._webrtcPeer = null;
        }
      }

      // NOTE: Because of previous await, this is utilized
      if (this._isDestroyed) {
        return;
      }

      // Remove incoming media stream tracks
      const incomingMediaStreamTracks = this.getIncomingMediaStreamTracks();

      if (incomingMediaStreamTracks) {
        for (const mediaStreamTrack of incomingMediaStreamTracks) {
          this.emit(EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED, {
            mediaStreamTrack,
            mediaStream: getTrackMediaStream(
              mediaStreamTrack,
              this._incomingMediaStreams
            ),
          });
        }
      }

      // Remove outgoing media stream tracks
      const outgoingMediaStreamTracks = this.getOutgoingMediaStreamTracks();

      if (outgoingMediaStreamTracks) {
        for (const mediaStreamTrack of outgoingMediaStreamTracks) {
          this.emit(EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED, {
            mediaStreamTrack,
            mediaStream: getTrackMediaStream(
              mediaStreamTrack,
              this._outgoingMediaStreams
            ),
          });
        }
      }

      if (this._isConnected) {
        this.emit(EVT_DISCONNECTED);

        this._isConnected = false;
      }
    })();

    await super.destroy();
  }
}

import PhantomCore from "../shared/phantom-core";
import ChromeZenRTCPeer, {
  EVT_CONNECTED,
  EVT_DISCONNECTED,
  EVT_DESTROYED,
  EVT_DATA_RECEIVED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED,
  EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
  EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
  EVT_SYNC_EVT_RECEIVED,
} from "../ChromeZenRTCPeer";
import { v4 as uuidv4 } from "uuid";

// IMPORTANT: Contains monitors, not peers
const _monitorInstances = {};

// Emits, with the ChromeZenRTCPeer, once the peer has connected
export const EVT_PEER_CONNECTED = "peer-connected";

// Emits, with the ChromeZenRTCPeer, once the peer has disconnected
export const EVT_PEER_DISCONNECTED = "peer-disconnected";

export const EVT_PEER_DATA_RECEIVED = "peer-data-received";

// TODO: Rename all "EVT_PEER_MONITOR..." to "EVT_PEER"

// TODO: Document event type
export const EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_ADDED = `peer-monitor-${EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED}`;
export const EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_REMOVED = `peer-monitor-${EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED}`;

export const EVT_PEER_MONITOR_OUTGOING_MEDIA_STREAM_TRACK_ADDED = `peer-monitor-${EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED}`;
export const EVT_PEER_MONITOR_OUTGOING_MEDIA_STREAM_TRACK_REMOVED = `peer-monitor-${EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED}`;

export const EVT_PEER_MONITOR_SYNC_EVT_RECEIVED = `peer-monitor-${EVT_SYNC_EVT_RECEIVED}`;

/**
 * Monitors instances of ChromeZenRTCPeers, which can be easily extended for
 * multi-peer session management.
 *
 * See the ChromePhantomSession which extends this with track routing between
 * peers.
 */
export default class ChromeZenRTCPeerMonitor extends PhantomCore {
  /**
   * Registers peer instance with all monitors.
   *
   * @param {ChromeZenRTCPeer} peer
   */
  static registerChromeZenRTCPeerInstance(peer) {
    if (!(peer instanceof ChromeZenRTCPeer)) {
      throw new Error("peer is not a ChromeZenRTCPeer instance");
    }

    // Iterate through each monitor, adding the peer to the monitor, as well as
    // any proxy events to pass through to the monitor
    Object.values(_monitorInstances).forEach(monitor => monitor.addPeer(peer));
  }

  constructor() {
    super();

    // IMPORTANT: This may need to be changed accordingly in order to handle more peers
    this.setMaxListeners(100);

    this._uuid = uuidv4();

    _monitorInstances[this._uuid] = this;

    // Sync current peers
    (() => {
      const existingPeers = this.getPeers();

      for (const peer of existingPeers) {
        this.addPeer(peer);
      }
    })();
  }

  /**
   * @return {ChromeZenRTCPeer[]}
   */
  getPeers() {
    return ChromeZenRTCPeer.getInstances();
  }

  /**
   * Retrieves other peer instances besides the one specified.
   *
   * @param {ChromeZenRTCPeer[]} peer
   */
  getOtherPeers(peer) {
    if (!(peer instanceof ChromeZenRTCPeer)) {
      // TODO: Remove
      console.warn({ peer });

      throw new Error("peer must be a ChromeZenRTCPeer");
    }

    return ChromeZenRTCPeer.getOtherInstances(peer);
  }

  /**
   * @param {string} socketIoId
   * @return {ChromeZenRTCPeer | undefined}
   */
  getPeerWithSocketIoId(socketIoId) {
    return ChromeZenRTCPeer.getInstanceWithSocketIoId(socketIoId);
  }

  // TODO: Document
  addPeer(peer) {
    const _handleConnectionCleanup = (() => {
      const _handlePeerConnect = () => {
        this.emit(EVT_PEER_CONNECTED, peer);
      };

      peer.on(EVT_CONNECTED, _handlePeerConnect);

      const _handlePeerDisconnect = () => {
        this.emit(EVT_PEER_DISCONNECTED, peer);
      };

      peer.on(EVT_DISCONNECTED, _handlePeerDisconnect);

      const _handleReceiveSyncEvent = evtData => {
        this.emit(EVT_PEER_MONITOR_SYNC_EVT_RECEIVED, [peer, evtData]);
      };

      peer.on(EVT_SYNC_EVT_RECEIVED, _handleReceiveSyncEvent);

      return () => {
        peer.off(EVT_CONNECTED, _handlePeerConnect);
        peer.off(EVT_DISCONNECTED, _handlePeerDisconnect);

        peer.off(EVT_SYNC_EVT_RECEIVED, _handleReceiveSyncEvent);
      };
    })();

    const _handleIncomingCleanup = (() => {
      const _handleAddIncomingMediaStreamTrack = evtData => {
        this.peerDidAddIncomingMediaStreamTrack(peer, evtData);
      };
      peer.on(
        EVT_INCOMING_MEDIA_STREAM_TRACK_ADDED,
        _handleAddIncomingMediaStreamTrack
      );

      const _handleRemoveIncomingMediaStreamTrack = evtData => {
        this.peerDidRemoveIncomingMediaStreamTrack(peer, evtData);
      };
      peer.on(
        EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
        _handleRemoveIncomingMediaStreamTrack
      );

      return () => {
        peer.off(
          EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
          _handleRemoveIncomingMediaStreamTrack
        );
        peer.off(
          EVT_INCOMING_MEDIA_STREAM_TRACK_REMOVED,
          _handleRemoveIncomingMediaStreamTrack
        );
      };
    })();

    const _handleOutgoingCleanup = (() => {
      const _handleAddOutgoingMediaStreamTrack = evtData => {
        this.peerDidAddOutgoingMediaStreamTrack(peer, evtData);
      };
      peer.on(
        EVT_OUTGOING_MEDIA_STREAM_TRACK_ADDED,
        _handleAddOutgoingMediaStreamTrack
      );

      const _handleRemoveOutgoingMediaStreamTrack = evtData => {
        this.peerDidRemoveOutgoingMediaStreamTrack(peer, evtData);
      };
      peer.on(
        EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
        _handleRemoveOutgoingMediaStreamTrack
      );

      return () => {
        peer.off(
          EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
          _handleAddOutgoingMediaStreamTrack
        );
        peer.off(
          EVT_OUTGOING_MEDIA_STREAM_TRACK_REMOVED,
          _handleRemoveOutgoingMediaStreamTrack
        );
      };
    })();

    const _handleDataCleanup = (() => {
      const _handleReceivedData = data => {
        this.emit(EVT_PEER_DATA_RECEIVED, [peer, data]);
      };

      peer.on(EVT_DATA_RECEIVED, _handleReceivedData);

      return () => {
        peer.off(EVT_DATA_RECEIVED, _handleReceivedData);
      };
    })();

    // Called when monitor is destroyed before peer
    const _handleMonitorCleanup = () => {
      _handleConnectionCleanup();
      _handleIncomingCleanup();
      _handleOutgoingCleanup();
      _handleDataCleanup();
    };

    // Handle cleanup, if monitor is destroyed before peer
    this.on(EVT_DESTROYED, _handleMonitorCleanup);

    // Handle destroyed event unbinding, if peer is destroyed before monitor
    // (fixes event emitter memory leak)
    peer.once(EVT_DESTROYED, () => {
      this.off(EVT_DESTROYED, _handleMonitorCleanup);
    });
  }

  /**
   * Called when peer's remote client adds a MediaStreamTrack.
   *
   * @param {ChromeZenRTCPeer} peer
   * @param {Object} evtData
   */
  peerDidAddIncomingMediaStreamTrack(peer, evtData) {
    this.emit(EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_ADDED, [
      peer,
      evtData,
    ]);
  }

  /**
   * Called when peer's remote client removes a MediaStreamTrack.
   *
   * @param {ChromeZenRTCPeer} peer
   * @param {Object} evtData
   */
  peerDidRemoveIncomingMediaStreamTrack(peer, evtData) {
    this.emit(EVT_PEER_MONITOR_INCOMING_MEDIA_STREAM_TRACK_REMOVED, [
      peer,
      evtData,
    ]);
  }

  /**
   * Called when peer adds an outgoing MediaStreamTrack for its remote client.
   *
   * @param {ChromeZenRTCPeer} peer
   * @param {Object} evtData
   */
  peerDidAddOutgoingMediaStreamTrack(peer, evtData) {
    this.emit(EVT_PEER_MONITOR_OUTGOING_MEDIA_STREAM_TRACK_ADDED, [
      peer,
      evtData,
    ]);
  }

  /**
   * Called when peer removes an outgoing MediaStreamTrack for its remote
   * client.
   *
   * @param {ChromeZenRTCPeer} peer
   * @param {Object} evtData
   */
  peerDidRemoveOutgoingMediaStreamTrack(peer, evtData) {
    this.emit(EVT_PEER_MONITOR_OUTGOING_MEDIA_STREAM_TRACK_REMOVED, [
      peer,
      evtData,
    ]);
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    delete _monitorInstances[this._uuid];

    super.destroy();
  }
}

ChromeZenRTCPeer.setMonitor(ChromeZenRTCPeerMonitor);

import BaseModule, { EVT_DESTROYED } from "./ZenRTCPeer.BaseModule";
import { EVT_DATA_RECEIVED } from "./ZenRTCPeer.DataChannelManagerModule";

// For synced events over WebRTC data channel
const SYNC_EVENTS_DATA_CHANNEL_NAME = "sync-events";

/**
 * Sync events are intended for simple, RPC-like calls.
 *
 * Constants for sync events are located in shared/syncEvents.js.
 */
export default class SyncEventDataChannelModule extends BaseModule {
  constructor(zenRTCPeer) {
    super(zenRTCPeer);

    this._dataChannel = zenRTCPeer.createDataChannel(
      SYNC_EVENTS_DATA_CHANNEL_NAME
    );

    this._dataChannel.on(EVT_DATA_RECEIVED, (data) => {
      const [eventName, eventData] = data;

      this.receiveSyncEvent(eventName, eventData);
    });

    this.once(EVT_DESTROYED, () => {
      this._dataChannel.destroy();
    });
  }

  /**
   * Send sync event to other peer.
   *
   * @param {string} eventName
   * @param {any} eventData
   */
  emitSyncEvent(eventName, eventData) {
    this._dataChannel.send([eventName, eventData]);
  }

  /**
   * Handles receiving of sync event from other peer.
   *
   * @param {string} eventName
   * @param {any} eventData? [default=null]
   */
  receiveSyncEvent(eventName, eventData = null) {
    this._zenRTCPeer.receiveSyncEvent(eventName, eventData);
  }
}

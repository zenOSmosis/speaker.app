import BaseModule from "./ZenRTCPeer.BaseModule";
import {
  EVT_CONNECTED,
  EVT_SYNC_EVT_RECEIVED,
  EVT_DESTROYED,
} from "../ZenRTCPeer";
import {
  SYNC_EVT_SYNC_OBJECT_PARTIAL_SYNC,
  SYNC_EVT_SYNC_OBJECT_FULL_SYNC,
  SYNC_EVT_SYNC_OBJECT_UPDATE_HASH,
} from "../../syncEvents";
import SyncObject, {
  BidirectionalSyncObject,
  EVT_WRITABLE_PARTIAL_SYNC,
  EVT_WRITABLE_FULL_SYNC,
  EVT_READ_ONLY_SYNC_UPDATE_HASH,
} from "sync-object";

/**
 * Provides P2P access for SyncObject modules, using one SyncObject to
 * represent outgoing (writable) state, and another SyncObject to represent
 * readable (incoming) state.
 */
export default class ZenRTCPeerSyncObjectLinkerModule extends BaseModule {
  /**
   * NOTE: For the two, optional SyncObjects, if the respective SyncObject is
   * not passed, a temporary one is created for the duration of this peer's
   * lifecycle.
   *
   * Otherwise, SyncObjects passed into the constructor will retain their own
   * lifecycle after this instance is destroyed and can be shared across
   * connections.
   *
   * @param {ZenRTCPeer} zenRTCPeer
   * @param {SyncObject} writableSyncObject? [optional; default = null]
   * Represents "our" state.
   * @param {SyncObject} readOnlySyncObject? [optional; default = null]
   * Represents "their" state.
   */
  constructor(
    zenRTCPeer,
    writableSyncObject = null,
    readOnlySyncObject = null
  ) {
    super(zenRTCPeer);

    // TODO: Remove
    // this.setLogLevel("debug");

    this._bidirectionalSyncObject = new BidirectionalSyncObject(
      writableSyncObject,
      readOnlySyncObject
    );

    // Perform full sync once connected
    zenRTCPeer.on(EVT_CONNECTED, () => {
      this._bidirectionalSyncObject.forceFullSync("Initial full sync");
    });

    // Handle outgoing data (our writable to their readOnly)
    (() => {
      this._bidirectionalSyncObject.on(EVT_WRITABLE_PARTIAL_SYNC, state => {
        this.log.debug({
          EVT_WRITABLE_PARTIAL_SYNC: state,
        });

        this._zenRTCPeer.emitSyncEvent(
          SYNC_EVT_SYNC_OBJECT_PARTIAL_SYNC,
          state
        );
      });

      this._bidirectionalSyncObject.on(EVT_WRITABLE_FULL_SYNC, state => {
        this.log.debug({
          EVT_WRITABLE_FULL_SYNC: state,
        });

        this._zenRTCPeer.emitSyncEvent(SYNC_EVT_SYNC_OBJECT_FULL_SYNC, state);
      });

      this._bidirectionalSyncObject.on(EVT_READ_ONLY_SYNC_UPDATE_HASH, hash => {
        this.log.debug({
          EVT_READ_ONLY_SYNC_UPDATE_HASH: hash,
        });

        this._zenRTCPeer.emitSyncEvent(SYNC_EVT_SYNC_OBJECT_UPDATE_HASH, hash);
      });
    })();

    // Handle incoming data (their writable to our readOnly)
    (() => {
      // Called when there is a sync event from the other peer
      //
      // NOTE (jh): This is called for any sync event and we must refine it to
      // what we're interested in (below)
      const _handleSyncEventReceived = ({ eventName, eventData }) => {
        // Refine to what we're interested in
        switch (eventName) {
          case SYNC_EVT_SYNC_OBJECT_PARTIAL_SYNC:
            const updatedState = eventData;

            this.log.debug({
              SYNC_EVT_SYNC_OBJECT_PARTIAL_SYNC,
              updatedState,
            });

            this._bidirectionalSyncObject.receiveReadOnlyState(updatedState);
            break;

          case SYNC_EVT_SYNC_OBJECT_FULL_SYNC:
            const fullState = eventData;

            this.log.debug({
              SYNC_EVT_SYNC_OBJECT_FULL_SYNC,
              fullState,
            });

            this._bidirectionalSyncObject.receiveReadOnlyState(
              fullState,
              false
            );
            break;

          case SYNC_EVT_SYNC_OBJECT_UPDATE_HASH:
            this.log.debug({
              SYNC_EVT_SYNC_OBJECT_UPDATE_HASH: eventData,
            });

            const hash = eventData;

            // Automatically handles full state sync if out of sync
            this._bidirectionalSyncObject.verifyReadOnlySyncUpdateHash(hash);
            break;

          default:
            // There are other sync events we're not interested in, so just
            // ignore them here
            break;
        }
      };

      this._zenRTCPeer.on(EVT_SYNC_EVT_RECEIVED, _handleSyncEventReceived);

      this.once(EVT_DESTROYED, () => {
        this._zenRTCPeer.off(EVT_SYNC_EVT_RECEIVED, _handleSyncEventReceived);
      });
    })();
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    this._bidirectionalSyncObject.destroy();

    super.destroy();
  }

  /**
   * @return {SyncObject}
   */
  getReadOnlySyncObject() {
    return this._bidirectionalSyncObject.getReadOnlySyncObject();
  }

  /**
   * @return {SyncObject}
   */
  getWritableSyncObject() {
    return this._bidirectionalSyncObject.getWritableSyncObject();
  }
}

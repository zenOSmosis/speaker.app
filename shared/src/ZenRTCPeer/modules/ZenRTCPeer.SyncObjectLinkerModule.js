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
import SyncObject from "sync-object";
import BidirectionalSyncObject, {
  EVT_WRITABLE_PARTIAL_SYNC,
  EVT_WRITABLE_FULL_SYNC,
  EVT_READ_ONLY_SYNC_UPDATE_HASH,
} from "./PROTO.bisyncobject";

// import { debounce } from "lodash";

/**
 * The number of milliseconds the writable sync should wait for a hash
 * verification from the read-only peer.
 */
// const WRITE_RESYNC_THRESHOLD = 10000;

/**
 * The number of milliseconds the writable sync should debounce when doing
 * rapid syncs in succession, in order to avoid sending full state multiple
 * times.
 *
 * Note that most syncs after the initial sync will skip this debounce
 * entirely, as the updates will be partial state updates, instead of full.
 */
// const FULL_STATE_DEBOUNCE_TIMEOUT = 1000;

/**
 * Provides P2P access for SyncObject modules, using two SyncObjects, each
 * representative of outgoing (writable) and incoming (readOnly) scenarios.
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

    this._bidirectionalSyncObject = new BidirectionalSyncObject(
      writableSyncObject,
      readOnlySyncObject
    );

    // Perform full sync once connected
    zenRTCPeer.once(EVT_CONNECTED, () => {
      this._bidirectionalSyncObject.forceFullSync();
    });

    // Handle outgoing data (our writable to their readOnly)
    (() => {
      this._bidirectionalSyncObject.on(EVT_WRITABLE_PARTIAL_SYNC, state => {
        // TODO: Remove
        console.log({
          EVT_WRITABLE_PARTIAL_SYNC: state,
        });

        this._zenRTCPeer.emitSyncEvent(
          SYNC_EVT_SYNC_OBJECT_PARTIAL_SYNC,
          state
        );
      });

      this._bidirectionalSyncObject.on(EVT_WRITABLE_FULL_SYNC, state => {
        // TODO: Remove
        console.log({
          EVT_WRITABLE_FULL_SYNC: state,
        });

        this._zenRTCPeer.emitSyncEvent(SYNC_EVT_SYNC_OBJECT_FULL_SYNC, state);
      });

      this._bidirectionalSyncObject.on(EVT_READ_ONLY_SYNC_UPDATE_HASH, hash => {
        // TODO: Remove
        console.log({
          EVT_READ_ONLY_SYNC_UPDATE_HASH: hash,
        });

        this._zenRTCPeer.emitSyncEvent(SYNC_EVT_SYNC_OBJECT_UPDATE_HASH, hash);
      });
    })();

    // Handle incoming data (their writable to our readOnly)
    (() => {
      // TODO: Remove?
      // let _debouncedFullStateEmit = null;

      // const writeableSyncObject = this.getWritableSyncObject();
      // const readOnlySyncObject = this.getReadOnlySyncObject();

      // Called when there is a sync event from the other peer
      //
      // NOTE (jh): This is called for any sync event and we must refine it to
      // what we're interested in (below)
      const _handleSyncEventReceived = ({ eventName, eventData }) => {
        // TODO: Remove
        console.log({
          eventName,
          eventData,
        });

        // Refine to what we're interested in
        switch (eventName) {
          case SYNC_EVT_SYNC_OBJECT_PARTIAL_SYNC:
            const updatedState = eventData;

            // TODO: Remove
            console.log({
              SYNC_EVT_SYNC_OBJECT_PARTIAL_SYNC,
              updatedState,
            });

            this._bidirectionalSyncObject.receiveReadOnlyState(updatedState);
            break;

          case SYNC_EVT_SYNC_OBJECT_FULL_SYNC:
            const fullState = eventData;

            // TODO: Remove

            console.log({
              SYNC_EVT_SYNC_OBJECT_FULL_SYNC,
              fullState,
            });

            this._bidirectionalSyncObject.receiveReadOnlyState(
              fullState,
              false
            );
            break;

          case SYNC_EVT_SYNC_OBJECT_UPDATE_HASH:
            // TODO: Remove
            console.log({
              SYNC_EVT_SYNC_OBJECT_UPDATE_HASH: eventData,
            });

            const hash = eventData;

            if (
              this._bidirectionalSyncObject.verifyReadOnlySyncUpdateHash(hash)
            ) {
              // TODO: Remove
              console.log("in sync");
            }
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

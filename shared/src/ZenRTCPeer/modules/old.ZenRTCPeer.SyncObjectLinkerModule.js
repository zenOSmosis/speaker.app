import BaseModule from "./ZenRTCPeer.BaseModule";
import {
  EVT_CONNECTED,
  EVT_SYNC_EVT_RECEIVED,
  EVT_DESTROYED,
} from "../ZenRTCPeer";
import {
  SYNC_EVT_SYNC_OBJECT_UPDATE,
  SYNC_EVT_SYNC_OBJECT_READ_ONLY_UPDATE_HASH,
} from "../../syncEvents";
import SyncObject, { EVT_UPDATED } from "../../SyncObject";

import { debounce } from "lodash";

/**
 * The number of milliseconds the writable sync should wait for a hash
 * verification from the read-only peer.
 */
const WRITE_RESYNC_THRESHOLD = 10000;

/**
 * The number of milliseconds the writable sync should debounce when doing
 * rapid syncs in succession, in order to avoid sending full state multiple
 * times.
 *
 * Note that most syncs after the initial sync will skip this debounce
 * entirely, as the updates will be partial state updates, instead of full.
 */
const FULL_STATE_DEBOUNCE_TIMEOUT = 1000;

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
   * @param {SyncObject} writableSyncObject? [optional]
   * @param {SyncObject} readOnlySyncObject? [optional]
   */
  constructor(
    zenRTCPeer,
    writableSyncObject = null,
    readOnlySyncObject = null
  ) {
    super(zenRTCPeer);

    // Our state
    this._writableSyncObject = writableSyncObject || this._makeSyncObject();

    // Their state
    this._readOnlySyncObject = readOnlySyncObject || this._makeSyncObject();

    (() => {
      // Internally managed to handle writable event retries
      let _writeSyncTimeout = null;

      // Clear the timeout once we destroy
      this.once(EVT_DESTROYED, () => clearTimeout(_writeSyncTimeout));

      // Handle wire-based events
      (() => {
        /**
         * Called when our own writable state has updated.
         *
         * Triggers network SYNC_EVT_SYNC_OBJECT_UPDATE from local writable
         * SyncObject when it has been updated.
         *
         * This is handled via the writeableSyncObject.
         *
         * @param {Object} state NOTE: This state will typically be the changed
         * state, and not the full state of the calling SyncObject.
         * @param {boolean} isRetry [optional; default = false] Internally set
         * if the invocation is a retry.
         */
        const _handleWritableUpdated = (state, isRetry = false) => {
          // Clear existing write sync timeout
          clearTimeout(_writeSyncTimeout);

          const ourFullStateHash = this._writableSyncObject.getFullStateHash();

          console.debug(
            "writableUpdated",
            {
              state,
              rawState: this._writableSyncObject.getRawState(),
              hash: ourFullStateHash,
            },
            {
              isRetry,
            }
          );

          // Perform sync
          this._zenRTCPeer.emitSyncEvent(SYNC_EVT_SYNC_OBJECT_UPDATE, {
            state,
          });

          /**
           * Since this is a UDP connection, there is no guarantee that the
           * message has been delivered, so we have to implement it on our own.
           *
           * Once the state has synced, the timeout is cleared.
           *
           * If the state does not sync, it will retry and start the retry
           * cycle over again.  If there is a subsequent update, the retry
           * cycle is canceled and started again with the latest state.
           */
          _writeSyncTimeout = setTimeout(
            // Call the handler again, as a retry
            () => _handleWritableUpdated(state, true),
            WRITE_RESYNC_THRESHOLD
          );
        };

        // Listen to local syncObjectB changes and push updates when available
        this._writableSyncObject.on(EVT_UPDATED, _handleWritableUpdated);

        // Perform full sync
        const _handleConnect = () => {
          const fullState = this._writableSyncObject.getState();

          _handleWritableUpdated(fullState);
        };

        this._zenRTCPeer.on(EVT_CONNECTED, _handleConnect);

        this.once(EVT_DESTROYED, () => {
          this._zenRTCPeer.off(EVT_CONNECTED, _handleConnect);

          this._writableSyncObject.off(EVT_UPDATED, _handleWritableUpdated);
        });
      })();

      (() => {
        let _debouncedFullStateEmit = null;

        // Called when there is a sync event from the other peer
        //
        // NOTE (jh): This is called for any sync event and we must refine it to
        // what we're interested in (below)
        const _handleSyncEventReceived = ({ eventName, eventData }) => {
          // Refine to what we're interested in
          switch (eventName) {
            /**
             * Handles request to share differential sub-state of writable
             * SyncObject with read-only peer.
             *
             * This is handled via the readOnlySyncObject.
             */
            case SYNC_EVT_SYNC_OBJECT_UPDATE:
              (() => {
                /*
                console.debug("SYNC_EVT_SYNC_OBJECT_UPDATE", {
                  eventData,
                });
                */

                // Fail gracefully if wrong type
                if (typeof eventData !== "object") {
                  console.warn("eventData expected an object");
                  return;
                }

                const { state, isMerge = true } = eventData;

                this._readOnlySyncObject.setState(state, isMerge);

                const ourFullStateHash = this._readOnlySyncObject.getFullStateHash();

                /*
                console.debug({
                  ourHash: ourFullStateHash,
                  ourState: this._readOnlySyncObject.getState(),
                  ourRawState: this._readOnlySyncObject.getRawState(),
                });
                */

                // Send our hash back to the other peer for verification
                //
                // This is our readOnly read-receipt hash
                this._zenRTCPeer.emitSyncEvent(
                  SYNC_EVT_SYNC_OBJECT_READ_ONLY_UPDATE_HASH,
                  ourFullStateHash
                );

                console.debug(
                  `Sending ${
                    isMerge ? "merged" : "full"
                  } state update verification hash: ${ourFullStateHash}`
                );
              })();
              break;

            /**
             * Checks other peer's read-only hash and ensures it matches our
             * writable's.
             *
             * Note, if the hash is verified it clears the internal
             * _writeSyncTimeout descriptor.
             */
            case SYNC_EVT_SYNC_OBJECT_READ_ONLY_UPDATE_HASH:
              (() => {
                const theirFullStateHash = eventData;
                const ourFullStateHash = this._writableSyncObject.getFullStateHash();

                if (theirFullStateHash !== ourFullStateHash) {
                  if (_debouncedFullStateEmit) {
                    _debouncedFullStateEmit.cancel();
                  }

                  /**
                   * Handle sending of entire, non-merging state to the other
                   * peer (full-sync).
                   *
                   * Calls to obtain full state are expensive, over network, so
                   * if making rapid state settings, we need to debounce them
                   * and take the final setting.
                   */
                  _debouncedFullStateEmit = debounce(
                    () => {
                      console.debug(
                        `Sending full writable state sync: ${zenRTCPeer.getSocketIoId()}`
                      );

                      this._zenRTCPeer.emitSyncEvent(
                        SYNC_EVT_SYNC_OBJECT_UPDATE,
                        {
                          state: this._writableSyncObject.getState(),
                          isMerge: false,
                        }
                      );
                    },
                    FULL_STATE_DEBOUNCE_TIMEOUT,
                    {
                      leading: false,
                      trailing: true,
                    }
                  );

                  _debouncedFullStateEmit();
                } else {
                  console.debug(
                    `Synced merged remote state hash: ${ourFullStateHash}`
                  );

                  clearTimeout(_writeSyncTimeout);
                }
              })();
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
    })();
  }

  /**
   * Creates a temporary SyncObject designed to last only the duration of this
   * P2P session.
   *
   * This is not to be used if an object of the same channel (i.e. readOnly /
   * writable) is used.
   *
   * @return {SyncObject}
   */
  _makeSyncObject() {
    const syncObject = new SyncObject();

    // Destroy the temporary SyncObject when the linker is destroyed
    this.once(EVT_DESTROYED, () => syncObject.destroy());

    return syncObject;
  }

  /**
   * @return {SyncObject}
   */
  getReadOnlySyncObject() {
    return this._readOnlySyncObject;
  }

  /**
   * @return {SyncObject}
   */
  getWritableSyncObject() {
    return this._writableSyncObject;
  }
}

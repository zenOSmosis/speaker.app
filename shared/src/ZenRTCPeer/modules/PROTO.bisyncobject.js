// TODO: Move to sync-object repo once finished prototyping

import PhantomCore, { EVT_DESTROYED } from "phantom-core";
import SyncObject, { EVT_UPDATED } from "sync-object";

/*
const PhantomCore = require("phantom-core");
const { EVT_DESTROYED } = PhantomCore;
const SyncObject = require("sync-object");
const { EVT_UPDATED } = SyncObject;
*/

const EVT_WRITABLE_PARTIAL_SYNC = "writable-sync-updated";
const EVT_WRITABLE_FULL_SYNC = "writable-full-sync";
const EVT_READ_ONLY_SYNC_UPDATE_HASH = "read-only-sync-update-hash";

const { debounce } = require("lodash");

/**
 * The number of milliseconds the writable sync should wait for a hash
 * verification from the read-only peer.
 */
const DEFAULT_WRITE_RESYNC_THRESHOLD = 10000;

/**
 * The number of milliseconds the writable sync should debounce when doing
 * rapid syncs in succession, in order to avoid sending full state multiple
 * times.
 *
 * Note that most syncs after the initial sync will skip this debounce
 * entirely, as the updates will be partial state updates, instead of full.
 */
const DEFAULT_FULL_STATE_DEBOUNCE_TIMEOUT = 1000;

/**
 * Provides P2P access for SyncObject modules, using two SyncObjects, where
 * one represents the local (writable) peer and the other represents the
 * "remote" (readOnly) peer.
 */
class BidirectionalSyncObject extends PhantomCore {
  /**
   * If the optional writable or readOnly SyncObjects are not supplied, one of
   * each respective type will be automatically created and utilized during the
   * lifecycle of the class.
   *
   * @param {SyncObject} writableSyncObject? [default = null] Represents "our"
   * state.
   * @param {SyncObject} readOnlySyncObject? [default = null] Represents
   * "their" state.
   */
  constructor(
    writableSyncObject = null,
    readOnlySyncObject = null,
    options = { logLevel: "debug" /* TODO: Remove */ }
  ) {
    const DEFAULT_OPTIONS = {
      writeResyncThreshold: DEFAULT_WRITE_RESYNC_THRESHOLD,
      fullStateDebounceTimeout: DEFAULT_FULL_STATE_DEBOUNCE_TIMEOUT,
    };

    if (writableSyncObject && readOnlySyncObject) {
      if (writableSyncObject.getIsSameInstance(readOnlySyncObject)) {
        throw new Error(
          "readOnly and writable sync objects cannot be the same instance"
        );
      }
    }

    super(options);

    this._options = { ...DEFAULT_OPTIONS, options };

    // Our state
    this._writableSyncObject = writableSyncObject || this._makeSyncObject();

    // Their state
    this._readOnlySyncObject = readOnlySyncObject || this._makeSyncObject();

    this._writableDidPartiallyUpdate = this._writableDidPartiallyUpdate.bind(
      this
    );

    this._writableSyncObject.on(EVT_UPDATED, this._writableDidPartiallyUpdate);

    this._writeSyncVerificationTimeout = null;

    this._unverifiedRemoteSyncHashes = [];

    this.forceFullSync = debounce(
      this.forceFullSync,
      this._options.fullStateDebounceTimeout,
      {
        leading: false,
        trailing: true,
      }
    );
  }

  /**
   * @return {Object}
   */
  getOptions() {
    return this._options;
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    clearTimeout(this._writeSyncVerificationTimeout);

    this._writableSyncObject.off(EVT_UPDATED, this._writableDidPartiallyUpdate);

    await super.destroy();
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

  /**
   * This should be called when there is state to update the
   * readOnlySyncObject.
   *
   * IMPORTANT: This should be utilized instead of calling the
   * readOnlySyncObject.setUpdate() method directly, as the sync won't update
   * properly when doing so.
   *
   * @param {Object} state Partial, or full state, depending on isMerge value.
   * @param {boolean} isMerge? [optional; default = true] If true, state is a
   * partial state. If false, the entire local state will be overwritten.
   * @return void
   */
  receiveReadOnlyState(state, isMerge = true) {
    this._readOnlySyncObject.setState(state, isMerge);

    const theirFullStateHash = this._readOnlySyncObject.getHash();

    // This should be compared against the other peer's writable SyncObject
    // full state hash in order to determine if the states are in sync
    this.emit(EVT_READ_ONLY_SYNC_UPDATE_HASH, theirFullStateHash);
  }

  /**
   * Compares readOnly sync update hash from remote to local's
   * writableSyncObject.
   *
   * If the hash is not verified, it will call this.forceFullSync().
   *
   * @param {string} readOnlySyncUpdateHash
   * @return {boolean}
   */
  verifyReadOnlySyncUpdateHash(readOnlySyncUpdateHash) {
    if (this._unverifiedRemoteSyncHashes.includes(readOnlySyncUpdateHash)) {
      const lenUnverifiedHashes = this._unverifiedRemoteSyncHashes.length;

      const currHashIndex = this._unverifiedRemoteSyncHashes.indexOf(
        readOnlySyncUpdateHash
      );

      if (currHashIndex !== lenUnverifiedHashes - 1) {
        // This is not the last hash sent, so don't do anything other than
        // return false because we're not in sync
        this.log.debug("subsequent update is in progress");

        return false;
      } else {
        if (this._writableSyncObject.getHash() === readOnlySyncUpdateHash) {
          clearTimeout(this._writeSyncVerificationTimeout);

          // Reset unverified hashes
          this._unverifiedRemoteSyncHashes = [];

          this.log.debug("in sync");

          return true;
        } else {
          this.forceFullSync(() => {
            this.log.warn("not in sync; performing full sync");
          });

          return false;
        }
      }
    } else {
      this.forceFullSync(() => {
        this.log.warn("unknown readOnlySyncUpdateHash; performing full sync");
      });
    }
  }

  /**
   * Force full sync operation.
   *
   * NOTE: This function is debounced by this._options.fullStateDebounceTimeout
   * and an optional cb parameter is supplied for additional code to run after
   * the function executes.
   *
   * @param {function} cb?
   * @return {void}
   */
  forceFullSync(cb) {
    this._unverifiedRemoteSyncHashes.push(this._writableSyncObject.getHash());

    clearTimeout(this._writeSyncVerificationTimeout);

    this.emit(EVT_WRITABLE_FULL_SYNC, this._writableSyncObject.getState());

    if (typeof cb === "function") {
      cb();
    }
  }

  /**
   * Called when our own writable state has updated.
   *
   * Triggers network EVT_WRITABLE_PARTIAL_SYNC from local writable
   * SyncObject when it has been updated.
   *
   * This is handled via the writeableSyncObject.
   *
   * @param {Object} updatedState NOTE: This state will typically be the changed
   * state, and not the full state of the calling SyncObject.
   * @return void
   */
  _writableDidPartiallyUpdate(updatedState) {
    this._unverifiedRemoteSyncHashes.push(this._writableSyncObject.getHash());

    clearTimeout(this._writeSyncVerificationTimeout);

    // Perform sync
    this.emit(EVT_WRITABLE_PARTIAL_SYNC, updatedState);

    this._writeSyncVerificationTimeout = setTimeout(() => {
      this.forceFullSync();
    }, this._options.writeResyncThreshold);
  }
}

/*
module.exports = BidirectionalSyncObject;
module.exports.EVT_DESTROYED = EVT_DESTROYED;
module.exports.EVT_WRITABLE_PARTIAL_SYNC = EVT_WRITABLE_PARTIAL_SYNC;
module.exports.EVT_WRITABLE_FULL_SYNC = EVT_WRITABLE_FULL_SYNC;
module.exports.EVT_READ_ONLY_SYNC_UPDATE_HASH = EVT_READ_ONLY_SYNC_UPDATE_HASH;
*/

export default BidirectionalSyncObject;
export {
  EVT_DESTROYED,
  EVT_WRITABLE_FULL_SYNC,
  EVT_WRITABLE_PARTIAL_SYNC,
  EVT_READ_ONLY_SYNC_UPDATE_HASH,
};

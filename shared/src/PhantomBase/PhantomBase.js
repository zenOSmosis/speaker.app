import EventEmitter from "events";
import { v4 as uuidv4 } from "uuid";

import getUnixTime from "../time/getUnixTime";

export const EVT_READY = "ready";
export const EVT_UPDATED = "updated";
export const EVT_DESTROYED = "destroyed";

const _instances = {};

/**
 * Base class which Phantom Server components derive.
 */
export default class PhantomBase extends EventEmitter {
  /**
   * Retrieves PhantomBase instance with the given UUID.
   *
   * @param {string} uuid
   * @return {PhantomBase}
   */
  static getInstanceWithUuid(uuid) {
    return _instances[uuid];
  }

  // TODO: Provide optional singleton support
  constructor(params = { isReady: true }) {
    super();

    this._isDestroyed = false;
    this._uuid = uuidv4();

    _instances[this._uuid] = this;

    // TODO: Make constructor configurable to set if already ready
    this._isReady = params.isReady || false;
    this.once(EVT_READY, () => {
      this._isReady = true;
    });

    this._instanceStartTime = getUnixTime();

    // TODO: Use class-level logger (npm debug library and / or logger w/ debug bindings)
    // console.debug(`Constructed ${this.getClassName()} @ ${this._uuid}`);
  }

  // TODO: Make more use of this
  // TODO: Convert to logger.log?
  /*
  log(...args) {
    console.log(...args);
  }
  */

  // TODO: Add proxyOn, proxyOnce, proxyOff methods to use event emitters from
  // other instances while binding them to this instance lifecycle,
  // unregistering the proxied listener when this instance destructs

  /**
   * Retrieves the number of seconds since this instance was instantiated.
   *
   * @return {number}
   */
  getInstanceUptime() {
    if (!this._isDestroyed) {
      return getUnixTime() - this._instanceStartTime;
    } else {
      return 0;
    }
  }

  /**
   * Determines whether the passed instance is the same as the current
   * instance.
   *
   * @param {PhantomBase} instance
   * @return {boolean}
   */
  getIsSameInstance(instance) {
    return Object.is(this, instance);
  }

  /**
   * @return {boolean}
   */
  getIsDestroyed() {
    return this._isDestroyed;
  }

  /**
   * Unique identifier which represents this class instance.
   *
   * @return {string}
   */
  getUuid() {
    return this._uuid;
  }

  /**
   * @return {Promise} Resolves once the class instance is ready.
   */
  onceReady() {
    if (this._isReady) {
      return;
    }

    return new Promise((resolve) => this.once(EVT_READY, resolve));
  }

  /**
   * @return {boolean}
   */
  getIsReady() {
    return this._isReady;
  }

  /**
   * @return {string}
   */
  getClassName() {
    return this.constructor.name;
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    if (!this._isDestroyed) {
      delete _instances[this._uuid];

      // TODO: Use class-level logger
      // this.log(`${this.constructor.name} is destructing`);

      // Note: Setting this flag before-hand is intentional
      this._isDestroyed = true;

      this.emit(EVT_DESTROYED);

      // Unbind all listeners
      this.removeAllListeners();

      // TODO: Use class-level logger
      // console.debug(`Destructed ${this.getClassName()} @ ${this._uuid}`);
    }
  }
}

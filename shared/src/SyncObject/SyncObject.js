import PhantomCore, { EVT_UPDATED, EVT_DESTROYED } from "phantom-core";
import { isPlainObject } from "lodash";
import SparkMD5 from "spark-md5";
import flatten, { unflatten } from "flat";

export { EVT_UPDATED, EVT_DESTROYED };

export const KEY_DELETE = "[_[[DELETE]]_]";

/**
 * An object which shares synced, serialized state for things such as network
 * transmission, etc.
 *
 * FIXME: SyncObject is very peculiar with sub-objects and arrays, in that it
 * can receive updates which can only affect various properties (and array
 * elements) of the given objects (and arrays).  The KEY_DELETE property is
 * currently necessary in order to shave off deleted values of these
 * sub-objects, and there should probably be an easier way to go about it.
 *
 * TODO: Extend w/ ability to run in WebWorker: https://medium.com/@danilog1905/how-to-use-web-workers-with-react-create-app-and-not-ejecting-in-the-attempt-3718d2a1166b
 */
export default class SyncObject extends PhantomCore {
  // TODO: Document
  static writeDecorator(writeState) {
    return flatten(writeState);
  }

  // TODO: Document
  static readDecorator(readState) {
    return unflatten(readState);
  }

  /**
   * @return {boolean}
   */
  static valuesMatch(v1, v2) {
    const val1 = typeof v1 === "object" ? JSON.stringify(v1) : v1;

    const val2 = typeof v2 === "object" ? JSON.stringify(v2) : v2;

    return val1 === val2;
  }

  // TODO: Document
  static validateValueTypes(state) {
    // TODO: Refactor out of here
    // @see https://stackoverflow.com/questions/30579940/reliable-way-to-check-if-objects-is-serializable-in-javascript
    function isSerializable(obj) {
      var isNestedSerializable;
      function isPlain(val) {
        return (
          val === null ||
          typeof val === "undefined" ||
          typeof val === "string" ||
          typeof val === "boolean" ||
          typeof val === "number" ||
          Array.isArray(val) ||
          isPlainObject(val)
        );
      }
      if (!isPlain(obj)) {
        return false;
      }
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (!isPlain(obj[property])) {
            return false;
          }
          if (typeof obj[property] == "object") {
            isNestedSerializable = isSerializable(obj[property]);
            if (!isNestedSerializable) {
              return false;
            }
          }
        }
      }
      return true;
    }

    for (const key of Object.keys(state)) {
      const value = state[key];

      if (!isSerializable(value)) {
        throw new Error(`Key "${key}" is not serializable`);
      }
    }

    return state;
  }

  /**
   * IMPORTANT: Every key / value must be serializable.
   *
   * @param {Object} initialState
   */
  constructor(initialState = {}) {
    super();

    /**
     * @type {Object}
     */
    this._initialState = Object.freeze(
      SyncObject.writeDecorator(SyncObject.validateValueTypes(initialState))
    );

    this._state = SyncObject.writeDecorator({ ...this._initialState });
  }

  /**
   * Sets the current state.
   *
   * IMPORTANT: For deleted keys, the value of an updatedState key must be set
   * to the KEY_DELETE constant value.  This seems to be a limitation of the
   * flatten utility, as it does not seem to work with undefined keys.
   *
   * @param {Object} updatedState Updated state can be decorated by either read
   * or write decorator.
   * @param {boolean} isMerge [optional; default = true]
   * @return {void}
   */
  setState(updatedState, isMerge = true) {
    // Ensure updatedState is serializable
    SyncObject.validateValueTypes(updatedState);

    const readUpdatedState = SyncObject.writeDecorator(updatedState);

    if (isMerge) {
      const prevState = { ...this._state };

      // Changed values are written here
      const diffState = {};

      const deletedKeys = [];

      for (const key of Object.keys(readUpdatedState)) {
        if (!SyncObject.valuesMatch(readUpdatedState[key], prevState[key])) {
          const updatedValue = readUpdatedState[key];

          diffState[key] = updatedValue;

          if (updatedValue === KEY_DELETE) {
            deletedKeys.push(key);
          }
        }
      }

      if (!Object.keys(diffState).length) {
        console.debug(
          "Ignoring changed state call as there are no new updates"
        );
      } else {
        this._state = {
          // Previous raw state
          ...prevState,

          // Raw changed state
          ...diffState,
        };

        // Handle delete
        for (const key of Object.keys(this._state)) {
          for (const deletedKey of deletedKeys) {
            if (key === deletedKey || key.startsWith(deletedKey)) {
              delete this._state[key];
            }
          }
        }

        this.emit(EVT_UPDATED, updatedState);
      }
    } else {
      // Update state directly w/ updated state
      this._state = {
        ...readUpdatedState,
      };

      this.emit(EVT_UPDATED, SyncObject.readDecorator(updatedState));
    }
  }

  /**
   * @return {Object}
   */
  getState() {
    return SyncObject.readDecorator(this._state);
  }

  /**
   * Retrieves the current state without the read decorator being utilized.
   *
   * @return {Object}
   */
  getRawState() {
    return this._state;
  }

  /**
   * Retrieves the keys of the given update indexes which don't match the
   * current update indexes for those keys.
   *
   * @param {Object} remoteStateHashes // TODO: Document
   * @return {string[]} The changed keys between the values.
   */
  getDiffKeys(remoteStateHashes) {
    const localStateHashes = this.getStateHashes();
    // const localKeys = Object.keys(localStateHashes);

    const remoteKeys = Object.keys(remoteStateHashes);

    const diffKeys = [];

    for (const theirKey of remoteKeys) {
      const localMatch = localStateHashes[theirKey];

      if (!localMatch || localMatch !== remoteStateHashes[theirKey]) {
        diffKeys.push(theirKey);
      }
    }

    return diffKeys;
  }

  /**
   * Retrieves an object with keys and values which match the difference
   * between supplied update indexes and class-based update indexes.
   *
   * @param {Object} remoteStateHashes // TODO: Document
   * @return {Object} Filtered object with only changed properties
   * representative of difference.
   */
  getDiffValues(remoteStateHashes) {
    const diffKeys = this.getDiffKeys(remoteStateHashes);

    const diffValues = {};

    for (const key of diffKeys) {
      diffValues[key] = this._state[key];
    }

    return diffValues;
  }

  /**
   * Retrieves an object with the same keys as the state, though with hashed
   * values.
   *
   * @return {Object} // TODO: Document
   */
  getStateHashes() {
    const valueHashes = {};

    const state = SyncObject.readDecorator(this._state);

    for (const key of Object.keys(state)) {
      const str =
        typeof state[key] === "object"
          ? JSON.stringify(state[key])
          : state[key] !== undefined && state[key].toString();

      if (str) {
        valueHashes[key] = SparkMD5.hash(str);
      }
    }

    return valueHashes;
  }

  /**
   * @return {String}
   */
  getFullStateHash() {
    const json = JSON.stringify(this.getStateHashes());

    return SparkMD5.hash(json);
  }
}

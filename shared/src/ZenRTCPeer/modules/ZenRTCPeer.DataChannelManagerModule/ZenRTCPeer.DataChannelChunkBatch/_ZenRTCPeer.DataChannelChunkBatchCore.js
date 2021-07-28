import PhantomCore, { logger } from "phantom-core";

// IMPORTANT: Module aliases are not currently supported w/ shared modules,
// hence the full relative path
import getRoughSizeOfObject from "../../../../number/getRoughSizeOfObject";

/**
 * @type {boolean} Set to true to identify a chunk.
 */
export const META_CHUNK_KEY_IS_CHUNK = "zChunk";

/**
 * @type {SERIAL_TYPE_STRING | SERIAL_TYPE_OBJECT | SERIAL_TYPE_INTEGER | SERIAL_TYPE_FLOAT} serialType
 */
export const META_CHUNK_KEY_SERIAL_TYPE = "t";

/**
 * @type {string | number} The serialized data.
 */
export const META_CHUNK_KEY_DATA = "d";

/**
 * @type {number} The chunk index, starting from 0.
 */
export const META_CHUNK_KEY_INDEX = "i";

/**
 * @type {number} The total number of chunks.
 */
export const META_CHUNK_KEY_LEN_CHUNKS = "l";

/**
 * @type {string} The batch code which corresponds to the short UUID of the
 * sender.
 */
export const META_CHUNK_KEY_BATCH_CODE = "b";

const _instances = {};

/**
 * Provides serialized data channel chunking operations for
 * ZenRTCPeer.DataChannelManagerModule.
 *
 * IMPORTANT: This class should not be utilized directly.  The associated
 * sender and receiver classes should be utilized instead.
 */
export default class DataChannelChunkBatchCore extends PhantomCore {
  /**
   * Retrieves the batch instance with the given batch code, if one is present.
   *
   * @param {string} batchCode
   * @return {DataChannelChunkBatch | void}
   */
  static getBatchWithCode(batchCode) {
    const batch = _instances[batchCode];

    if (!batch) {
      logger.warn(`Unknown batch with code: ${batchCode}`);
    }

    return batch;
  }

  /**
   * Determines if the given data should be chunked.
   *
   * @param {any} data
   * @param {number} maxChunkSize? [default = 62kiB]
   * @return {boolean}
   */
  static getShouldBeChunked(data, maxChunkSize = 1024 * 62) {
    return getRoughSizeOfObject(data) > maxChunkSize;
  }

  /**
   * Determines if the given data is chunked data (assuming the passed data is
   * a meta chunk).
   *
   * @param {any} data
   * @return {boolean} Whether or not the given data is chunked.
   */
  static getIsChunked(data) {
    if (
      typeof data === "object" &&
      // TODO: Use constants
      [
        META_CHUNK_KEY_IS_CHUNK,
        META_CHUNK_KEY_SERIAL_TYPE,
        META_CHUNK_KEY_DATA,
        META_CHUNK_KEY_INDEX,
        META_CHUNK_KEY_LEN_CHUNKS,
        META_CHUNK_KEY_BATCH_CODE,
      ].every(key => data.hasOwnProperty(key)) &&
      data[META_CHUNK_KEY_IS_CHUNK] === true
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @param {Object | string} chunkData
   * @return {Object} // TODO: Document
   */
  static readMetaChunk(chunkData) {
    // Silently ignore if not a real chunk
    if (!DataChannelChunkBatchCore.getIsChunked(chunkData)) {
      logger.warn("chunkData is not a DataChannelChunkBatch chunk", chunkData);

      return;
    }

    if (typeof chunkData === "string") {
      chunkData = JSON.parse(chunkData);
    }

    const {
      // META_CHUNK_KEY_IS_CHUNK,
      META_CHUNK_KEY_SERIAL_TYPE: serialType,
      META_CHUNK_KEY_DATA: data,
      META_CHUNK_KEY_INDEX: idx,
      META_CHUNK_KEY_LEN_CHUNKS: lenChunks,
      META_CHUNK_KEY_BATCH_CODE: batchCode,
    } = chunkData;

    return {
      serialType,
      data,
      idx,
      lenChunks,
      batchCode,
    };
  }

  /**
   * @param {Object} options TODO: Document
   */
  constructor(options = {}) {
    const DEFAULT_OPTIONS = {
      originalData: "",
      maxChunkSize: 1024 * 62,
      batchCode: null,
      serialType: null,
    };

    const mergedOptions = PhantomCore.mergeOptions(DEFAULT_OPTIONS, options);

    // At this time, this class only supports strings for original data (it's
    // mostly intended to work w/ large JSON structures)
    if (typeof mergedOptions.originalData !== "string") {
      throw new TypeError("originalData must be a string");
    }

    super(mergedOptions);

    // No default data is assumed to be the receiver, in which case we must
    // also have a corresponding batch code in order to correlate received data
    // chunks to this instance
    if (!this._options.originalData && !this._batchCode) {
      throw new Error(
        "batchCode must be present when there is no default data"
      );
    }

    // Data as it is meant to be consumed on the other side (no meta-data
    // added)
    this._data = this._options.originalData;

    this._maxChunkSize = this._options.maxChunkSize;

    this._batchCode = this._options.batchCode || this.getShortUUID();

    this._serialType = this._options.serialType;

    // Add to registered instances, for batch code retrieval when adding new
    // chunks to the batch (by the receiver)
    _instances[this._batchCode] = this;
  }

  /**
   * @return {string}
   */
  getBatchCode() {
    return this._batchCode;
  }

  // TODO: Document
  empty() {
    this._data = "";
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    // Remove from the registered instances
    delete _instances[this._batchCode];

    this.empty();

    return super.destroy();
  }
}

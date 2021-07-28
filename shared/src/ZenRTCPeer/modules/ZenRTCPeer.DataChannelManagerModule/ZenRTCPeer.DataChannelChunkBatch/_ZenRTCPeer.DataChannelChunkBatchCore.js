import PhantomCore, { logger } from "phantom-core";

// IMPORTANT: Module aliases are not currently supported w/ shared modules,
// hence the full relative path
import getRoughSizeOfObject from "../../../../number/getRoughSizeOfObject";

/**
 * @type {boolean} Set to true to identify a chunk.
 **/
export const CHUNK_KEY_IS_CHUNK = "zChunk";

/**
 * @type {SERIAL_TYPE_STRING | SERIAL_TYPE_OBJECT | SERIAL_TYPE_INTEGER | SERIAL_TYPE_FLOAT} serialType
 */
export const CHUNK_KEY_SERIAL_TYPE = "t";

/**
 * @type {string | number} The serialized data.
 */
export const CHUNK_KEY_DATA = "d";

/**
 * @type {number} The chunk index, starting from 0.
 */
export const CHUNK_KEY_INDEX = "i";

/**
 * @type {number} The total number of chunks.
 */
export const CHUNK_KEY_LEN_CHUNKS = "l";

/**
 * @type {string} The batch code which corresponds to the short UUID of the
 * sender.
 */
export const CHUNK_KEY_BATCH_CODE = "b";

const _instances = {};

/**
 * Provides serialized data channel chunking operations for ZenRTCPeer.DataChannelManagerModule.
 */
export default class DataChannelChunkBatchCore extends PhantomCore {
  /**
   * Retrieves the batch instance with the given batch code, if one is present.
   *
   * @param {string} batchCode
   * @return {DataChannelChunkBatch | void}
   */
  static getBatchWithCode(batchCode) {
    return _instances[batchCode];
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
   * Determines if the given data is chunked data.
   *
   * @param {any} data
   * @return {boolean} Whether or not the given data is chunked
   */
  static getIsChunked(data) {
    if (
      typeof data === "object" &&
      // TODO: Use constants
      [
        CHUNK_KEY_IS_CHUNK,
        CHUNK_KEY_SERIAL_TYPE,
        CHUNK_KEY_DATA,
        CHUNK_KEY_INDEX,
        CHUNK_KEY_LEN_CHUNKS,
        CHUNK_KEY_BATCH_CODE,
      ].every(key => data.hasOwnProperty(key)) &&
      data[CHUNK_KEY_IS_CHUNK] === true
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * @param {Object | string} chunkData
   * @return // TODO: Document
   */
  static readChunkData(chunkData) {
    // Silently ignore if not a real chunk
    if (!DataChannelChunkBatch.getIsChunked(chunk)) {
      logger.warn("chunkData is not a DataChannelChunkBatch chunk", chunkData);

      return;
    }

    if (typeof chunkData === "string") {
      chunkData = JSON.parse(chunkData);
    }

    const {
      // CHUNK_KEY_IS_CHUNK,
      CHUNK_KEY_SERIAL_TYPE: serialType,
      CHUNK_KEY_DATA: data,
      CHUNK_KEY_INDEX: idx,
      CHUNK_KEY_LEN_CHUNKS: lenChunks,
      CHUNK_KEY_BATCH_CODE: batchCode,
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
   * IMPORTANT: This module expects chunks to have a known length (known total
   * number of chunks).
   *
   * When defaultData is present, this instance is assumed to be the sender.
   *
   * NOTE: maxChunkSize option defaults to 63488. This number was chosen
   * because Safari (14) data channels only support a maximum of 65536 bytes
   * being transmitted, and this allows a buffer for meta data padding.
   *
   * @param {any} defaultData Data as it is meant to be consumed on the other
   * side (no meta-data added).
   * @param {Object} options? TODO: Document
   */
  constructor(defaultData = null, userOptions = {}) {
    const DEFAULT_OPTIONS = {
      maxChunkSize: 1024 * 62,
      batchCode: null,
      serialType: null,
    };

    super(options, PhantomCore.mergeOptions(DEFAULT_OPTIONS, userOptions));

    // No default data is assumed to be the receiver, in which case we must
    // also have a corresponding batch code in order to correlate received data
    // chunks to this instance
    if (!defaultData && !this._batchCode) {
      throw new Error(
        "batchCode must be present when there is no default data"
      );
    }

    // Data as it is meant to be consumed on the other side (no meta-data
    // added)
    this._data = defaultData;

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

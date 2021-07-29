import PhantomCore, { logger } from "phantom-core";

// IMPORTANT: Module aliases are not currently supported w/ shared modules,
// hence the full relative path
import getRoughSizeOfObject from "../../../../number/getRoughSizeOfObject";

/**
 * NOTE: maxChunkSize option defaults to 63488 (62 kiB). This number was chosen
 * because Safari (14) data channels only support a maximum of 65536 bytes
 * being transmitted, and this allows a buffer for meta data padding (for chunk
 * batch reassimilation on the receiver end).
 */
export const DEFAULT_MAX_CHUNK_SIZE = 1024 * 62;

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
 *
 * Terminology:
 *    - Chunk: Portion of a given dataset
 *    - Meta Chunk: Chunk with added meta data for batch assimilation
 *    - Batch: A collection of unordered [meta & regular] chunks
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
   * @param {number} maxChunkSize? [default = DEFAULT_MAX_CHUNK_SIZE]
   * @return {boolean}
   */
  static getShouldBeChunked(data, maxChunkSize = DEFAULT_MAX_CHUNK_SIZE) {
    return (
      !DataChannelChunkBatchCore.getIsChunked() &&
      getRoughSizeOfObject(data) > maxChunkSize
    );
  }

  /**
   * Determines if the given data is chunked data (assuming the passed data is
   * a meta chunk).
   *
   * @param {any} data
   * @return {boolean} Whether or not the given data is chunked.
   */
  static getIsChunked(data) {
    try {
      // Coerce to object, if a string
      if (typeof data === "string") {
        data = JSON.parse(data);
      }
    } catch (err) {
      // Silently ignore

      return false;
    }

    if (
      typeof data === "object" &&
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
   * Parses the given meta chunk and rekeys it.
   *
   * While this method is pretty "light" in what it does, it performs
   * additional checking that the meta chunk is valid, and converts JSON chunks
   * into object form.
   *
   * @param {Object | string} metaChunk
   * @return {Object} // TODO: Document
   */
  static readMetaChunk(metaChunk) {
    // Silently ignore if not a real chunk
    if (!DataChannelChunkBatchCore.getIsChunked(metaChunk)) {
      logger.warn("metaChunk is not a DataChannelChunkBatch chunk", metaChunk);

      return;
    }

    if (typeof metaChunk === "string") {
      metaChunk = JSON.parse(metaChunk);
    }

    const {
      // [META_CHUNK_KEY_IS_CHUNK],
      [META_CHUNK_KEY_SERIAL_TYPE]: serialType,
      [META_CHUNK_KEY_DATA]: data,
      [META_CHUNK_KEY_INDEX]: idx,
      [META_CHUNK_KEY_LEN_CHUNKS]: lenChunks,
      [META_CHUNK_KEY_BATCH_CODE]: batchCode,
    } = metaChunk;

    return {
      serialType,
      data,
      idx,
      lenChunks,
      batchCode,
    };
  }

  /**
   * @param {Object} options? TODO: Document
   */
  constructor(options = {}) {
    const DEFAULT_OPTIONS = {
      originalData: "",
      maxChunkSize: DEFAULT_MAX_CHUNK_SIZE,
      serialType: null,
      batchCode: null,
    };

    const mergedOptions = PhantomCore.mergeOptions(DEFAULT_OPTIONS, options);

    super(mergedOptions);

    // Data as it is meant to be consumed on the other side (no meta-data
    // added)
    this._data = this._options.originalData;

    this._maxChunkSize = this._options.maxChunkSize;

    this._batchCode = this._options.batchCode;

    this._serialType = null;

    // IMPORTANT: This shouldn't be utilized directly, and instead should rely
    // on chunk helper operations within extension class methods (i.e. chunks
    // could be out of order, etc.)
    this._cachedChunks = [];

    _instances[this._batchCode] = this;
  }

  /**
   * Obtains the batch code of the class instance in order to relate a meta
   * chunk to the class.
   *
   * @return {string}
   */
  getBatchCode() {
    return this._batchCode;
  }

  /**
   * Retrieves the serial type, as determined by DataChannelManagerModule.
   *
   * @return {string}
   */
  getSerialType() {
    return this._serialType;
  }

  /**
   * Clears out the cached data in order to free up memory.
   *
   * @return {void}
   */
  empty() {
    this._data = "";

    this._cachedChunks = [];
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

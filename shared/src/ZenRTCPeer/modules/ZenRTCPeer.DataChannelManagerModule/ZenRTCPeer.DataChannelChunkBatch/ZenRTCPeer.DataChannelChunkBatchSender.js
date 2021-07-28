import DataChannelChunkBatchCore, {
  META_CHUNK_KEY_IS_CHUNK,
  META_CHUNK_KEY_SERIAL_TYPE,
  META_CHUNK_KEY_DATA,
  META_CHUNK_KEY_INDEX,
  META_CHUNK_KEY_LEN_CHUNKS,
  META_CHUNK_KEY_BATCH_CODE,
} from "./_ZenRTCPeer.DataChannelChunkBatchCore";

import fastChunkString from "@shelf/fast-chunk-string";

// IMPORTANT: Module aliases are not currently supported w/ shared modules,
// hence the full relative path
import getRoughSizeOfObject from "../../../../number/getRoughSizeOfObject";

export default class DataChannelChunkBatchSender extends DataChannelChunkBatchCore {
  /**
   * NOTE: maxChunkSize option defaults to 63488. This number was chosen
   * because Safari (14) data channels only support a maximum of 65536 bytes
   * being transmitted, and this allows a buffer for meta data padding.
   *
   * @param {string} originalData
   * @param {number} maxChunkSize? [default = 63488] Max number of bytes per
   * chunk.
   */
  constructor(originalData, maxChunkSize = 1024 * 62) {
    super({
      originalData,
      maxChunkSize,
    });

    // Cache for this.getChunks(); it shouldn't be utilized directly
    this._chunks = [];
  }

  empty() {
    this._chunks = [];

    super.empty();
  }

  /**
   * Returns the original data, as an array of strings.
   *
   * Subsequent runs will return a memoized cache.
   *
   * @return {string[]}
   */
  getChunks() {
    if (this._chunks.length) {
      return this._chunks;
    }

    // NOTE: This size calculation is based on the assumption that the data
    // is a string, and each character represents two bytes
    // Refer to shared/number/getRoughSizeOfObject for calculations for other
    // data types
    if (typeof this._data !== "string") {
      throw new TypeError(
        "getChunks is currently configured to only handle string types for the original data"
      );
    }

    const chunks = fastChunkString(this._data, {
      // String characters represent two bytes each, in which case we reduce
      // the max chunk size by 2 in order to get the correct character length
      size: this._options.maxChunkSize / 2,
      unicodeAware: true,
    });

    // Memoize for future use
    this._chunks = chunks;

    return chunks;
  }

  /**
   * Returns meta chunks, meant to be serialized and sent over the wire for
   * syncing to the remote.
   *
   * IMPORTANT: This should only be called by the sender.
   *
   * @return {Object[]}
   */
  getMetaChunks() {
    const chunks = this.getChunks();
    const lenChunks = chunks.length;
    const batchCode = this.getBatchCode();

    return chunks.map((strChunk, idx) => ({
      [META_CHUNK_KEY_IS_CHUNK]: true,
      [META_CHUNK_KEY_SERIAL_TYPE]: this._serialType,
      [META_CHUNK_KEY_DATA]: strChunk,
      [META_CHUNK_KEY_INDEX]: idx,
      [META_CHUNK_KEY_LEN_CHUNKS]: lenChunks,
      [META_CHUNK_KEY_BATCH_CODE]: batchCode,
    }));
  }

  /**
   * Retrieves the number of chunks which make up this batch.
   *
   * This method returns the number of actual chunks.
   *
   * @return {number}
   */
  getTotalChunks() {
    return this.getChunks().length;
  }

  /**
   * Retrieves the number of chunks which make up this batch.
   *
   * This method returns a calculated number of chunks.  This "should" be the
   * same as getTotalChunks, above, but the number is not guaranteed to be the
   * same for all data sets, and is currently used for testing purposes only.
   *
   * @return {number}
   */
  UNSAFE_getCalculatedTotalChunks() {
    const roughSize = getRoughSizeOfObject(this._data);

    const calcTotalChunks = Math.ceil(roughSize / this._maxChunkSize);

    const actualTotalChunks = this.getChunks().length;

    if (calcTotalChunks !== actualTotalChunks) {
      throw new Error(
        `calcTotalChunks ${calcTotalChunks} does not equal actualTotalChunks ${actualTotalChunks}`
      );
    }

    return calcTotalChunks;
  }
}

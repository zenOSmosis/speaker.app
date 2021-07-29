import { logger } from "phantom-core";

import DataChannelChunkBatchCore from "./_ZenRTCPeer.DataChannelChunkBatchCore";

import DataChannelManagerModule from "../ZenRTCPeer.DataChannelManagerModule";

import getUnsortedArrayLength from "../../../../number/getUnsortedArrayLength";

export default class DataChannelChunkBatchReceiver extends DataChannelChunkBatchCore {
  /**
   * Reads a meta chunk and reassimilates it with the included batch
   * descriptor.
   *
   * If the receiver batch is not already instantiated locally, it will
   * instantiate it, otherwise it will locate the existing batch and add the
   * eta chunk to it.
   *
   * @param {Object} metaChunk Chunk with meta data for batch reassimilation.
   * @return {DataChannelChunkBatchReceiver}
   */
  static importMetaChunk(metaChunk) {
    const readData = DataChannelChunkBatchCore.readMetaChunk(metaChunk);

    if (!readData) {
      logger.error("Invalid read data", { readData });

      throw new Error("Could not import meta chunk");
    } else {
      const { batchCode } = readData;

      if (!batchCode) {
        throw new TypeError("Unable to parse batch code from readData");
      }

      const batch =
        DataChannelChunkBatchReceiver.getBatchWithCode(batchCode) ||
        new DataChannelChunkBatchReceiver(batchCode);

      batch.addMetaChunk(metaChunk);

      return batch;
    }
  }

  /**
   * @param {string} batchCode
   */
  constructor(batchCode) {
    if (typeof batchCode === "undefined") {
      throw new TypeError(
        "batchCode must be defined during receiver class construction"
      );
    }

    super({ batchCode });

    if (this._options.originalData) {
      throw new ReferenceError(
        `${this.getClassName()} should not contain "originalData" because it is the receiver, and the data must be supplied in chunks`
      );
    }

    this._lenChunks = null;
  }

  /**
   * Adds a meta chunk to the batch.
   *
   * @param {Object | string} metaChunk
   */
  addMetaChunk(metaChunk) {
    const { serialType, data, idx, lenChunks, batchCode } =
      DataChannelChunkBatchCore.readMetaChunk(metaChunk);

    if (this._batchCode && batchCode !== this._batchCode) {
      throw new ReferenceError(
        `Cannot add chunk with batchCode "${batchCode}" to batch "${this._batchCode}"`
      );
    }

    if (serialType) {
      this._serialType = serialType;
    }

    if (lenChunks) {
      this._lenChunks = lenChunks;
    }

    this._cachedChunks[idx] = data;
  }

  /**
   * Determines whether or not this class has received all meta chunks from the
   * sender.
   *
   * @return {boolean}
   */
  getIsComplete() {
    return Boolean(
      this._lenChunks &&
        getUnsortedArrayLength(this._cachedChunks) === this._lenChunks
    );
  }

  /**
   * Returns the original data that was passed from the sender, regardless of
   * chunk order.
   *
   * IMPORTANT: this.getIsComplete() must return true before this will work.
   *
   * @return {string}
   */
  read() {
    if (!this.getIsComplete()) {
      throw new Error("Cannot read before complete");
    }

    let data = "";

    for (let i = 0; i < this._lenChunks; i++) {
      data += this._cachedChunks[i];
    }

    return DataChannelManagerModule.coerceReceivedDataType(
      data,
      this._serialType
    );
  }

  /**
   * Retrieves the number of chunks which make up this batch.
   *
   * NOTE: This method is intentionally differed from the sender class
   * implementation.
   *
   * @return {number}
   */
  getTotalChunks() {
    if (this._lenChunks) {
      return this._lenChunks;
    }
  }
}

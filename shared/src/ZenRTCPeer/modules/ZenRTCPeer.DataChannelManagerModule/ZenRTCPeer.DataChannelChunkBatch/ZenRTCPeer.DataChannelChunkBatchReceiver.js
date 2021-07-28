import ZenRTCPeerDataChannelChunkBatchCore from "./_ZenRTCPeer.DataChannelChunkBatchCore";

export default class ZenRTCPeerDataChannelChunkBatchReceiver extends ZenRTCPeerDataChannelChunkBatchCore {
  /**
   * Adds a chunk to the batch.
   *
   * TODO: Document
   */
  addChunk(chunk) {
    // TODO: Don't allow to run if we're the sender (i.e. there is default data)

    // IMPORTANT: This automatically performs type coercion to string in order to concatenate on top of it
    // this._data = this._data.toString() + chunk;
    // TODO: If data is complete, return fully read data

    const { serialType, data, idx, lenChunks, batchCode } =
      ZenRTCPeerDataChannelChunkBatch.readChunkData(chunk);

    if (batchCode && batchCode !== this._batchCode) {
      throw new TypeError(
        `Cannot add chunk with batchCode "${batchCode}" to batch "${batchCode}"`
      );
    }

    if (serialType) {
      this._serialType = serialType;
    }

    if (lenChunks) {
      this._lenChunks = lenChunks;
    }

    this._data += data;
  }

  /**
   * Retrieves the number of chunks which make up this batch.
   *
   * @return {number}
   */
  getTotalChunks() {
    if (this._lenChunks) {
      return this._lenChunks;
    }
  }
}

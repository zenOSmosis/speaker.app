import ZenRTCPeerDataChannelChunkBatchCore, {
  CHUNK_KEY_IS_CHUNK,
  CHUNK_KEY_DATA,
  CHUNK_KEY_INDEX,
  CHUNK_KEY_LEN_CHUNKS,
  CHUNK_KEY_BATCH_CODE,
} from "./_ZenRTCPeer.DataChannelChunkBatchCore";

import fastChunkString from "@shelf/fast-chunk-string";

export default class ZenRTCPeerDataChannelChunkBatchSender extends ZenRTCPeerDataChannelChunkBatchCore {
  /**
   * Returns the original data, as an array of strings
   *
   * @return {string[]}
   */
  getChunks() {
    return fastChunkString(this._data, {
      size: this._options.maxChunkSize,
      unicodeAware: true,
    });
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
      [CHUNK_KEY_IS_CHUNK]: true,
      [CHUNK_KEY_DATA]: strChunk,
      [CHUNK_KEY_INDEX]: idx,
      [CHUNK_KEY_LEN_CHUNKS]: lenChunks,
      [CHUNK_KEY_BATCH_CODE]: batchCode,
    }));
  }

  /**
   * Retrieves the number of chunks which make up this batch.
   *
   * @return {number}
   */
  getTotalChunks() {
    const roughSize = getRoughSizeOfObject(this._data);

    return Math.ceil(roughSize / this._maxChunkSize);
  }
}

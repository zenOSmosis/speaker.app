import BaseModule, { EVT_DESTROYED } from "../ZenRTCPeer.BaseModule";
import DataChannel from "./ZenRTCPeer.DataChannel";
import { logger } from "phantom-core";

import DataChannelChunkBatch from "./ZenRTCPeer.DataChannelChunkBatch";

import {
  EVT_DATA_CHANNEL_OPENED,
  EVT_DATA_CHANNEL_CLOSED,
  EVT_DATA_RECEIVED,
} from "./constants";

const MARSHALL_PREFIX = "<z:";
const MARSHALL_SUFFIX = "/>";

const SERIAL_TYPE_STRING = "s";
const SERIAL_TYPE_OBJECT = "o";
const SERIAL_TYPE_INTEGER = "i";
const SERIAL_TYPE_FLOAT = "f";

/**
 * Manages the creation, multiplexing / distribution, and chunking of data
 * across multiple DataChannel instances.
 *
 * IMPORTANT: At this time, binary transfers are not directly supported in this
 * module.  It has mostly been designed with syncing JSON data in mind.
 */
export default class ZenRTCPeerDataChannelManagerModule extends BaseModule {
  /**
   * Retrieves custom serial type for the given data.
   *
   * This class will use one of these types to convert received serialized data
   * back to its original type.
   *
   * @param {any} data
   * @return {SERIAL_TYPE_STRING | SERIAL_TYPE_OBJECT | SERIAL_TYPE_INTEGER | SERIAL_TYPE_FLOAT}
   */
  static getSerialType(data) {
    const serialType = isNaN(data)
      ? (typeof data)[0]
      : Number.isInteger(data)
      ? "i"
      : "f";

    if (
      ![
        SERIAL_TYPE_STRING,
        SERIAL_TYPE_OBJECT,
        SERIAL_TYPE_INTEGER,
        SERIAL_TYPE_FLOAT,
      ].includes(serialType)
    ) {
      logger.warn(`Unknown serial type: ${serialType}`);
    }

    return serialType;
  }

  /**
   * Marshals data for transmission to other peer.
   *
   * @param {string} channelName
   * @param {number | string | Object | Array} data
   * @param {number} maxChunkSize? [default = 62kiB]
   * @return {string | string[]} Returns a string or an array of serialized
   * chunks intended to be transmitted to the other peer.
   */
  static pack(channelName, data, maxChunkSize = 1024 * 62) {
    if (typeof channelName !== "string") {
      throw new TypeError("channelName must be a string");
    }

    const serialType = ZenRTCPeerDataChannelManagerModule.getSerialType(data);

    // Serialize JS objects as JSON
    if (serialType === SERIAL_TYPE_OBJECT) {
      data = JSON.stringify(data);
    }

    // If data is larger than maxChunkSize, break into array of chunks, then
    // recursively return the packed (marshalled) string as an array
    if (DataChannelChunkBatch.getShouldBeChunked(data, maxChunkSize)) {
      const chunkBatch = new ChunkBatch(data, { maxChunkSize, serialType });

      // Pack each chunk, where each chunk will be emit separately over the
      // WebRTC data channel
      const serialChunks = chunkBatch
        .getChunks()
        .map(chunk =>
          ZenRTCPeerDataChannelManagerModule.pack(
            channelName,
            chunk,
            maxChunkSize
          )
        );

      chunkBatch.destroy();

      return serialChunks;
    } else {
      // Return the marshalled string
      return `${MARSHALL_PREFIX}${channelName},${serialType},${data}${MARSHALL_SUFFIX}`;
    }
  }

  /**
   * Unmarshalls channel data received from other peer.
   *
   * If not able to unmarshall data, it will return void.
   *
   * @param {string} rawData
   * @return {Promise<Array[channelName: string, channelData: number | string | Object | Array] | void>}
   * NOTE: A promise is used for the return as it will await all chunked data
   * to be received before resolving.
   */
  static async unpack(rawData) {
    /**
     * IMPORTANT: We can't assume the received packs will be in order, so we
     * need to force them to be in order.
     *
     * @see https://developer.mozilla.org/en-US/docs/Games/Techniques/WebRTC_data_channels
     * for how data channels can either be reliable (similar to TCP; in order)
     * or unreliable (similar to UDP; not guaranteed to be in order).
     */

    if (typeof rawData !== "string") {
      rawData = rawData.toString();
    }

    // Only handle data that has been marshalled by this class on the other end
    // of the wire.
    if (
      rawData.startsWith(MARSHALL_PREFIX) &&
      rawData.endsWith(MARSHALL_SUFFIX)
    ) {
      rawData = rawData.substr(MARSHALL_PREFIX.length);
      rawData = rawData.substr(0, rawData.length - MARSHALL_SUFFIX.length);

      let channelName = "";
      let serialType = null;
      let data = null;

      // Parse channelName, serialType and data from raw data
      // NOTE (jh): I used this instead of JSON parsing the raw data because of
      // theoretical performance enhancements, but haven't actually measured it
      let i = -1;
      do {
        ++i;

        const char = rawData[i];

        if (char !== ",") {
          channelName += rawData[i];
        } else {
          // TODO: Document
          serialType = rawData[i + 1];

          // TODO: Document
          rawData = rawData.substr(i + 3);

          // Turn data type into original before serialization
          data = ZenRTCPeerDataChannelManagerModule.coerceReceivedDataType(
            rawData,
            serialType
          );

          // Stop iterating once we know the data
          break;
        }
      } while (true);

      // If matches internal chunk structure, await batch
      // if (DataChannelChunkBatch.getIsChunked(data)) {
      // TODO: Provide unchunking ability, buffering (and not returning) until the inbound message is complete
      // TODO: If incomplete batch, return void
      // } else {
      return [channelName, data];
      // }
    }
  }

  /**
   * Returns data of coerced type
   *
   * @param {string | Object | number} data
   * @param {string} serialType
   * @return {string | Object | number}
   */
  static coerceReceivedDataType(data, serialType) {
    switch (serialType) {
      case SERIAL_TYPE_STRING:
        // Do nothing
        break;

      case SERIAL_TYPE_OBJECT:
        data = JSON.parse(data);
        break;

      case SERIAL_TYPE_INTEGER:
        data = parseInt(data);
        break;

      case SERIAL_TYPE_FLOAT:
        data = parseFloat(data);
        break;

      default:
        throw new TypeError(`Unknown serial type: ${serialType}`);
    }

    return data;
  }

  /**
   * @param {ZenRTCPeer} zenRTCPeer
   */
  constructor(zenRTCPeer) {
    super(zenRTCPeer);

    // TODO: Use read / write sync states to keep track of currently open channels?

    this._dataChannels = {};

    // Bind data receptor
    (() => {
      /**
       * @param {any} rawData
       * @return {void}
       */
      const _handleDataReceived = async rawData => {
        /** @type {Array<string, any> | void} */
        const unpacked = await ZenRTCPeerDataChannelManagerModule.unpack(
          rawData
        );

        if (unpacked) {
          const [channelName, channelData] = unpacked;

          /** @type {DataChannel} */
          const dataChannel = this.getOrCreateDataChannel(channelName);

          this.receiveChannelData(dataChannel, channelData);
        }
      };

      zenRTCPeer.on(EVT_DATA_RECEIVED, _handleDataReceived);

      this.once(EVT_DESTROYED, () =>
        zenRTCPeer.off(EVT_DATA_RECEIVED, _handleDataReceived)
      );
    })();
  }

  /**
   * Sends DataChannel data to other peer.
   *
   * @param {DataChannel} channel
   * @param {any} data
   * @return {void}
   */
  sendChannelData(channel, data) {
    const packed = ZenRTCPeerDataChannelManagerModule.pack(
      channel.getChannelName(),
      data
    );

    if (Array.isArray(packed)) {
      // NOTE: Each chunk is sent via a resolved promise to enable potential
      // interleaving of other requests to prevent them from being blocked
      packed.forEach(
        chunk => new Promise.resolve(() => this._zenRTCPeer.send(chunk))
      );
    } else {
      this._zenRTCPeer.send(packed);
    }
  }

  /**
   * Receives DataChannel data from the other peer.
   *
   * @param {DataChannel} channel
   * @param {any} data
   * @return {void}
   */
  receiveChannelData(channel, data) {
    channel.receive(data);
  }

  /**
   * Creates, or retrieves previous data channel, with the same name.
   *
   * IMPORTANT: This is scoped to the module instance, so multiple module
   * instances with same channel names do not interfere with one another.
   *
   * @param {string} dataChannelName
   * @return {DataChannel}
   */
  getOrCreateDataChannel(dataChannelName) {
    if (this._dataChannels[dataChannelName]) {
      return this._dataChannels[dataChannelName];
    } else {
      // TODO: Ignore data channels which don't belong to this module

      const dataChannel = new DataChannel(this, dataChannelName);

      this._dataChannels[dataChannelName] = dataChannel;

      dataChannel.once(EVT_DESTROYED, () => {
        delete this._dataChannels[dataChannelName];

        this.emit(EVT_DATA_CHANNEL_CLOSED, dataChannel);
      });

      this.once(EVT_DESTROYED, () => {
        dataChannel.destroy();
      });

      this.emit(EVT_DATA_CHANNEL_OPENED, dataChannel);

      return dataChannel;
    }
  }
}

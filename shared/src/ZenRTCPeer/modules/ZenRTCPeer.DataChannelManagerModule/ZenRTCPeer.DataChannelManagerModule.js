import BaseModule, { EVT_DESTROYED } from "../ZenRTCPeer.BaseModule";
import DataChannel from "./DataChannel";
import { logger } from "phantom-core";

// IMPORTANT: Module aliases are not currently supported w/ shared modules,
// hence the full relative path
import getRoughSizeOfObject from "../../../number/getRoughSizeOfObject";

import {
  EVT_DATA_CHANNEL_OPENED,
  EVT_DATA_CHANNEL_CLOSED,
  EVT_DATA_RECEIVED,
} from "./constants";

import fastChunkString from "@shelf/fast-chunk-string";

const MARSHALL_PREFIX = "<z:";
const MARSHALL_SUFFIX = "/>";

const SERIAL_TYPE_STRING = "s";
const SERIAL_TYPE_OBJECT = "o";
const SERIAL_TYPE_INTEGER = "i";
const SERIAL_TYPE_FLOAT = "f";

// Shared across all instances; represents the current chunk batch number; used
// for receiving peer identification of received chunk
let _chunkBatchNumber = -1;

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

    // TODO: Remove
    console.log({
      roughSize: getRoughSizeOfObject(data),
      maxChunkSize,
    });

    // If data is larger than maxChunkSize, break into array of chunks and return the array
    if (getRoughSizeOfObject(data) > maxChunkSize) {
      data = data.toString();

      const rawChunks = fastChunkString(data, {
        size: maxChunkSize,
        unicodeAware: true,
      });

      // Increment chunk batch number
      ++_chunkBatchNumber;

      // Return an array of marshalled strings
      return rawChunks.map((rawChunk, chunkIdx) =>
        ZenRTCPeerDataChannelManagerModule.pack(
          channelName,

          // Wrap rawChunk with extra data to show this is chunked
          JSON.stringify({
            isChunked: true,
            d: rawChunk,
            i: chunkIdx,
            b: _chunkBatchNumber,
          }),

          maxChunkSize
        )
      );
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
    // TODO: Provide unchunking ability, buffering (and not returning) until the inbound message is complete

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

          switch (serialType) {
            case SERIAL_TYPE_STRING:
              data = rawData;
              break;

            case SERIAL_TYPE_OBJECT:
              data = JSON.parse(rawData);
              break;

            case SERIAL_TYPE_INTEGER:
              data = parseInt(rawData);
              break;

            case SERIAL_TYPE_FLOAT:
              data = parseFloat(rawData);
              break;

            default:
              throw new TypeError(`Unknown serial type: ${serialType}`);
          }

          // Stop iterating once we know the data
          break;
        }
      } while (true);

      return [channelName, data];
    }
  }

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
      packed.forEach(chunk => this._zenRTCPeer.send(chunk));
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

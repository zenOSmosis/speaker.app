import BaseModule, { EVT_DESTROYED } from "../ZenRTCPeer.BaseModule";
import DataChannel from "./DataChannel";
import { logger } from "phantom-core";

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
   * @param {number | string | Object | array} data
   * @returns
   */
  static pack(channelName, data = null) {
    if (typeof channelName !== "string") {
      throw new TypeError("channelName must be a string");
    }

    let isObject = false;

    const serialType = ZenRTCPeerDataChannelManagerModule.getSerialType(data);

    if (serialType === SERIAL_TYPE_OBJECT) {
      isObject = true;
      data = JSON.stringify(data);
    }

    return `${MARSHALL_PREFIX}${channelName},${serialType},${data}${MARSHALL_SUFFIX}`;
  }

  /**
   * Unmarshalls channel data received from other peer.
   *
   * If not able to unmarshall data, it will return void.
   *
   * @param {string} rawData
   * @return {Array[channelName: string, channelData: number | string | Object | Array] | void}
   */
  static unpack(rawData) {
    // TODO: Provide unchunking ability, buffering (and not returning) until the inbound message is complete
    // IMPORTANT: We can't assume the received packs will be in order, so we need to force them to be in order

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
      let type = null;
      let data = null;

      // Iterate over each character
      let i = -1;
      do {
        // Stop iterating once we have parsed data
        /*
        if (data) {
          break;
        }
        */

        ++i;

        const char = rawData[i];

        if (char !== ",") {
          channelName += rawData[i];
        } else {
          // TODO: Document
          type = rawData[i + 1];

          // TODO: Document
          rawData = rawData.substr(i + 3);

          switch (type) {
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
              throw new TypeError(`Unknown serial type: ${type}`);
          }

          // TODO: Document why this works
          break;
        }
      } while (true);

      return [channelName, data];
    }
  }

  constructor(zenRTCPeer) {
    super(zenRTCPeer);

    // TODO: Use read/write sync states to keep track of currently open channels?

    this._dataChannels = {};

    // Bind data receptor
    (() => {
      /**
       * @param {Object} param TODO: Document
       * @return {void}
       */
      const _handleDataReceived = rawData => {
        const unpacked = ZenRTCPeerDataChannelManagerModule.unpack(rawData);

        if (unpacked) {
          const [channelName, channelData] = unpacked;

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
   */
  sendChannelData(channel, data) {
    this._zenRTCPeer.send(
      ZenRTCPeerDataChannelManagerModule.pack(channel.getChannelName(), data)
    );
  }

  /**
   * Receives DataChannel data from the other peer.
   *
   * @param {DataChannel} channel
   * @param {any} data
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

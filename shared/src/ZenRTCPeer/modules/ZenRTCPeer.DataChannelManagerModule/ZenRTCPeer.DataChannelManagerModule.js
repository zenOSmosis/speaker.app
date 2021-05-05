import BaseModule, { EVT_DESTROYED } from "../ZenRTCPeer.BaseModule";
import DataChannel from "./DataChannel";

import {
  EVT_DATA_CHANNEL_OPENED,
  EVT_DATA_CHANNEL_CLOSED,
  EVT_DATA_RECEIVED,
} from "./constants";

const MARSHAL_PREFIX = "<z:";
const MARSHAL_SUFFIX = "/>";

/**
 * Manages the creation and multiplexing / distribution of data across multiple
 * DataChannel instances.
 */
export default class ZenRTCPeerDataChannelManagerModule extends BaseModule {
  /**
   * Marshals data for transmission to other peer.
   *
   * @param {string} channelName
   * @param {number | string | Object | Array} data
   * @returns
   */
  static pack(channelName, data = null) {
    if (typeof channelName !== "string") {
      throw new TypeError("channelName must be a string");
    }

    let isObject = false;

    let type = isNaN(data) ? typeof data : Number.isInteger(data) ? "i" : "f";

    if (type === "object") {
      isObject = true;
      data = JSON.stringify(data);
    }

    return `${MARSHAL_PREFIX}${channelName},${type[0]},${data}${MARSHAL_SUFFIX}`;
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
    if (typeof rawData !== "string") {
      rawData = rawData.toString();
    }

    if (
      rawData.startsWith(MARSHAL_PREFIX) &&
      rawData.endsWith(MARSHAL_SUFFIX)
    ) {
      rawData = rawData.substr(MARSHAL_PREFIX.length);
      rawData = rawData.substr(0, rawData.length - MARSHAL_SUFFIX.length);

      let channel = "";
      let type = null;
      let data = null;

      let i = -1;

      do {
        ++i;

        const char = rawData[i];

        if (char !== ",") {
          channel += rawData[i];
        } else {
          type = rawData[i + 1];

          rawData = rawData.substr(i + 3);

          switch (type) {
            case "s":
              data = rawData;
              break;

            case "o":
              data = JSON.parse(rawData);
              break;

            case "i":
              data = parseInt(rawData);
              break;

            case "f":
              data = parseFloat(rawData);
              break;

            default:
              throw new TypeError(`Unknown type: ${type}`);
          }

          break;
        }
      } while (true);

      return [channel, data];
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

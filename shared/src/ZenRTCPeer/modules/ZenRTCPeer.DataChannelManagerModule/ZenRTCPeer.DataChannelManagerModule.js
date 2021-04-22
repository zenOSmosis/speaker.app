import BaseModule, { EVT_DESTROYED } from "../ZenRTCPeer.BaseModule";
import DataChannel from "./DataChannel";

import {
  EVT_DATA_CHANNEL_OPENED,
  EVT_DATA_CHANNEL_CLOSED,
  EVT_DATA_RECEIVED,
} from "./constants";

/**
 * Manages the creation and multiplexing / distribution of data across multiple
 * DataChannel instances.
 */
export default class ZenRTCPeerDataChannelManagerModule extends BaseModule {
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
      const _handleDataReceived = (data) => {
        try {
          // FIXME: This is probably highly inefficient...
          const parsedData = JSON.parse(data);

          const [channelName, channelData] = parsedData;

          if (channelData) {
            const dataChannel = this.getOrCreateDataChannel(channelName);

            this.receiveChannelData(dataChannel, channelData);
          }
        } catch (err) {
          // Errors here are intentionally ignored due to "try" block detecting
          // if the passed data string is valid JSON
          //
          // Perhaps a different approach could be creating a getIsJSON(str)
          // function which just wraps the JSON.parse statement itself
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
    this._zenRTCPeer.send([channel.getChannelName(), data]);
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

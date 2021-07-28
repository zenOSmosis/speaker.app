import PhantomCore from "phantom-core";

import { EVT_DATA_RECEIVED } from "./constants";

/**
 * NOTE: At the time of writing, simple-peer does not support multiple data
 * channels.  By using this class we can do multiplexing to start with, and
 * then switch to WebRTC data channels under the hood without changing the API.
 * @see https://github.com/feross/simple-peer/pull/694
 *
 * The bulk of the work is handled via DataChannelManagerModule.
 */
export default class DataChannel extends PhantomCore {
  // static doesChannelExistForOtherManager(dataChannel, dataChannelManager) {}

  constructor(dataChannelManagerModule, channelName) {
    super();

    this._dataChannelManagerModule = dataChannelManagerModule;
    this._channelName = channelName;
  }

  /**
   * @return {string}
   */
  getChannelName() {
    return this._channelName;
  }

  /**
   * @return {DataChannelManagerModule}
   */
  getDataChannelManager() {
    return this._dataChannelManagerModule;
  }

  /**
   * @param {string | ArrayBufferLike | Blob | ArrayBufferView} data
   */
  send(data) {
    this._dataChannelManagerModule.sendChannelData(this, data);
  }

  /**
   * Internally called when there is received data.
   *
   * This can be completely overridden or listened to via EVT_DATA_RECEIVED
   * event.
   *
   * @param {string | ArrayBufferLike | Blob | ArrayBufferView} data
   */
  receive(data) {
    this.emit(EVT_DATA_RECEIVED, data);
  }
}

import PhantomCore, { EVT_DESTROYED } from "phantom-core";
import { SOCKET_EVT_ZENRTC_SIGNAL } from "../socketEvents";

export { EVT_DESTROYED };

// "to" or "from" node
// export const BACKEND_SERVICE_ENTITY = "backend-service-entity";
// export const CONTROLLER_SERVICE_ENTITY = "controller-service-entity";
// export const CHROME_SERVICE_ENTITY = "chrome-service-entity";
// export const VIRTUAL_SERVER_SERVICE_ENTITY = "virtual-server-service-entity";
// export const WEB_SERVICE_ENTITY = "web-service-entity";

// TODO: Rename?  This is confusing when mixing w/ ZenRTC's EVT_ZENRTC_SIGNAL
export const EVT_MESSAGE_RECEIVED = "message-received";

// TODO: Rename?
export { SOCKET_EVT_ZENRTC_SIGNAL };

// TODO: Document
// Given the set of parameters passed to the constructor, implementation must figure out how to handle the routing
export default class ZenRTCSignalBroker extends PhantomCore {
  constructor({
    socketIdFrom,

    // TODO: Keep these as optional?
    socketIdTo = null,
    realmId = null,
    channelId = null,
  }) {
    if (typeof socketIdFrom !== "string") {
      throw new TypeError("socketIdFrom is not set or not a string");
    }

    // TODO: Uncomment conditionals?
    /*
    if (typeof socketIdTo !== "string") {
      throw new TypeError("socketIdTo is not set or not a string");
    }

    if (typeof realmId !== "string") {
      throw new TypeError("realmId is not set or not a string");
    }

    if (typeof channelId !== "string") {
      throw new TypeError("channelId is not set or not a string");
    }
    */

    super();

    this._socketIdFrom = socketIdFrom;
    this._socketIdTo = socketIdTo;
    this._realmId = realmId;
    this._channelId = channelId;
    this._signalBrokerIdFrom = this.getUUID();
  }

  /**
   * @param {Object} message // TODO: Document
   * @return {Promise<void>}
   */
  async sendMessage(message) {
    // TODO: Replace with socket.io event send?
    throw new Error("sendMessage must be overridden");
  }

  /**
   * @param {Object} message TODO: Document
   * @return {Promise<void>}
   */
  async receiveMessage(message) {
    // TODO: use class logger
    this.log.debug("receiveMessage", {
      message,
      from: this._socketIdFrom || (message && message.socketIdFrom),
    });

    this.emit(EVT_MESSAGE_RECEIVED, message);
  }
}

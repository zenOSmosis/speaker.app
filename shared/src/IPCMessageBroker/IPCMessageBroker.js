import PhantomCore, { EVT_DESTROYED } from "phantom-core";
import { SOCKET_EVT_IPC_MESSAGE } from "../socketEvents";

export { EVT_DESTROYED };

// "to" or "from" node
// export const BACKEND_SERVICE_ENTITY = "backend-service-entity";
// export const CONTROLLER_SERVICE_ENTITY = "controller-service-entity";
// export const CHROME_SERVICE_ENTITY = "chrome-service-entity";
// export const TRANSCODER_SERVICE_ENTITY = "transcoder-service-entity";
// export const WEB_SERVICE_ENTITY = "web-service-entity";

export const EVT_READY = "ready";
export const EVT_READY_STATE_CHANGED = "ready-state-changed";

export const EVT_MESSAGE_RECEIVED = "message-received";

export const TYPE_WEB_IPC_MESSAGE = SOCKET_EVT_IPC_MESSAGE;
export const TYPE_WEB_RTC_SIGNAL = "web-rtc-signal";

// TODO: Document
// Given the set of parameters passed to the constructor, implementation must figure out how to handle the routing
export default class IPCMessageBroker extends PhantomCore {
  constructor({
    socketIoIdFrom,
    socketIoIdTo = null,
    realmId = null,
    channelId = null,
  }) {
    super();

    this._socketIoIdFrom = socketIoIdFrom;
    this._socketIoIdTo = socketIoIdTo;
    this._realmId = realmId;
    this._channelId = channelId;

    this._isReady = false;
    this._isDestroyed = false;
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
      from: this._socketIoIdFrom || (message && message.socketIoIdFrom),
    });

    this.emit(EVT_MESSAGE_RECEIVED, message);
  }
}

import PhantomCore, { EVT_DESTROYED } from "phantom-core";
import { SOCKET_EVT_ZENRTC_SIGNAL } from "../socketEvents";

export const EVT_ZENRTC_SIGNAL = "zenrtc-signal";

export { EVT_DESTROYED, SOCKET_EVT_ZENRTC_SIGNAL };

/**
 * @typedef {Object} ZenRTCSignalBrokerProps
 * @property {string} socketIdFrom The socket ID (Socket.io) from the peer the
 * signal broker instance is associated with. The remote end will use this
 * socket ID as socketIdTo to route messages back to this peer.
 * @property {string} socketIdTo? [default = null] The socket ID for the remote
 * peer.
 * @property {string} realmId? [default = null] The network realm ID, utilized
 * for signal routing.
 * @property {string} channelId? [default = null] The network channel ID,
 * utilized for signal routing.
 */

/**
 * Establishes a pathway between two peers for ZenRTC signaling.
 *
 * Various extensions of this utility use a combination of socketIdFrom/To and
 * signalIdFrom/To to handle multiplexing within a browser, so that the signal
 * can reach the correct ZenRTCPeer instance.
 *
 * IMPORTANT: Given the set of parameters passed to the constructor, the
 * implementation must figure out how to handle the routing.
 */
export default class ZenRTCSignalBroker extends PhantomCore {
  /**
   * @param {ZenRTCSignalBrokerProps} props
   */
  constructor({
    socketIdFrom,

    // IMPORTANT: These are kept optional because the BackendZenRTCSignalBroker
    // extension is persistent across socket connections and these are
    // populated per message there
    socketIdTo = null,
    realmId = null,
    channelId = null,
  }) {
    // Required property
    if (typeof socketIdFrom !== "string") {
      throw new TypeError("socketIdFrom is not set or not a string");
    }

    // Optional property
    if (socketIdTo && typeof socketIdTo !== "string") {
      throw new TypeError("socketIdTo is not a string");
    }

    // Optional property
    if (realmId && typeof realmId !== "string") {
      throw new TypeError("realmId is not a string");
    }

    // Optional property
    if (channelId && typeof channelId !== "string") {
      throw new TypeError("channelId is not a string");
    }

    super();

    this._socketIdFrom = socketIdFrom;
    this._socketIdTo = socketIdTo;
    this._realmId = realmId;
    this._channelId = channelId;

    // Used for routing within a browser to a particular ZenRTCPeer instance
    this._signalBrokerIdFrom = this.getUUID();
  }

  /**
   * @param {Object} data // TODO: Document
   * @return {Promise<void>}
   */
  async signal(data) {
    // TODO: Replace with socket.io event send?
    throw new Error("signal must be overridden");
  }

  /**
   * @param {Object} data TODO: Document
   * @return {Promise<void>}
   */
  async receiveSignal(data) {
    this.log.debug("receiveSignal", {
      data,
      from: this._socketIdFrom || (data && data.socketIdFrom),
    });

    this.emit(EVT_ZENRTC_SIGNAL, data);
  }
}

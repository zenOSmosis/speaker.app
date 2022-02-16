import ZenRTCSignalBroker, {
  SOCKET_EVT_ZENRTC_SIGNAL,
} from "../shared/ZenRTCSignalBroker";
import NetworkController from "../NetworkController";

/**
 * @typedef {import('socket.io').Server} Server
 */

export { SOCKET_EVT_ZENRTC_SIGNAL };

/**
 * @typedef {Object} BackendZenRTCSignalBrokerProps
 * @property {Server} io Constructed Socket.io server
 * (@link https://socket.io/docs/v4/server-api/)
 * @property {socketIdFrom} string
 */

/**
 * Acts as a proxy for client-based ZenRTCSignalBroker extensions can
 * communicate with each other outside of a ZenRTC connection.
 *
 * It is also used for signaling to help establish a ZenRTC connection.
 */
export default class BackendZenRTCSignalBroker extends ZenRTCSignalBroker {
  /**
   * @param {BackendZenRTCSignalBrokerProps} props
   */
  constructor({ io, socketIdFrom }) {
    super({ socketIdFrom });

    this._io = io;

    this._networkController = new NetworkController();

    this.registerCleanupHandler(() => {
      // IMPORTANT: The network controller shouldn't be shut down as it is a
      // singleton, so we're just disassociating it
      this._networkController = null;
    });
  }

  /**
   * @param {Object} data TODO: Document structure
   * @return {Promise<void>}
   */
  async signal({ realmId, channelId, socketIdTo, ...rest }) {
    // TODO: Handle errors

    const socketIdFrom = this._socketIdFrom;

    if (!socketIdTo) {
      socketIdTo = await this._networkController.fetchVirtualServerSocketId({
        realmId,
        channelId,
      });
    }

    this.log.debug(
      `${this.constructor.name} proxying message from ${socketIdFrom} to ${socketIdTo}`
    );

    // Proxy to receiver Socket.io peer
    this._io.to(socketIdTo).emit(SOCKET_EVT_ZENRTC_SIGNAL, {
      realmId,
      channelId,
      socketIdFrom,
      socketIdTo,
      ...rest,
    });
  }
}

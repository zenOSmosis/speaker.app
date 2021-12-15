import ZenRTCSignalBroker, {
  SOCKET_EVT_ZENRTC_SIGNAL,
} from "../shared/ZenRTCSignalBroker";
import NetworkController from "../NetworkController";

export { SOCKET_EVT_ZENRTC_SIGNAL };

/**
 * Works as a ZenRTCSignalBroker proxy between socket.io peers.
 */
export default class BackendZenRTCSignalBroker extends ZenRTCSignalBroker {
  // TODO: Document
  constructor({ realmId, channelId, io, ...rest }) {
    super({ realmId, channelId, ...rest });

    this._io = io;

    this._networkController = new NetworkController();

    this.registerShutdownHandler(() => {
      // IMPORTANT: The network controller shouldn't be shut down as it is a
      // singleton, so we're just disassociating it
      this._networkController = null;
    });
  }

  /**
   * @return {Promise<void>}
   */
  async signal({
    realmId = this._realmId,
    channelId = this._channelId,
    socketIdFrom = this._socketIdFrom,
    socketIdTo = null,
    ...rest
  }) {
    // TODO: Handle errors

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

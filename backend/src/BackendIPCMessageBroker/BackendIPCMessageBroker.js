import IPCMessageBroker, {
  TYPE_WEB_IPC_MESSAGE,
} from "../shared/IPCMessageBroker";
import NetworkController from "../NetworkController";

export { TYPE_WEB_IPC_MESSAGE };

/**
 * Works as a IPCMessageBroker proxy between socket.io peers.
 */
export default class BackendIPCMessageBroker extends IPCMessageBroker {
  // TODO: Document
  constructor({ realmId, channelId, io, ...rest }) {
    super({ realmId, channelId, ...rest });

    this._io = io;
    this._networkController = new NetworkController();
  }

  /**
   * @return {Promise<void>}
   */
  async sendMessage({
    realmId = this._realmId,
    channelId = this._channelId,
    socketIdFrom = this._socketIdFrom,
    socketIdTo = null,
    ...rest
  }) {
    // TODO: Handle errors

    if (!socketIdTo) {
      socketIdTo = await this._networkController.fetchTranscoderSocketId({
        realmId,
        channelId,
      });
    }

    this.log.debug(
      `${this.constructor.name} proxying message from ${socketIdFrom} to ${socketIdTo}`
    );

    // Proxy to receiver Socket.io peer
    this._io.to(socketIdTo).emit(TYPE_WEB_IPC_MESSAGE, {
      realmId,
      channelId,
      socketIdFrom,
      socketIdTo,
      ...rest,
    });
  }
}

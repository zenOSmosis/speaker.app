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
  constructor({ realmID, channelID, io, ...rest }) {
    super({ realmID, channelID, ...rest });

    this._io = io;
    this._networkController = new NetworkController();
  }

  /**
   * @return {Promise<void>}
   */
  async sendMessage({
    realmID = this._realmID,
    channelID = this._channelID,
    socketIDFrom = this._socketIDFrom,
    socketIDTo = null,
    ...rest
  }) {
    // TODO: Handle errors

    if (!socketIDTo) {
      socketIDTo = await this._networkController.fetchTranscoderSocketId({
        realmID,
        channelID,
      });
    }

    this.log.debug(
      `${this.constructor.name} proxying message from ${socketIDFrom} to ${socketIDTo}`
    );

    // Proxy to receiver Socket.io peer
    this._io.to(socketIDTo).emit(TYPE_WEB_IPC_MESSAGE, {
      realmID,
      channelID,
      socketIDFrom,
      socketIDTo,
      ...rest,
    });
  }
}

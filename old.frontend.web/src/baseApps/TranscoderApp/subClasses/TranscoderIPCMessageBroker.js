import IPCMessageBroker, {
  TYPE_WEB_IPC_MESSAGE,
} from "@shared/IPCMessageBroker";

export { TYPE_WEB_IPC_MESSAGE };

export default class TranscoderIPCMessageBroker extends IPCMessageBroker {
  constructor({ socketIoIdTo, socket, ...rest }) {
    super({ socketIoIdTo, ...rest });

    this._socket = socket;
    this._initiatorSocketIoId = socketIoIdTo;
  }

  sendMessage(data) {
    this.log.debug("sending message", {
      data,
      to: this._initiatorSocketIoId,
    });

    this._socket.emit(TYPE_WEB_IPC_MESSAGE, {
      realmId: this._realmId,
      channelId: this._channelId,
      socketIoIdTo: this._initiatorSocketIoId,
      socketIoIdFrom: this._socket.id,
      ...data,
    });
  }
}

import IPCMessageBroker, {
  BACKEND_SERVICE_ENTITY,
  CHROME_SERVICE_ENTITY,
  // EVT_DESTROYED,
  // EVT_MESSAGE_RECEIVED,
  TYPE_WEB_IPC_MESSAGE,
} from "../shared/IPCMessageBroker";
import WebSocket from "ws";

const { HEADLESS_CHROME_SESSION_CONTROLLER_WS_URL, CPU_NO } = process.env;

/**
 * Handles communication between socket.io and WS Chrome controller.
 */
export default class WSIPCMessageBroker extends IPCMessageBroker {
  /**
   * Initiates Socket.io binding into WSIPCMessageBroker.
   *
   * Note: This should only be run once per OS thread. Each Socket.io
   * connection the thread handles is handled internally.
   *
   * @param {SocketIO.Server} io Socket.io io object. TODO: Not sure of this type.
   */
  /*
  static initWithSocketIo(io) {
    io.on("connect", (socket) => {
      // TODO: Remove; TODO: Obtain IP address and other details here?
      console.log({
        socketHandshake: socket.handshake,
      });

      console.log(`Socket.io client connected with id ${socket.id}`);

      // Only one per socket connection
      let WSIPCMessageBroker;

      // TODO: Handle
      socket.on("transcoder-capable", (data) => {
        console.log("transcoder-capable", data);
      });

      socket.on(TYPE_WEB_IPC_MESSAGE, async (req, ack) => {
        const { realmID, channelID, ...rest } = req;

        if (!WSIPCMessageBroker) {
          // TODO: Use cached session
          // TODO: Enforce same realm / channel combination for the duration of the socket session
          WSIPCMessageBroker = new WSIPCMessageBroker({
            realmID,
            channelID,
            socket,
          });
        } else {
          if (
            WSIPCMessageBroker.getRealmId() !== realmID ||
            WSIPCMessageBroker.getChannelId() !== channelID
          ) {
            // TODO: Raise error
            ack({
              error:
                "Realm / Channel not associated with this Socket.io session",
            });

            return;
          }
        }

        await WSIPCMessageBroker.sendMessage({
          socketID: socket.id,
          ...rest,
        });

        // TODO: If ack is set, set up response listener in message
        if (typeof ack === "function") {
          ack("Sent");
        }
      });

      socket.on("disconnect", () => {
        console.log(`Socket.io client disconnected with id ${socket.id}`);

        if (WSIPCMessageBroker) {
          WSIPCMessageBroker.destroy();
        }
      });
    });
  }
  */

  constructor({ realmID, channelID, socket, ...rest }) {
    super({ realmID, channelID, ...rest });

    this._wsChromeController = null;
    this._socket = socket;

    this._connectChromeController();
  }

  /**
   * Connects to headless_chrome_session_controller via a WebSocket connection
   * and binds it to this class.
   */
  _connectChromeController = () => {
    if (this._wsChromeController) {
      console.warn(
        `${this.constructor.name} wsChromeController already connected on CPU #${CPU_NO}`
      );
      return;
    }

    this._setIsReady(false);

    this._wsChromeController = new WebSocket(
      HEADLESS_CHROME_SESSION_CONTROLLER_WS_URL
    );

    this._wsChromeController.on("open", () => {
      console.log(
        `${this.constructor.name} wsChromeController connected on CPU #${CPU_NO}`
      );

      this._setIsReady(true);
    });

    this._wsChromeController.on("message", data => {
      const message = JSON.parse(data);

      this.receiveMessage(message);
    });

    // Re-connect on disconnect
    this._wsChromeController.on("close", () => {
      this._wsChromeController = null;

      if (!this._isDestroyed) {
        console.log(
          `${this.constructor.name} wsChromeController reconnecting on CPU #${CPU_NO}`
        );

        this._connectChromeController();
      }
    });
  };

  /**
   * @return {Promise<void>}
   */
  async sendMessage({
    realmID = this._realmID,
    channelID = this._channelID,
    serviceEntityTo = CHROME_SERVICE_ENTITY,
    serviceEntityFrom = BACKEND_SERVICE_ENTITY,
    socketID,
    messageId,
    messageData,
    ...rest
  }) {
    // TODO: Use configurable logger
    console.log(`${this.constructor.name} sending message`, {
      realmID,
      channelID,
      serviceEntityTo,
      serviceEntityFrom,
      // socketID,
      // messageId,
      // messageData,
      // ...rest,
    });

    // Don't try to send the message until connected to Chrome controller
    // server
    await this.onceReady();

    switch (serviceEntityTo) {
      case CHROME_SERVICE_ENTITY:
        // TODO: If not connected, store message in queue(?)

        // Send the message over WebSocket to Chrome controller
        this._wsChromeController.send(
          JSON.stringify({
            realmID,
            channelID,
            serviceEntityTo,
            serviceEntityFrom,
            socketID,
            messageId,
            messageData,
            ...rest,
          })
        );
        break;

      default:
        throw new Error(`Unhandled serviceEntityTo "${serviceEntityTo}"`);
    }
  }

  /**
   * Internally called when Chrome controller emits a message.
   *
   * @return {Promise<void>}
   */
  async receiveMessage(message) {
    this._socket.emit(TYPE_WEB_IPC_MESSAGE, message);

    super.receiveMessage(message);
  }

  /**
   * Closes the WebSocket connection with the controller, and shuts down the
   * message broker.
   *
   * @return {Promise<void>}
   */
  async destroy() {
    if (this._wsChromeController) {
      this._wsChromeController.close();
    }

    super.destroy();
  }
}

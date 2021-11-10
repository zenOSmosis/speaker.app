import IPCMessageBroker, {
  WEB_SERVICE_ENTITY,
  CHROME_SERVICE_ENTITY,
  EVT_MESSAGE_RECEIVED,
} from "../shared/IPCMessageBroker";
import ChromeZenRTCPeer from "../ChromeZenRTCPeer";

export { EVT_MESSAGE_RECEIVED };

let _instance = null;

/**
 * IMPORTANT: This should be treated as a singleton.
 *
 * Note: (jh) I didn't implement a required singleton pattern at the moment,
 * but it should be considered as one.
 */
export default class ChromeIPCMessageBroker extends IPCMessageBroker {
  /**
   * @return {ChromeIPCMessageBroker}
   */
  getInstance() {
    return _instance;
  }

  /**
   * @param {string} realmID
   * @param {string} channelID
   */
  constructor({ realmID, channelID }) {
    // Prevent more than one instance here
    if (_instance) {
      throw new Error(
        "ChromeIPCMessageBroker is already initiated for this thread"
      );
    }

    super({ realmID, channelID });

    _instance = this;
  }

  async sendMessage(message) {
    const {
      serviceEntityTo = WEB_SERVICE_ENTITY,
      serviceEntityFrom = CHROME_SERVICE_ENTITY,
      ...rest
    } = message;

    await window.__sendControllerMessage({
      serviceEntityTo,
      serviceEntityFrom,
      ...rest,
    });

    super.sendMessage(message);
  }

  async receiveMessage(message) {
    const { socketID /* type, signal, ...rest */ } = message;

    try {
      if (ChromeZenRTCPeer.getInstanceWithSocketID(socketID)) {
        // TODO: Remove
        /*
        console.log(
          `Found existing ChromeZenRTCPeer with socketID "${socketID}"`
        );
        */
      } else {
        new ChromeZenRTCPeer({
          ipcMessageBroker: this,
          socketID,
          realmID: this._realmID,
          channelID: this._channelID,
        });
      }

      super.receiveMessage(message);
    } catch (err) {
      // TODO: Route errors up to controller
      console.error(err.message);
    }
  }
}

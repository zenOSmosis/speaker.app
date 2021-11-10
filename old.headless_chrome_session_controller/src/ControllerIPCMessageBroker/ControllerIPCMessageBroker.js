import IPCMessageBroker, {
  // BACKEND_SERVICE_ENTITY,
  // CONTROLLER_SERVICE_ENTITY,
  CHROME_SERVICE_ENTITY,
  EVT_DESTROYED,
} from "../shared/IPCMessageBroker";
import WebSocket from "ws";
import puppeteer from "puppeteer-core";

// Controller is single-threaded
const _instances = {};

/**
 * Chrome, sessions, WS API...
 *
 * This should proxy like so:
 *   - backend <=> controller <=> chrome
 */
export default class ControllerIPCMessageBroker extends IPCMessageBroker {
  /**
   * @param {{realmID: string | number, channelID: string | number}} config
   * @return {ControllerIPCMessageBroker}
   */
  static getOrCreateInstance({ realmID, channelID }) {
    const instanceKey = ControllerIPCMessageBroker.getInstanceKey({
      realmID,
      channelID,
    });

    if (_instances[instanceKey]) {
      return _instances[instanceKey];
    } else {
      return new ControllerIPCMessageBroker({
        realmID,
        channelID,
      });
    }
  }

  /**
   * Retrieves _instances key for caching.
   *
   * This is specifically used for internal caching.
   *
   * @param {{realmID: string | number, channelID: string | number}} config
   * @return {string}
   */
  static getInstanceKey({ realmID, channelID }) {
    return `${realmID}-${channelID}`;
  }

  constructor({ realmID, channelID }) {
    const _instanceKey = ControllerIPCMessageBroker.getInstanceKey({
      realmID,
      channelID,
    });

    if (_instances[_instanceKey]) {
      // TODO: Expand upon this error
      throw new Error(
        "Already a ControllerIPCMessageBroker instance with realm and channel"
      );
    }

    super({ realmID, channelID });

    // TODO: Adjust accordingly
    this.setMaxListeners(100);

    this._instanceKey = _instanceKey;
    this._page = null;

    this._wsInstances = {};

    this._initPuppeteer();

    _instances[this._instanceKey] = this;

    // Delete from instances on destruct
    this.once(EVT_DESTROYED, () => {
      delete _instances[this._instanceKey];
    });
  }

  /**
   * Initialize Puppeteer, which controls the headless Chrome instance via a
   * WebSocket connection managed internally by Puppeteer.
   *
   * Note: This WebSocket connection is separate from our own managed connection
   * to the backend.
   *
   * @see https://pptr.dev/#?product=Puppeteer&version=v5.2.1&show=api-overview
   *
   * @return {Promise<void>}
   */
  async _initPuppeteer() {
    if (this._isInitStarted) {
      console.warn("Puppeteer init has already started");

      return;
    }

    this._isInitStarted = true;
    // Chrome handling
    // TODO: Finish implementing
    const { PUPPETEER_BROWSER_WS_ENDPOINT, PUPPETEER_BROWSER_PAGE_URL } =
      process.env;

    this._browser = await puppeteer.connect({
      // For debugging; wait for manual resume interaction
      // browserWSEndpoint: `${browserWSEndpoint}?pause`,

      browserWSEndpoint: PUPPETEER_BROWSER_WS_ENDPOINT,
      ignoreHTTPSErrors: true,
    });
    const browser = this._browser;

    /*
    const context = browser.defaultBrowserContext();
    context.clearPermissionOverrides();
    context.overridePermissions(url.origin, ['system.memory']);
    */

    this._page = await browser.newPage();
    const page = this._page;

    await page.setJavaScriptEnabled(true);

    // TODO: Clean up handling
    page.on("close", () => console.log("page closed...."));

    // TODO: Clean up handling
    page.on("console", msg => {
      const data = msg.text();

      const logPrefix = "Headless Chrome Log Emit:";

      try {
        const sample = JSON.parse(data);
        console.log(logPrefix, sample);
      } catch (err) {
        console.log(logPrefix, data);
      }
    });

    page.on("error", function (error) {
      // TODO: Emit up

      console.error(error);
    });

    await page.goto(PUPPETEER_BROWSER_PAGE_URL);

    const realmID = this._realmID;
    const channelID = this._channelID;

    // Set up message broker w/ Chrome
    await page.evaluate(
      ({ realmID, channelID }) => {
        // Set up global chromeIPC handler in Chrome
        //
        // TODO: Debug why this sometimes "resets" on that page, losing its
        // stored value,
        //
        // It seems to lose state, "sometimes" when doing hot-module-
        // reloading in the headless_chrome_app, but not all the time.
        // TODO: Use constant here
        window.__chromeIPC = new window.__ChromeIPCMessageBroker({
          realmID,
          channelID,
        });
      },
      { realmID, channelID }
    );

    // TODO: Set up interface for Chrome to be able to post back here
    await page.exposeFunction("__sendControllerMessage", async message => {
      await this.receiveMessage(message);
    });

    this._setIsReady(true);

    // TODO: Close puppeteer page on disconnect
    // browser.close();
  }

  async sendMessage({
    serviceEntityTo,
    serviceEntityFrom,
    socketID,
    messageId,
    messageData,
    ...rest
  }) {
    await this.untilReady();

    switch (serviceEntityTo) {
      /*
      case BACKEND_SERVICE_ENTITY:
        // Chrome -> Controller -> Backend
        break;
      */

      /*
      case CONTROLLER_SERVICE_ENTITY:
        // Backend -> Controller -> Backend

        // TODO: Provide loopback interface by default, for testing
        // Swap serviceEntityTo and serviceEntityFrom
        break;
      */

      case CHROME_SERVICE_ENTITY:
        // Backend -> Controller -> Chrome

        await this._page.evaluate(
          sendMessageParams => {
            // TODO: Validate this object exists, and if not, handle it accordingly...
            //  - Do we re-instantiate or emit an error?

            if (window.__chromeIPC && window.__chromeIPC.receiveMessage) {
              window.__chromeIPC.receiveMessage(sendMessageParams);
            } else {
              //TODO: Re-instantiate window.__chromeIPC
              console.error("No __chromeIPC object");
            }
          },
          {
            serviceEntityTo,
            serviceEntityFrom,
            socketID,
            messageId,
            messageData,
            ...rest,
          }
        );

        break;

      default:
        // Silently fail
        console.error(`Unhandled serviceEntityTo "${serviceEntityTo}"`);
    }
  }

  /**
   * Receives messages from headless Chrome browser and sends them out the
   * WebSocket connection to the backend.
   *
   * @param {Object} message TODO: Document
   */
  async receiveMessage(message) {
    const { socketID } = message;

    // TODO: Remove
    // console.log("receiving message", message);

    const ws = this.getWSInstanceWithSocketID(socketID);

    if (ws) {
      ws.send(JSON.stringify(message));
    } else {
      console.warn(
        `No ws available in ${this.constructor.name} receiveMessage call`
      );
    }
  }

  /**
   * Associates a WebSocket API interface instance for communicating to
   * backend.
   *
   * @param {WebSocket} ws
   * @param {string} socketID
   */
  addWSInstance(ws, socketID) {
    this._wsInstances[socketID] = ws;
  }

  /**
   * Disassociates a WebSocket API interface instance for communicating to
   * backend.
   *
   * @param {string} socketID
   */
  removeWSInstanceWithSocketID(socketID) {
    delete this._wsInstances[socketID];
  }

  /**
   * Utilized for communication with other WebSocket instances.
   *
   * @param {string} socketID
   */
  getWSInstanceWithSocketID(socketID) {
    return this._wsInstances[socketID];
  }

  /**
   * Returns total number of WebSocket API interface instances associated with
   * backend.
   *
   * @return {number}
   */
  getWsCount() {
    return Object.keys(this._wsInstances).length;
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    if (this._browser) {
      await this._browser.close();
    }

    super.destroy();
  }
}

// Initialize Bridge-facing WebSocket interface
// TODO: Move this within the class(?)
(() => {
  const {
    WS_LISTEN_PORT,
    PUPPETEER_BROWSER_WS_ENDPOINT: browserWSEndpoint,
    PUPPETEER_BROWSER_PAGE_URL: browserPageUrl,
  } = process.env;

  const wss = new WebSocket.Server({
    port: WS_LISTEN_PORT,
  });

  wss.on("connection", ws => {
    console.log("wss connected");

    // Each connection can only have a reference to one controller
    let controller = null;

    // API calls from backend
    ws.on("message", async data => {
      const messagePacket = JSON.parse(data);

      // TODO: Remove
      // console.log("received message packet from backend", messagePacket);

      const { realmID, channelID, socketID, ...rest } = messagePacket;

      if (!controller) {
        // Ensure that subsequent backend WebSocket connections reach to the same
        // Chrome session.
        controller = ControllerIPCMessageBroker.getOrCreateInstance({
          realmID,
          channelID,
        });

        // Associate this WebSocket connection to the controller
        controller.addWSInstance(ws, socketID);

        // Cleanup handling
        (() => {
          // Executes once controller is destroyed
          const _destroyHandler = () => {
            ws.close();
          };

          // TODO: Set up destroy handler
          controller.once(EVT_DESTROYED, _destroyHandler);

          ws.once("close", () => {
            console.log("WebSocket closed");

            // Disassociate this WebSocket connection from the controller
            controller.removeWSInstanceWithSocketID(socketID);

            controller.off(EVT_DESTROYED, _destroyHandler);

            const lenRemainingWsCount = controller.getWsCount();

            // If this is the last connected WebSocket to this instance, destroy it
            if (!controller.getWsCount()) {
              console.log(
                "No WebSocket instances left. Destroying controller."
              );

              controller.destroy();
            }
          });
        })();
      }

      await controller.sendMessage({ socketID, ...rest });
    });
  });
})();

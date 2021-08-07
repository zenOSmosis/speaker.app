import PhantomCore, { EVT_DESTROYED } from "phantom-core";

export const ROLE_MAIN_APP = "main-app";
export const ROLE_TRANSCODER_APP = "transcoder-app";

// Events passed from main app to transcoder app
export const MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION =
  "init-transcoder-connection";

// Events passed from transcoder app to main app
export const TRANSCODER_EVT_READY = "ready";
export const TRANSCODER_EVT_CONNECTED = "connected";
export const TRANSCODER_EVT_DISCONNECTED = "disconnected";

let _instance = null;

/**
 * Used for bidirectional communication with main app and transcoder app.
 *
 * It is currently only designed for communication with a single transcoder
 * app thread from the main app.
 *
 * IMPORTANT: This relies on out-of-process message passing and future
 * refactoring should take that into consideration.
 */
export default class SplitAppMessageBus extends PhantomCore {
  constructor(role) {
    // Act as singleton
    if (_instance) {
      return _instance;
    }

    super();

    _instance = this;

    this._role = role;

    /**
     * Used by the main app to communicate with the transcoder app
     * @type {Window}
     */
    this._remoteWindowSource = null;

    // TODO: Extend SplitAppMessageBus w/ this?
    if (this._role === ROLE_MAIN_APP) {
      (() => {
        const _handleMessageEvent = evt => {
          const data = evt.data || {};

          switch (data.eventName) {
            case TRANSCODER_EVT_READY:
              console.debug("Transcoder is ready to accept commands");

              // Transcoder is online, ready to accept commands from main app
              this._remoteWindowSource = evt.source;

              this.emit(TRANSCODER_EVT_READY);

              break;

            case TRANSCODER_EVT_CONNECTED:
              console.debug("Transcoder connected");

              this.emit(TRANSCODER_EVT_CONNECTED);
              break;

            case TRANSCODER_EVT_DISCONNECTED:
              console.debug("Transcoder disconnected");

              this.emit(TRANSCODER_EVT_DISCONNECTED);
              break;

            default:
              // Silently ignore other messaes (i.e. CRA in development mode
              // will use this channel for its own messages)
              break;
          }
        };

        window.addEventListener("message", _handleMessageEvent);

        this.once(EVT_DESTROYED, () => {
          window.removeEventListener("message", _handleMessageEvent);
        });
      })();
    }

    // TODO: Extend SplitAppMessageBus w/ this?
    if (this._role === ROLE_TRANSCODER_APP) {
      (() => {
        const _handleMessageEvent = evt => {
          const data = evt.data || {};

          switch (data.eventName) {
            case MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION:
              this.emit(
                MAIN_APP_EVT_INIT_TRANSCODER_CONNECTION,
                evt.data.eventData
              );

              break;

            default:
              // Silently ignore other messaes (i.e. CRA in development mode
              // will use this channel for its own messages)
              break;
          }
        };

        window.addEventListener("message", _handleMessageEvent);

        this.once(EVT_DESTROYED, () => {
          window.removeEventListener("message", _handleMessageEvent);
        });
      })();
    }
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    _instance = null;

    await super.destroy();
  }

  /**
   * @param {string} eventName
   * @param {any} eventData? [optional]
   */
  sendEvent(eventName, eventData = null) {
    const message = {
      eventSourceRole: this._role,
      eventName,
      eventData,
    };

    switch (this._role) {
      case ROLE_MAIN_APP:
        this._remoteWindowSource.postMessage(message);

        break;

      case ROLE_TRANSCODER_APP:
        // window.opener is used for new tabs; window.parent is used for
        // iframes
        const ctrlWindow = window.opener || window.parent;

        if (ctrlWindow) {
          ctrlWindow.postMessage(message);
        }

        break;

      default:
        throw new Error(`Invalid role "${this._role}" for event sending`);
    }
  }
}

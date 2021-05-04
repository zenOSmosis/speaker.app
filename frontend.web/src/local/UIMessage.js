import SyncObject, { EVT_UPDATED, EVT_DESTROYED } from "sync-object";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

export { EVT_UPDATED, EVT_DESTROYED };

const _instances = {};

export default class UIMessage extends SyncObject {
  /**
   * @param {string} id
   * @return {UIMessage}
   */
  static getMessageWithId(id) {
    return _instances[id];
  }

  /**
   * @param {string} senderAddress
   * @return {UIMessage[]} An array of UIMessages.
   */
  /*
  static getMessagesWithsenderAddress(senderAddress) {
    return Object.values(_instances).filter(
      (instance) => instance._senderAddress === senderAddress
    );
  }
  */

  /**
   * @param {Object} initialState
   */
  constructor(initialState) {
    const DEFAULT_STATE = Object.freeze({
      // The deviceAddress of the message creator
      senderAddress:
        initialState.senderAddress ||
        (() => {
          throw new Error("senderAddress must be specified as initialState");
        })(),

      id: initialState.id || uuidv4(),

      // ISO 8601 string
      createDate: initialState.createDate || dayjs().toISOString(),

      body: "",
      isTyping: false,
      isSent: false,
      // seenBy: [],
      // reactions: [],
      // TODO: Use iso string
    });

    super({ ...DEFAULT_STATE, ...initialState });

    const { id, senderAddress } = this.getState();
    this._messageId = id;
    this._senderAddress = senderAddress;

    this._id = id;

    _instances[this._messageId] = this;
  }

  /**
   * @return {Promise<void>}
   */
  async destroy() {
    delete _instances[this._messageId];

    await super.destroy();
  }

  /**
   * @return {string} The message id which all participants in the network can
   * reference the message.
   */
  getId() {
    return this._id;
  }

  /*
  setState(updatedState, ...rest) {
    if (updatedState.isTyping) {
      // TODO: Handle auto timeout to unset this
    }

    super.setState(updatedState, ...rest);
  }
  */
}

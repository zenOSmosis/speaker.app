import SyncObject, { EVT_UPDATED, EVT_DESTROYED } from "@shared/SyncObject";
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

    const mergedInitialState = { ...DEFAULT_STATE, ...initialState };

    super(mergedInitialState);

    const { id, senderAddress } = mergedInitialState;
    this._messageId = id;
    this._senderAddress = senderAddress;

    _instances[this._messageId] = this;
    this.once(EVT_DESTROYED, () => delete _instances[this._messageId]);
  }

  setState(updatedState, ...rest) {
    if (updatedState.isTyping) {
      // TODO: Handle auto timeout to unset this
    }

    super.setState(updatedState, ...rest);
  }
}
